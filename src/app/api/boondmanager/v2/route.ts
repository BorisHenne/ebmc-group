import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  createBoondClient,
  BoondEnvironment,
  BoondPermissionError,
  BOOND_CREDENTIALS,
} from '@/lib/boondmanager-client'
import { getAllStates } from '@/lib/boondmanager-dictionary'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'

// Helper to get environment from request
function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  console.log(`[API] Request for environment: ${env}`)
  console.log(`[API] Using credentials with clientToken: ${BOOND_CREDENTIALS[env as BoondEnvironment]?.clientToken}`)
  return env === 'production' ? 'production' : 'sandbox'
}

// Main dashboard endpoint - GET stats and overview
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const environment = getEnvironment(request)
  const type = request.nextUrl.searchParams.get('type') || 'stats'

  try {
    const client = createBoondClient(environment)

    if (type === 'stats') {
      // Fetch stats and state labels in parallel
      const [stats, allStates] = await Promise.all([
        client.getDashboardStats(),
        getAllStates(environment),
      ])

      // Try to get current user, but don't fail if it errors
      let currentUser = null
      try {
        const userResponse = await client.getCurrentUser()
        currentUser = userResponse.data
      } catch (userError) {
        console.warn('Could not fetch current user:', userError)
      }

      return NextResponse.json({
        success: true,
        environment,
        currentUser,
        data: {
          ...stats,
          stateLabels: {
            candidates: allStates.candidateStates,
            resources: allStates.resourceStates,
            opportunities: allStates.opportunityStates,
            companies: allStates.companyStates,
            projects: allStates.projectStates,
          }
        }
      })
    }

    if (type === 'current-user') {
      const currentUser = await client.getCurrentUser()
      return NextResponse.json({
        success: true,
        environment,
        data: currentUser.data
      })
    }

    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })

  } catch (error) {
    console.error('BoondManager API error:', error)

    // Handle permission errors specially
    if (error instanceof BoondPermissionError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        permissionError: true,
        endpoint: error.endpoint,
        feature: error.feature,
        environment,
        hint: 'Demandez les droits d\'acces a BoondManager pour cet endpoint'
      }, { status: 403 })
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
