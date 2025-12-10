import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'
import { boondImportService } from '@/lib/boondmanager-import'
import { hasPermission } from '@/lib/roles'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'production'
  return env === 'sandbox' ? 'sandbox' : 'production'
}

// GET - Preview import (what would be imported)
// Resources → Consultants + Users
// Opportunities → Jobs
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
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

    // Fetch data from BoondManager (only resources and opportunities)
    const [resources, opportunities] = await Promise.all([
      client.getResources({ maxResults: 500 }).then(r => r.data || []),
      client.getOpportunities({ maxResults: 500 }).then(r => r.data || []),
    ])

    // Preview what would be imported
    const preview = await boondImportService.previewImport(
      resources,
      opportunities
    )

    return NextResponse.json({
      success: true,
      environment,
      preview,
      totals: {
        resources: resources.length,
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
// Opportunities → Jobs
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
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
      entities = ['resources', 'opportunities'],
      options = {},
    } = body

    const importResources = entities.includes('resources')
    const importOpportunities = entities.includes('opportunities')
    const createUsersFromResources = options.createUsersFromResources !== false

    const client = createBoondClient(environment)

    // Fetch data from BoondManager based on options
    const [resources, opportunities] = await Promise.all([
      importResources
        ? client.getResources({ maxResults: 500 }).then(r => r.data || [])
        : Promise.resolve([]),
      importOpportunities
        ? client.getOpportunities({ maxResults: 500 }).then(r => r.data || [])
        : Promise.resolve([]),
    ])

    // Execute import
    const result = await boondImportService.importAll(
      resources,
      opportunities,
      { createUsersFromResources }
    )

    return NextResponse.json({
      success: true,
      environment,
      result,
      message: `Import termine: ${result.totalCreated} crees, ${result.totalUpdated} mis a jour, ${result.totalSkipped} ignores`,
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
