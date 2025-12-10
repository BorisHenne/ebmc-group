import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  createBoondClient,
  BoondEnvironment,
  BoondManagerClient,
  BoondResource,
  BoondCandidate,
  BoondOpportunity,
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

    const client = createBoondClient(environment)

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

    // Execute import with available data
    const result = await boondImportService.importAll(
      resources,
      candidates,
      opportunities,
      { createUsersFromResources }
    )

    // Build response with permission errors log
    const response: Record<string, unknown> = {
      success: true,
      environment,
      result,
      message: `Import terminé: ${result.totalCreated} créés, ${result.totalUpdated} mis à jour, ${result.totalSkipped} ignorés`,
    }

    // Add permission errors log if any
    if (permissionErrors.length > 0) {
      response.permissionLog = {
        skippedEntities,
        errors: permissionErrors,
        message: `${skippedEntities.length} entité(s) ignorée(s) car droits manquants sur BoondManager`,
      }
      response.message = `${response.message}. ATTENTION: ${skippedEntities.join(', ')} ignoré(s) - droits manquants`
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
