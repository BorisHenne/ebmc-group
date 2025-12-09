import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getBoondSyncService } from '@/lib/boondmanager-sync'

// GET - Export data from an environment
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = request.nextUrl.searchParams.get('env') === 'production' ? 'production' : 'sandbox'
  const format = request.nextUrl.searchParams.get('format') || 'json'
  const clean = request.nextUrl.searchParams.get('clean') === 'true'
  const entity = request.nextUrl.searchParams.get('entity') // Optional: specific entity type

  try {
    const syncService = getBoondSyncService()
    let data = await syncService.fetchAllData(environment)

    // Apply cleaning if requested
    if (clean) {
      data = syncService.cleanData(data)
    }

    if (format === 'csv' && entity) {
      // Export specific entity as CSV
      const entityMap: Record<string, { items: Array<{ id: number; attributes: Record<string, unknown> }>; fields: string[] }> = {
        candidates: {
          items: data.entities.candidates,
          fields: ['firstName', 'lastName', 'email', 'phone1', 'title', 'state', 'origin', 'creationDate']
        },
        resources: {
          items: data.entities.resources,
          fields: ['firstName', 'lastName', 'email', 'phone1', 'title', 'state', 'creationDate']
        },
        opportunities: {
          items: data.entities.opportunities,
          fields: ['title', 'reference', 'state', 'startDate', 'averageDailyPriceExcludingTax', 'creationDate']
        },
        companies: {
          items: data.entities.companies,
          fields: ['name', 'email', 'phone1', 'town', 'country', 'state', 'creationDate']
        },
        contacts: {
          items: data.entities.contacts,
          fields: ['firstName', 'lastName', 'email', 'phone1', 'position', 'creationDate']
        },
        projects: {
          items: data.entities.projects,
          fields: ['title', 'reference', 'state', 'startDate', 'endDate', 'creationDate']
        }
      }

      const entityData = entityMap[entity]
      if (!entityData) {
        return NextResponse.json({ error: 'Entite invalide' }, { status: 400 })
      }

      const csv = syncService.exportToCSV(entityData.items, entityData.fields)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${entity}_${environment}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default: JSON export
    const json = syncService.exportToJSON(data)

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="boondmanager_${environment}_${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

// POST - Clean data and return cleaned version (preview)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = request.nextUrl.searchParams.get('env') === 'production' ? 'production' : 'sandbox'

  try {
    const syncService = getBoondSyncService()
    const data = await syncService.fetchAllData(environment)
    const cleanedData = syncService.cleanData(data)

    // Return comparison stats
    return NextResponse.json({
      success: true,
      environment,
      original: data.stats,
      cleaned: cleanedData.stats,
      data: cleanedData
    })

  } catch (error) {
    console.error('Clean preview error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
