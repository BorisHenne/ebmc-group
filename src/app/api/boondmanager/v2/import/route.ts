import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  createBoondClient,
  BoondEnvironment,
  BoondManagerClient,
  BoondResource,
  BoondCandidate,
  BoondOpportunity,
  BoondAction,
  BoondPermissionError,
} from '@/lib/boondmanager-client'
import { boondImportService } from '@/lib/boondmanager-import'
import { hasPermission } from '@/lib/roles'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'production'
  return env === 'sandbox' ? 'sandbox' : 'production'
}

// Permission error tracking
interface PermissionError {
  entity: string
  endpoint: string
  message: string
}

interface FetchResult<T> {
  data: T[]
  permissionError?: PermissionError
}

// Helper to fetch all pages of data from BoondManager with 403 handling
const PAGE_SIZE = 500

async function fetchAllResources(client: BoondManagerClient): Promise<FetchResult<BoondResource>> {
  try {
    const allData: BoondResource[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await client.getResources({ page, maxResults: PAGE_SIZE })
      const data = response.data || []
      allData.push(...data)

      const total = response.meta?.totals?.rows || 0
      hasMore = allData.length < total && data.length === PAGE_SIZE
      page++
    }

    return { data: allData }
  } catch (error) {
    if (error instanceof BoondPermissionError) {
      console.warn(`[SKIP] resources: ${error.message}`)
      return {
        data: [],
        permissionError: {
          entity: 'resources',
          endpoint: error.endpoint,
          message: error.message,
        },
      }
    }
    throw error
  }
}

async function fetchAllCandidates(client: BoondManagerClient): Promise<FetchResult<BoondCandidate>> {
  try {
    const allData: BoondCandidate[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await client.getCandidates({ page, maxResults: PAGE_SIZE })
      const data = response.data || []
      allData.push(...data)

      const total = response.meta?.totals?.rows || 0
      hasMore = allData.length < total && data.length === PAGE_SIZE
      page++
    }

    return { data: allData }
  } catch (error) {
    if (error instanceof BoondPermissionError) {
      console.warn(`[SKIP] candidates: ${error.message}`)
      return {
        data: [],
        permissionError: {
          entity: 'candidates',
          endpoint: error.endpoint,
          message: error.message,
        },
      }
    }
    throw error
  }
}

async function fetchAllOpportunities(client: BoondManagerClient): Promise<FetchResult<BoondOpportunity>> {
  try {
    const allData: BoondOpportunity[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await client.getOpportunities({ page, maxResults: PAGE_SIZE })
      const data = response.data || []
      allData.push(...data)

      const total = response.meta?.totals?.rows || 0
      hasMore = allData.length < total && data.length === PAGE_SIZE
      page++
    }

    return { data: allData }
  } catch (error) {
    if (error instanceof BoondPermissionError) {
      console.warn(`[SKIP] opportunities: ${error.message}`)
      return {
        data: [],
        permissionError: {
          entity: 'opportunities',
          endpoint: error.endpoint,
          message: error.message,
        },
      }
    }
    throw error
  }
}

/**
 * Fetch actions for all candidates and group them by candidateId
 * This is used to determine the recruitment pipeline state
 */
async function fetchActionsForCandidates(
  client: BoondManagerClient,
  candidateIds: number[]
): Promise<{
  actionsByCandidate: Map<number, BoondAction[]>
  permissionError?: PermissionError
}> {
  const actionsByCandidate = new Map<number, BoondAction[]>()

  if (candidateIds.length === 0) {
    return { actionsByCandidate }
  }

  try {
    // Fetch actions for each candidate (in batches to avoid too many requests)
    const BATCH_SIZE = 20
    for (let i = 0; i < candidateIds.length; i += BATCH_SIZE) {
      const batch = candidateIds.slice(i, i + BATCH_SIZE)

      // Fetch actions for this batch in parallel
      const results = await Promise.all(
        batch.map(async (candidateId) => {
          try {
            const response = await client.getCandidateActions(candidateId)
            return { candidateId, actions: response.data || [] }
          } catch (error) {
            // If we can't get actions for a specific candidate, skip it
            console.warn(`Could not fetch actions for candidate ${candidateId}:`, error)
            return { candidateId, actions: [] }
          }
        })
      )

      // Store results in map
      for (const { candidateId, actions } of results) {
        if (actions.length > 0) {
          actionsByCandidate.set(candidateId, actions)
        }
      }
    }

    console.log(`[Import] Fetched actions for ${actionsByCandidate.size} candidates with actions`)
    return { actionsByCandidate }
  } catch (error) {
    if (error instanceof BoondPermissionError) {
      console.warn(`[SKIP] actions: ${error.message}`)
      return {
        actionsByCandidate,
        permissionError: {
          entity: 'actions',
          endpoint: error.endpoint,
          message: error.message,
        },
      }
    }
    throw error
  }
}

