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

interface TestResult {
  name: string
  endpoint: string
  params: Record<string, string>
  status: number
  ok: boolean
  totalRows: number | null
  dataCount: number
  timing: string
  error: string | null
  sampleData?: unknown[]
  rawResponse?: string
}

// Helper to make API requests
async function testEndpoint(
  jwt: string,
  endpoint: string,
  params: Record<string, string> = {}
): Promise<TestResult> {
  const searchParams = new URLSearchParams(params)
  const url = `${BOOND_BASE_URL}${endpoint}?${searchParams.toString()}`

  const startTime = Date.now()
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Jwt-Client-BoondManager': jwt,
      },
      cache: 'no-store',
    })
    const endTime = Date.now()

    const rawText = await response.text()
    let data = null
    try {
      data = JSON.parse(rawText)
    } catch {
      // Not JSON
    }

    return {
      name: `${endpoint} with ${JSON.stringify(params)}`,
      endpoint,
      params,
      status: response.status,
      ok: response.ok,
      totalRows: data?.meta?.totals?.rows ?? null,
      dataCount: Array.isArray(data?.data) ? data.data.length : 0,
      timing: `${endTime - startTime}ms`,
      error: response.ok ? null : rawText.substring(0, 500),
      sampleData: Array.isArray(data?.data) ? data.data.slice(0, 2) : undefined,
      rawResponse: !response.ok ? rawText.substring(0, 1000) : undefined,
    }
  } catch (error) {
    return {
      name: `${endpoint} with ${JSON.stringify(params)}`,
      endpoint,
      params,
      status: 0,
      ok: false,
      totalRows: null,
      dataCount: 0,
      timing: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Debug endpoint to diagnose candidates API issue
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const env = (request.nextUrl.searchParams.get('env') || 'production') as BoondEnvironment
  const creds = BOOND_CREDENTIALS[env]

  // Generate JWT
  const secret = new TextEncoder().encode(creds.clientKey)
  const jwt = await new SignJWT({
    clientToken: creds.clientToken,
    userToken: creds.userToken,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret)

  const jwtPayload = decodeJwt(jwt)

  const results: {
    timestamp: string
    environment: string
    baseUrl: string
    credentials: {
      userToken: string
      userTokenDecoded: string
      clientToken: string
      clientTokenDecoded: string
    }
    jwtPayload: unknown
    tests: TestResult[]
    comparison: {
      resourcesWork: boolean
      candidatesWork: boolean
      opportunitiesWork: boolean
      diagnosis: string
    }
    recommendations: string[]
  } = {
    timestamp: new Date().toISOString(),
    environment: env,
    baseUrl: BOOND_BASE_URL,
    credentials: {
      userToken: creds.userToken,
      userTokenDecoded: Buffer.from(creds.userToken, 'hex').toString('utf-8'),
      clientToken: creds.clientToken,
      clientTokenDecoded: Buffer.from(creds.clientToken, 'hex').toString('utf-8'),
    },
    jwtPayload,
    tests: [],
    comparison: {
      resourcesWork: false,
      candidatesWork: false,
      opportunitiesWork: false,
      diagnosis: '',
    },
    recommendations: [],
  }

  // Test 1: Resources (this works - baseline)
  const resourcesTest = await testEndpoint(jwt, '/resources', { maxResults: '10' })
  resourcesTest.name = '1. Resources (baseline - should work)'
  results.tests.push(resourcesTest)
  results.comparison.resourcesWork = resourcesTest.ok && resourcesTest.dataCount > 0

  // Test 2: Opportunities (this works - baseline)
  const opportunitiesTest = await testEndpoint(jwt, '/opportunities', { maxResults: '10' })
  opportunitiesTest.name = '2. Opportunities (baseline - should work)'
  results.tests.push(opportunitiesTest)
  results.comparison.opportunitiesWork = opportunitiesTest.ok && opportunitiesTest.dataCount > 0

  // Test 3: Candidates - basic (no params)
  const candidatesBasic = await testEndpoint(jwt, '/candidates', { maxResults: '10' })
  candidatesBasic.name = '3. Candidates - basic (no params)'
  results.tests.push(candidatesBasic)

  // Test 4: Candidates - with wildcard search
  const candidatesWildcard = await testEndpoint(jwt, '/candidates', {
    maxResults: '10',
    keywords: '*'
  })
  candidatesWildcard.name = '4. Candidates - wildcard search (*)'
  results.tests.push(candidatesWildcard)

  // Test 5: Candidates - with perimeter params
  const candidatesPerimeter = await testEndpoint(jwt, '/candidates', {
    maxResults: '10',
    perimeterAgency: 'all',
    perimeterManager: 'all'
  })
  candidatesPerimeter.name = '5. Candidates - perimeter all'
  results.tests.push(candidatesPerimeter)

  // Test 6: Candidates - search with letter 'a'
  const candidatesSearchA = await testEndpoint(jwt, '/candidates', {
    maxResults: '10',
    keywords: 'a'
  })
  candidatesSearchA.name = '6. Candidates - search "a"'
  results.tests.push(candidatesSearchA)

  // Test 7: Candidates - with sort
  const candidatesSort = await testEndpoint(jwt, '/candidates', {
    maxResults: '10',
    sort: '-updateDate'
  })
  candidatesSort.name = '7. Candidates - with sort -updateDate'
  results.tests.push(candidatesSort)

  // Test 8: Candidates - state filter (all states)
  for (const state of [0, 1, 2, 3]) {
    const candidatesState = await testEndpoint(jwt, '/candidates', {
      maxResults: '10',
      state: state.toString()
    })
    candidatesState.name = `8.${state}. Candidates - state=${state}`
    results.tests.push(candidatesState)
  }

  // Test 9: Try /candidates/search endpoint if it exists
  const candidatesSearch = await testEndpoint(jwt, '/candidates/search', {
    maxResults: '10'
  })
  candidatesSearch.name = '9. Candidates /search endpoint'
  results.tests.push(candidatesSearch)

  // Test 10: Application current-user (check permissions)
  const currentUser = await testEndpoint(jwt, '/application/current-user', {})
  currentUser.name = '10. Current user (check permissions)'
  results.tests.push(currentUser)

  // Test 11: Application dictionary - check candidate states
  const dictionary = await testEndpoint(jwt, '/application/dictionary', {})
  dictionary.name = '11. Dictionary (candidate states)'
  results.tests.push(dictionary)

  // Analyze results
  const candidateTests = results.tests.filter(t => t.endpoint === '/candidates')
  const anyCandidatesFound = candidateTests.some(t => t.dataCount > 0 || (t.totalRows ?? 0) > 0)
  results.comparison.candidatesWork = anyCandidatesFound

  // Generate diagnosis
  if (results.comparison.resourcesWork && results.comparison.opportunitiesWork && !results.comparison.candidatesWork) {
    results.comparison.diagnosis = 'PROBLÈME: Resources et Opportunities fonctionnent mais Candidates retourne 0 résultats'
    results.recommendations = [
      '1. Vérifier dans l\'interface BoondManager web si des candidats existent',
      '2. Vérifier les permissions du compte API pour accéder aux candidats',
      '3. Possible que tous les candidats soient déjà convertis en Resources (employés)',
      '4. Contacter le support BoondManager pour vérifier les droits d\'accès API aux candidats',
    ]
  } else if (!results.comparison.resourcesWork && !results.comparison.candidatesWork) {
    results.comparison.diagnosis = 'PROBLÈME: Aucune donnée retournée - problème d\'authentification général'
    results.recommendations = [
      '1. Vérifier les tokens JWT',
      '2. Vérifier que le compte API est actif',
    ]
  } else if (anyCandidatesFound) {
    results.comparison.diagnosis = 'OK: Des candidats ont été trouvés avec certains paramètres'
    // Find which params worked
    const workingTest = candidateTests.find(t => t.dataCount > 0)
    if (workingTest) {
      results.recommendations = [
        `Paramètres qui fonctionnent: ${JSON.stringify(workingTest.params)}`,
      ]
    }
  } else {
    results.comparison.diagnosis = 'Résultats mixtes - analyse manuelle nécessaire'
  }

  // Summary
  const summary = {
    totalTests: results.tests.length,
    passed: results.tests.filter(t => t.ok && t.dataCount > 0).length,
    failed: results.tests.filter(t => !t.ok).length,
    empty: results.tests.filter(t => t.ok && t.dataCount === 0).length,
  }

  return NextResponse.json({
    ...results,
    summary,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
