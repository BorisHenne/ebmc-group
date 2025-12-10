import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  BOOND_CREDENTIALS,
  BOOND_BASE_URL,
  BoondEnvironment,
} from '@/lib/boondmanager-client'
import { SignJWT } from 'jose'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'

// Debug endpoint to diagnose sandbox/prod issue
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    baseUrl: BOOND_BASE_URL,
    tests: [],
  }

  // Test 1: Verify credentials are different
  const test1 = {
    name: 'Credentials Difference',
    production: {
      userToken: BOOND_CREDENTIALS.production.userToken,
      clientToken: BOOND_CREDENTIALS.production.clientToken,
      clientKey: BOOND_CREDENTIALS.production.clientKey.substring(0, 8) + '...',
    },
    sandbox: {
      userToken: BOOND_CREDENTIALS.sandbox.userToken,
      clientToken: BOOND_CREDENTIALS.sandbox.clientToken,
      clientKey: BOOND_CREDENTIALS.sandbox.clientKey.substring(0, 8) + '...',
    },
    tokensAreDifferent: BOOND_CREDENTIALS.production.userToken !== BOOND_CREDENTIALS.sandbox.userToken,
    passed: BOOND_CREDENTIALS.production.userToken !== BOOND_CREDENTIALS.sandbox.userToken,
  }
  results.tests = [...(results.tests as unknown[]), test1]

  // Test 2: Generate JWT for both environments and verify they're different
  const generateJWT = async (env: BoondEnvironment) => {
    const creds = BOOND_CREDENTIALS[env]
    const secret = new TextEncoder().encode(creds.clientKey)

    const jwt = await new SignJWT({
      userToken: creds.userToken,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret)

    return jwt
  }

  const prodJWT = await generateJWT('production')
  const sandboxJWT = await generateJWT('sandbox')

  const test2 = {
    name: 'JWT Generation',
    productionJWT: prodJWT.substring(0, 50) + '...',
    sandboxJWT: sandboxJWT.substring(0, 50) + '...',
    jwtsAreDifferent: prodJWT !== sandboxJWT,
    passed: prodJWT !== sandboxJWT,
  }
  results.tests = [...(results.tests as unknown[]), test2]

  // Test 3: Make actual API calls to both environments and compare
  const fetchFromBoond = async (env: BoondEnvironment) => {
    const creds = BOOND_CREDENTIALS[env]
    const secret = new TextEncoder().encode(creds.clientKey)

    const jwt = await new SignJWT({
      userToken: creds.userToken,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret)

    try {
      const response = await fetch(`${BOOND_BASE_URL}/candidates?maxResults=1`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Jwt-App-BoondManager': jwt,
        },
        cache: 'no-store',
      })

      const status = response.status
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      let data = null
      let totalRows = null
      if (response.ok) {
        data = await response.json()
        totalRows = data?.meta?.totals?.rows
      } else {
        data = await response.text()
      }

      return {
        status,
        ok: response.ok,
        totalRows,
        responseHeaders: headers,
        error: response.ok ? null : data,
      }
    } catch (error) {
      return {
        status: 0,
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  const prodResult = await fetchFromBoond('production')
  const sandboxResult = await fetchFromBoond('sandbox')

  const test3 = {
    name: 'API Response Comparison',
    production: prodResult,
    sandbox: sandboxResult,
    totalRowsAreDifferent: prodResult.totalRows !== sandboxResult.totalRows,
    passed: prodResult.ok && sandboxResult.ok && prodResult.totalRows !== sandboxResult.totalRows,
    issue: prodResult.totalRows === sandboxResult.totalRows
      ? `SAME DATA! Both return ${prodResult.totalRows} rows - JWT may not be switching spaces`
      : null,
  }
  results.tests = [...(results.tests as unknown[]), test3]

  // Test 4: Check if the userToken is being used in the right header
  const test4 = {
    name: 'Header Configuration',
    headerName: 'X-Jwt-App-BoondManager',
    productionUserToken: BOOND_CREDENTIALS.production.userToken,
    sandboxUserToken: BOOND_CREDENTIALS.sandbox.userToken,
    note: 'JWT payload contains userToken which should identify the space (LMGC vs LMGC-SANDBOX)',
  }
  results.tests = [...(results.tests as unknown[]), test4]

  // Summary
  const allTests = results.tests as Array<{ passed?: boolean }>
  results.summary = {
    totalTests: allTests.length,
    passed: allTests.filter(t => t.passed === true).length,
    failed: allTests.filter(t => t.passed === false).length,
    inconclusive: allTests.filter(t => t.passed === undefined).length,
  }

  // Diagnosis
  if (prodResult.totalRows === sandboxResult.totalRows) {
    results.diagnosis = {
      problem: 'Sandbox returns same data as production',
      possibleCauses: [
        '1. JWT userToken is not recognized by BoondManager to switch spaces',
        '2. The sandbox space (LMGC-SANDBOX) may not exist or is not configured',
        '3. BoondManager may require a different authentication method for space switching',
        '4. The clientKey used to sign JWT may be incorrect for sandbox',
      ],
      suggestion: 'Check BoondManager admin panel to verify LMGC-SANDBOX space exists and tokens are correct',
    }
  }

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
