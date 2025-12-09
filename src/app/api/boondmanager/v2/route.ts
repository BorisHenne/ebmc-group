import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  createBoondClient,
  BoondEnvironment,
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
      const currentUser = await client.getCurrentUser()

      return NextResponse.json({
        success: true,
        environment,
        currentUser: currentUser.data,
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
