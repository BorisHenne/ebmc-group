import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  createBoondClient,
  BoondEnvironment,
  BoondPermissionError,
  CANDIDATE_STATES,
  RESOURCE_STATES,
  OPPORTUNITY_STATES,
  COMPANY_STATES,
  PROJECT_STATES
} from '@/lib/boondmanager-client'

// Helper to get environment from request
function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// Main dashboard endpoint - GET stats and overview
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = getEnvironment(request)
  const type = request.nextUrl.searchParams.get('type') || 'stats'

  try {
    const client = createBoondClient(environment)

    if (type === 'stats') {
      const stats = await client.getDashboardStats()

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
            candidates: CANDIDATE_STATES,
            resources: RESOURCE_STATES,
            opportunities: OPPORTUNITY_STATES,
            companies: COMPANY_STATES,
            projects: PROJECT_STATES,
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
