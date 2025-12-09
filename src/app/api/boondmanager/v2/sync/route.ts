import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getBoondSyncService } from '@/lib/boondmanager-sync'

// GET - Fetch all data from an environment
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = request.nextUrl.searchParams.get('env') === 'production' ? 'production' : 'sandbox'

  try {
    const syncService = getBoondSyncService()
    const data = await syncService.fetchAllData(environment)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Fetch all data error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

// POST - Start sync from Production to Sandbox
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    const syncService = getBoondSyncService()
    const result = await syncService.syncProdToSandbox()

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
