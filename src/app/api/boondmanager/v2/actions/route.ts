import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - List/Search actions
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const environment = getEnvironment(request)
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const resource = searchParams.get('resource') ? parseInt(searchParams.get('resource')!) : undefined
  const candidate = searchParams.get('candidate') ? parseInt(searchParams.get('candidate')!) : undefined
  const opportunity = searchParams.get('opportunity') ? parseInt(searchParams.get('opportunity')!) : undefined
  const project = searchParams.get('project') ? parseInt(searchParams.get('project')!) : undefined
  const typeOf = searchParams.get('typeOf') ? parseInt(searchParams.get('typeOf')!) : undefined
  const state = searchParams.get('state') ? parseInt(searchParams.get('state')!) : undefined

  try {
    const client = createBoondClient(environment)
    const result = await client.getActions({
      page,
      maxResults: limit,
      resource,
      candidate,
      opportunity,
      project,
      typeOf,
      state,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data,
      meta: result.meta
    })

  } catch (error) {
    console.error('BoondManager actions GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}

// POST - Create action (sandbox only)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const environment = getEnvironment(request)

  try {
    const body = await request.json()
    const client = createBoondClient(environment)

    const result = await client.createAction({
      typeOf: body.typeOf,
      state: body.state,
      comment: body.comment,
      startDate: body.startDate,
      endDate: body.endDate,
      resourceId: body.resourceId,
      candidateId: body.candidateId,
      opportunityId: body.opportunityId,
      projectId: body.projectId,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager actions POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}
