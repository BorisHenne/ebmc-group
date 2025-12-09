import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - List/Search projects
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = getEnvironment(request)
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const keywords = searchParams.get('search') || searchParams.get('keywords') || undefined
  const state = searchParams.get('state') ? parseInt(searchParams.get('state')!) : undefined
  const company = searchParams.get('company') ? parseInt(searchParams.get('company')!) : undefined

  try {
    const client = createBoondClient(environment)
    const result = await client.getProjects({
      page,
      maxResults: limit,
      keywords,
      state,
      company,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data,
      meta: result.meta
    })

  } catch (error) {
    console.error('BoondManager projects GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}
