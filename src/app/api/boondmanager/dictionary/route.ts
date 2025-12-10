import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'
import { hasPermission } from '@/lib/roles'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'production'
  return env === 'sandbox' ? 'sandbox' : 'production'
}

// GET - Fetch BoondManager dictionary (states, action types, etc.)
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Check permission
  if (!hasPermission(session.role, 'boondManagerAccess')) {
    return NextResponse.json({
      error: 'Permission refusée'
    }, { status: 403 })
  }

  const environment = getEnvironment(request)

  try {
    const client = createBoondClient(environment)
    const dictionary = await client.getDictionary()

    const attrs = dictionary.data.attributes

    // Extract relevant states and types for recruitment
    const candidateStates = attrs.candidateStates?.map(s => ({
      id: typeof s.id === 'string' ? parseInt(s.id, 10) : s.id,
      value: s.value,
    })) || []

    const actionTypes = attrs.actionTypes?.map(t => ({
      id: typeof t.id === 'string' ? parseInt(t.id, 10) : t.id,
      value: t.value,
    })) || []

    const positioningStates = attrs.positioningStates?.map(s => ({
      id: typeof s.id === 'string' ? parseInt(s.id, 10) : s.id,
      value: s.value,
    })) || []

    const resourceStates = attrs.resourceStates?.map(s => ({
      id: typeof s.id === 'string' ? parseInt(s.id, 10) : s.id,
      value: s.value,
    })) || []

    return NextResponse.json({
      success: true,
      environment,
      dictionary: {
        candidateStates,
        actionTypes,
        positioningStates,
        resourceStates,
      },
      explanation: {
        candidateStates: 'États généraux des candidats dans BoondManager (pas le parcours de recrutement)',
        actionTypes: 'Types d\'actions disponibles - utilisés pour déterminer l\'avancement du recrutement',
        positioningStates: 'États des positionnements (candidat sur une opportunité)',
        resourceStates: 'États des ressources/consultants',
      },
      recruitmentMapping: {
        description: 'Notre mapping des types d\'actions vers les états du pipeline de recrutement',
        mapping: [
          { actionType: 'Démarrage (type 5)', recruitmentState: 'Embauché (state 6)' },
          { actionType: 'Proposition (type 4)', recruitmentState: 'Proposition (state 5)' },
          { actionType: 'Entretien client/interne (type 2/3)', recruitmentState: 'Entretien (state 4)' },
          { actionType: 'Positionnement (type 1)', recruitmentState: 'En cours (state 3)' },
          { actionType: 'Appel/Email/Réunion (type 6/7/8)', recruitmentState: 'A qualifier (state 1)' },
          { actionType: 'Autre ou aucune action', recruitmentState: 'Nouveau (state 0)' },
        ],
      },
    })

  } catch (error) {
    console.error('Error fetching BoondManager dictionary:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