// GET - Preview import (what would be imported)
// Resources → Consultants + Users
// Candidates → Candidates
// Opportunities → Jobs
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Check permission - only admin can import
  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({
      error: 'Permission refusée - Seuls les administrateurs peuvent importer des données'
    }, { status: 403 })
  }

  const environment = getEnvironment(request)

  try {
    const client = createBoondClient(environment)

    // Fetch ALL data from BoondManager with pagination (with 403 handling)
    const [resourcesResult, candidatesResult, opportunitiesResult] = await Promise.all([
      fetchAllResources(client),
      fetchAllCandidates(client),
      fetchAllOpportunities(client),
    ])

    // Collect permission errors
    const permissionErrors: PermissionError[] = []
    const skippedEntities: string[] = []

    if (resourcesResult.permissionError) {
      permissionErrors.push(resourcesResult.permissionError)
      skippedEntities.push('resources')
    }
    if (candidatesResult.permissionError) {
      permissionErrors.push(candidatesResult.permissionError)
      skippedEntities.push('candidates')
    }
    if (opportunitiesResult.permissionError) {
      permissionErrors.push(opportunitiesResult.permissionError)
      skippedEntities.push('opportunities')
    }

    const resources = resourcesResult.data
    const candidates = candidatesResult.data
    const opportunities = opportunitiesResult.data

    // Preview what would be imported
    const preview = await boondImportService.previewImport(
      resources,
      candidates,
      opportunities
    )

    // Build response with permission errors log
    const response: Record<string, unknown> = {
      success: true,
      environment,
      preview,
      totals: {
        resources: resources.length,
        candidates: candidates.length,
        opportunities: opportunities.length,
      },
      message: 'Aperçu de l\'import. Utilisez POST pour exécuter l\'import.',
    }

    // Add permission errors log if any
    if (permissionErrors.length > 0) {
      response.permissionLog = {
        skippedEntities,
        errors: permissionErrors,
        message: `${skippedEntities.length} entité(s) ignorée(s) - Demandez les droits d'accès à BoondManager`,
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('BoondManager import preview error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}

// POST - Execute import
// Resources → Consultants + Users
// Candidates → Candidates
// Opportunities → Jobs
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Check permission - only admin can import
  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({
      error: 'Permission refusée - Seuls les administrateurs peuvent importer des données'
    }, { status: 403 })
  }

  const environment = getEnvironment(request)

  try {
    const body = await request.json().catch(() => ({}))
    const {
      entities = ['resources', 'candidates', 'opportunities'],
      options = {},
    } = body

    const importResources = entities.includes('resources')
    const importCandidates = entities.includes('candidates')
    const importOpportunities = entities.includes('opportunities')
    const createUsersFromResources = options.createUsersFromResources !== false
    const cleanBeforeImport = options.cleanBeforeImport === true

    const client = createBoondClient(environment)

    // If cleanBeforeImport is set, clear the candidates collection first
    let cleanedCount = 0
    if (cleanBeforeImport && importCandidates) {
      console.log('[Import] Cleaning candidates collection before import...')
      const { connectToDatabase } = await import('@/lib/mongodb')
      const db = await connectToDatabase()
      const deleteResult = await db.collection('candidates').deleteMany({})
      cleanedCount = deleteResult.deletedCount
      console.log(`[Import] Deleted ${cleanedCount} existing candidates`)
    }

    // Fetch ALL data from BoondManager with pagination (with 403 handling)
    const [resourcesResult, candidatesResult, opportunitiesResult] = await Promise.all([
      importResources
        ? fetchAllResources(client)
        : Promise.resolve({ data: [] } as FetchResult<BoondResource>),
      importCandidates
        ? fetchAllCandidates(client)
        : Promise.resolve({ data: [] } as FetchResult<BoondCandidate>),
      importOpportunities
        ? fetchAllOpportunities(client)
        : Promise.resolve({ data: [] } as FetchResult<BoondOpportunity>),
    ])

    // Collect permission errors
    const permissionErrors: PermissionError[] = []
    const skippedEntities: string[] = []

    if (resourcesResult.permissionError) {
      permissionErrors.push(resourcesResult.permissionError)
      skippedEntities.push('resources')
    }
    if (candidatesResult.permissionError) {
      permissionErrors.push(candidatesResult.permissionError)
      skippedEntities.push('candidates')
    }
    if (opportunitiesResult.permissionError) {
      permissionErrors.push(opportunitiesResult.permissionError)
      skippedEntities.push('opportunities')
    }

    const resources = resourcesResult.data
    const candidates = candidatesResult.data
    const opportunities = opportunitiesResult.data

    // Fetch dictionary to get candidateStates and candidateTypes labels
    let candidateStates: Map<number, string> = new Map()
    let candidateTypes: Map<number, string> = new Map()

    if (candidates.length > 0 && importCandidates) {
      console.log(`[Import] Fetching dictionary for state/type labels...`)
      try {
        const dictionary = await client.getDictionary()
        const setting = (dictionary?.data as Record<string, unknown>)?.setting as Record<string, unknown> | undefined

        // Extract candidateStates from dictionary
        const statesObj = setting?.state as Record<string, unknown> | undefined
        const candidateStatesArr = statesObj?.candidate as Array<{ id: number | string; value: string }> | undefined
        if (candidateStatesArr && Array.isArray(candidateStatesArr)) {
          for (const state of candidateStatesArr) {
            const id = typeof state.id === 'string' ? parseInt(state.id, 10) : state.id
            candidateStates.set(id, state.value)
          }
          console.log(`[Import] Loaded ${candidateStates.size} candidate states from dictionary`)
        }

        // Extract candidateTypes from dictionary
        const typesObj = setting?.typeOf as Record<string, unknown> | undefined
        const candidateTypesArr = typesObj?.candidate as Array<{ id: number | string; value: string }> | undefined
        if (candidateTypesArr && Array.isArray(candidateTypesArr)) {
          for (const type of candidateTypesArr) {
            const id = typeof type.id === 'string' ? parseInt(type.id, 10) : type.id
            candidateTypes.set(id, type.value)
          }
          console.log(`[Import] Loaded ${candidateTypes.size} candidate types from dictionary`)
        }
      } catch (dictError) {
        console.warn('[Import] Could not fetch dictionary - candidates will use BoondManager stateLabel directly:', dictError)
        permissionErrors.push({
          entity: 'dictionary',
          endpoint: '/api/application/dictionary',
          message: `Could not fetch dictionary for state labels: ${dictError instanceof Error ? dictError.message : 'Unknown error'}`
        })
      }
    }

    // Execute import with available data
    const result = await boondImportService.importAll(
      resources,
      candidates,
      opportunities,
      { createUsersFromResources, candidateStates, candidateTypes }
    )

    // Build response with permission errors log
    let message = cleanedCount > 0
      ? `Import terminé: ${cleanedCount} supprimés, ${result.totalCreated} créés, ${result.totalUpdated} mis à jour, ${result.totalSkipped} ignorés`
      : `Import terminé: ${result.totalCreated} créés, ${result.totalUpdated} mis à jour, ${result.totalSkipped} ignorés`

    const response: Record<string, unknown> = {
      success: true,
      environment,
      result,
      cleanedCount: cleanBeforeImport ? cleanedCount : undefined,
      message,
    }

    // Add permission errors log if any
    if (permissionErrors.length > 0) {
      response.permissionLog = {
        skippedEntities,
        errors: permissionErrors,
        message: `${skippedEntities.length} entité(s) ignorée(s) car droits manquants sur BoondManager`,
      }
      message = `${message}. ATTENTION: ${skippedEntities.join(', ')} ignoré(s) - droits manquants`
      response.message = message
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('BoondManager import error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
