import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getBoondSyncService } from '@/lib/boondmanager-sync'

// GET - Analyze data quality for an environment
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = request.nextUrl.searchParams.get('env') === 'production' ? 'production' : 'sandbox'

  try {
    const syncService = getBoondSyncService()
    const analysis = await syncService.analyzeAllDataQuality(environment)

    return NextResponse.json({
      success: true,
      environment,
      data: analysis
    })

  } catch (error) {
    console.error('Quality analysis error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
