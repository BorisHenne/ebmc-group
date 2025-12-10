import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  BOOND_CREDENTIALS,
  BOOND_BASE_URL,
  BoondEnvironment,
} from '@/lib/boondmanager-client'
import { SignJWT, decodeJwt } from 'jose'

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
    data: {
      production: {
        userToken: BOOND_CREDENTIALS.production.userToken,
        userTokenDecoded: Buffer.from(BOOND_CREDENTIALS.production.userToken, 'hex').toString('utf-8'),
        clientToken: BOOND_CREDENTIALS.production.clientToken,
        clientTokenDecoded: Buffer.from(BOOND_CREDENTIALS.production.clientToken, 'hex').toString('utf-8'),
        clientKey: BOOND_CREDENTIALS.production.clientKey,
      },
      sandbox: {
        userToken: BOOND_CREDENTIALS.sandbox.userToken,
        userTokenDecoded: Buffer.from(BOOND_CREDENTIALS.sandbox.userToken, 'hex').toString('utf-8'),
        clientToken: BOOND_CREDENTIALS.sandbox.clientToken,
        clientTokenDecoded: Buffer.from(BOOND_CREDENTIALS.sandbox.clientToken, 'hex').toString('utf-8'),
        clientKey: BOOND_CREDENTIALS.sandbox.clientKey,
      },
      comparison: {
        userTokensDifferent: BOOND_CREDENTIALS.production.userToken !== BOOND_CREDENTIALS.sandbox.userToken,
        clientTokensDifferent: BOOND_CREDENTIALS.production.clientToken !== BOOND_CREDENTIALS.sandbox.clientToken,
        clientKeysDifferent: BOOND_CREDENTIALS.production.clientKey !== BOOND_CREDENTIALS.sandbox.clientKey,
      }
    },
    passed: BOOND_CREDENTIALS.production.userToken !== BOOND_CREDENTIALS.sandbox.userToken,
  }
  results.tests = [...(results.tests as unknown[]), test1]

  // Test 2: Generate JWT for both environments and verify they're different
  const generateJWT = async (env: BoondEnvironment) => {
    const creds = BOOND_CREDENTIALS[env]
    const secret = new TextEncoder().encode(creds.clientKey)

    // Decode hex tokens to UTF-8 strings as BoondManager expects
    const decodedClientToken = Buffer.from(creds.clientToken, 'hex').toString('utf-8')
    const decodedUserToken = Buffer.from(creds.userToken, 'hex').toString('utf-8')

    const jwt = await new SignJWT({
      // clientToken identifies the application (decoded from hex)
      clientToken: decodedClientToken,
      // userToken identifies the user/space (decoded from hex)
      userToken: decodedUserToken,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret)

    return jwt
  }

  const prodJWT = await generateJWT('production')
  const sandboxJWT = await generateJWT('sandbox')

  // Decode JWTs to show payload
  const prodPayload = decodeJwt(prodJWT)
  const sandboxPayload = decodeJwt(sandboxJWT)

  const test2 = {
    name: 'JWT Generation',
    data: {
      production: {
        jwt: prodJWT,
        payload: prodPayload,
        header: { alg: 'HS256' },
      },
      sandbox: {
        jwt: sandboxJWT,
        payload: sandboxPayload,
        header: { alg: 'HS256' },
      },
      comparison: {
        jwtsAreDifferent: prodJWT !== sandboxJWT,
        payloadsAreDifferent: JSON.stringify(prodPayload) !== JSON.stringify(sandboxPayload),
      }
    },
    passed: prodJWT !== sandboxJWT,
  }
  results.tests = [...(results.tests as unknown[]), test2]

  // Test 3: Make actual API calls to both environments and compare
  const fetchFromBoond = async (env: BoondEnvironment, jwt: string) => {
    const requestUrl = `${BOOND_BASE_URL}/candidates?maxResults=5`
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Jwt-App-BoondManager': jwt,
      'x-Debug-Boondmanager': 'true',  // Enable debug mode for more error details
    }

    try {
      const startTime = Date.now()
      const response = await fetch(requestUrl, {
        headers: requestHeaders,
        cache: 'no-store',
      })
      const endTime = Date.now()

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let data = null
      let rawText = null
      if (response.ok) {
        rawText = await response.text()
        try {
          data = JSON.parse(rawText)
        } catch {
          data = rawText
        }
      } else {
        rawText = await response.text()
        data = rawText
      }

      // Extract useful info
      const totalRows = data?.meta?.totals?.rows
      const firstFewIds = data?.data?.slice(0, 5).map((item: { id: number }) => item.id)

      return {
        request: {
          url: requestUrl,
          method: 'GET',
          headers: requestHeaders,
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: responseHeaders,
          timing: `${endTime - startTime}ms`,
        },
        data: {
          totalRows,
          firstFewIds,
          meta: data?.meta,
          sampleData: data?.data?.slice(0, 2),
        },
        error: response.ok ? null : rawText,
      }
    } catch (error) {
      return {
        request: {
          url: requestUrl,
          method: 'GET',
          headers: requestHeaders,
        },
        response: {
          status: 0,
          ok: false,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  const prodResult = await fetchFromBoond('production', prodJWT)
  const sandboxResult = await fetchFromBoond('sandbox', sandboxJWT)

  const test3 = {
    name: 'API Response Comparison',
    data: {
      production: prodResult,
      sandbox: sandboxResult,
      comparison: {
        totalRowsAreDifferent: prodResult.data?.totalRows !== sandboxResult.data?.totalRows,
        productionRows: prodResult.data?.totalRows,
        sandboxRows: sandboxResult.data?.totalRows,
        sameIds: JSON.stringify(prodResult.data?.firstFewIds) === JSON.stringify(sandboxResult.data?.firstFewIds),
      }
    },
    passed: prodResult.response?.ok && sandboxResult.response?.ok && prodResult.data?.totalRows !== sandboxResult.data?.totalRows,
    issue: prodResult.data?.totalRows === sandboxResult.data?.totalRows
      ? `PROBLEME: Les deux environnements retournent ${prodResult.data?.totalRows} lignes avec les memes IDs - Le JWT ne change pas l'espace`
      : null,
  }
  results.tests = [...(results.tests as unknown[]), test3]

  // Test 4: Check header configuration and alternatives
  const test4 = {
    name: 'Header Configuration',
    data: {
      currentMethod: {
        headerName: 'X-Jwt-App-BoondManager',
        description: 'JWT App authentication - JWT signe avec clientKey, contient userToken',
      },
      alternativeMethods: [
        {
          headerName: 'X-Jwt-Client-BoondManager',
          description: 'JWT Client authentication - peut necessiter un format different',
        },
        {
          headerName: 'Authorization: Basic',
          description: 'Basic Auth - username:password en base64',
        },
      ],
      tokenAnalysis: {
        productionUserToken: BOOND_CREDENTIALS.production.userToken,
        productionUserTokenDecoded: Buffer.from(BOOND_CREDENTIALS.production.userToken, 'hex').toString('utf-8'),
        sandboxUserToken: BOOND_CREDENTIALS.sandbox.userToken,
        sandboxUserTokenDecoded: Buffer.from(BOOND_CREDENTIALS.sandbox.userToken, 'hex').toString('utf-8'),
        note: 'Le userToken decode devrait identifier l\'espace (ex: "322.ebmc" pour prod, "2.ebmc_sandbox" pour sandbox)',
      },
    },
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
  if (prodResult.data?.totalRows === sandboxResult.data?.totalRows) {
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
