import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment, BoondManagerClient, BoondResource, BoondCandidate, BoondOpportunity } from '@/lib/boondmanager-client'
import { boondImportService } from '@/lib/boondmanager-import'
import { hasPermission } from '@/lib/roles'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'production'
  return env === 'sandbox' ? 'sandbox' : 'production'
}

// Helper to fetch all pages of data from BoondManager
const PAGE_SIZE = 500

async function fetchAllResources(client: BoondManagerClient): Promise<BoondResource[]> {
  const allData: BoondResource[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await client.getResources({ page, maxResults: PAGE_SIZE })
    const data = response.data || []
    allData.push(...data)

    // Check if there are more pages
    const total = response.meta?.totals?.rows || 0
    hasMore = allData.length < total && data.length === PAGE_SIZE
    page++
  }

  return allData
}

async function fetchAllCandidates(client: BoondManagerClient): Promise<BoondCandidate[]> {
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

  return allData
}

async function fetchAllOpportunities(client: BoondManagerClient): Promise<BoondOpportunity[]> {
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

  return allData
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
      error: 'Permission refusee - Seuls les administrateurs peuvent importer des donnees'
    }, { status: 403 })
  }

  const environment = getEnvironment(request)

  try {
    const client = createBoondClient(environment)

    // Fetch ALL data from BoondManager with pagination
    const [resources, candidates, opportunities] = await Promise.all([
      fetchAllResources(client),
      fetchAllCandidates(client),
      fetchAllOpportunities(client),
    ])

    // Preview what would be imported
    const preview = await boondImportService.previewImport(
      resources,
      candidates,
      opportunities
    )

    return NextResponse.json({
      success: true,
      environment,
      preview,
      totals: {
        resources: resources.length,
        candidates: candidates.length,
        opportunities: opportunities.length,
      },
      message: 'Apercu de l\'import. Utilisez POST pour executer l\'import.',
    })

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
      error: 'Permission refusee - Seuls les administrateurs peuvent importer des donnees'
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

    // Fetch ALL data from BoondManager with pagination (based on options)
    const [resources, candidates, opportunities] = await Promise.all([
      importResources
        ? fetchAllResources(client)
        : Promise.resolve([]),
      importCandidates
        ? fetchAllCandidates(client)
        : Promise.resolve([]),
      importOpportunities
        ? fetchAllOpportunities(client)
        : Promise.resolve([]),
    ])

    // Execute import
    const result = await boondImportService.importAll(
      resources,
      candidates,
      opportunities,
      { createUsersFromResources }
    )

    return NextResponse.json({
      success: true,
      environment,
      result,
      message: `Import terminé: ${result.totalCreated} créés, ${result.totalUpdated} mis à jour, ${result.totalSkipped} ignorés`,
    })

  } catch (error) {
    console.error('BoondManager import error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
