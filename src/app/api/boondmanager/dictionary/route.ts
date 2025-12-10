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
  if (!hasPermission(session.role, 'boondManager')) {
    return NextResponse.json({
      error: 'Permission refusée'
    }, { status: 403 })
  }

  const environment = getEnvironment(request)

  try {
    const client = createBoondClient(environment)
    const dictionary = await client.getDictionary()

    const attrs = dictionary.data.attributes

    // Helper to extract items from dictionary
    const extractItems = (items: typeof attrs.candidateStates) =>
      items?.map(s => ({
        id: typeof s.id === 'string' ? parseInt(s.id, 10) : s.id,
        value: s.value,
        color: s.color,
        isDefault: s.isDefault,
        isActive: s.isActive,
        order: s.order,
      })) || []

    // Extract all relevant states and types
    const candidateStates = extractItems(attrs.candidateStates)
    const candidateTypes = extractItems(attrs.candidateTypes)
    const actionTypes = extractItems(attrs.actionTypes)
    const positioningStates = extractItems(attrs.positioningStates)
    const resourceStates = extractItems(attrs.resourceStates)
    const resourceTypes = extractItems(attrs.resourceTypes)
    const opportunityStates = extractItems(attrs.opportunityStates)
    const opportunityTypes = extractItems(attrs.opportunityTypes)
    const origins = extractItems(attrs.origins)
    const sources = extractItems(attrs.sources)

    return NextResponse.json({
      success: true,
      environment,
      dictionary: {
        candidateStates,
        candidateTypes,  // Les "Étapes" du recrutement
        actionTypes,
        positioningStates,
        resourceStates,
        resourceTypes,
        opportunityStates,
        opportunityTypes,
        origins,
        sources,
      },
      // Also return the raw dictionary for inspection
      rawAttributes: Object.keys(attrs).reduce((acc, key) => {
        const value = attrs[key as keyof typeof attrs]
        if (Array.isArray(value) && value.length > 0) {
          acc[key] = {
            count: value.length,
            sample: value.slice(0, 3)
          }
        }
        return acc
      }, {} as Record<string, { count: number; sample: unknown[] }>),
      explanation: {
        candidateStates: 'États généraux des candidats (0-8)',
        candidateTypes: 'Types/Étapes des candidats - utilisés pour le parcours de recrutement (Vivier, Freelance, etc.)',
        actionTypes: 'Types d\'actions disponibles',
        positioningStates: 'États des positionnements',
        resourceStates: 'États des ressources/consultants',
        resourceTypes: 'Types de ressources',
        opportunityStates: 'États des opportunités',
        opportunityTypes: 'Types d\'opportunités',
        origins: 'Origines des candidats',
        sources: 'Sources des candidats',
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
