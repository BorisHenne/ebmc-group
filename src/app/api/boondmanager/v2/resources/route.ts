import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - List/Search resources
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const environment = getEnvironment(request)
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const keywords = searchParams.get('search') || searchParams.get('keywords') || undefined
  const state = searchParams.get('state') ? parseInt(searchParams.get('state')!) : undefined

  try {
    const client = createBoondClient(environment)
    const result = await client.getResources({
      page,
      maxResults: limit,
      keywords,
      state,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data,
      meta: result.meta
    })

  } catch (error) {
    console.error('BoondManager resources GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}

// POST - Create resource (sandbox only)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const environment = getEnvironment(request)

  try {
    const body = await request.json()
    const client = createBoondClient(environment)

    const result = await client.createResource({
      firstName: body.firstName,
      lastName: body.lastName,
      civility: body.civility,
      email: body.email,
      phone1: body.phone || body.phone1,
      title: body.title,
      state: body.state,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager resources POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// PATCH - Update resource (sandbox only)
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const environment = getEnvironment(request)

  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const client = createBoondClient(environment)

    const updateData: Record<string, unknown> = {}
    if (data.firstName) updateData.firstName = data.firstName
    if (data.lastName) updateData.lastName = data.lastName
    if (data.email) updateData.email = data.email
    if (data.civility !== undefined) updateData.civility = data.civility
    if (data.phone || data.phone1) updateData.phone1 = data.phone || data.phone1
    if (data.title) updateData.title = data.title
    if (data.state !== undefined) updateData.state = data.state

    const result = await client.updateResource(id, updateData)

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager resources PATCH error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// DELETE - Delete resource (sandbox only)
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const environment = getEnvironment(request)
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const client = createBoondClient(environment)
    await client.deleteResource(parseInt(id))

    return NextResponse.json({
      success: true,
      environment,
      message: 'Ressource supprimee'
    })

  } catch (error) {
    console.error('BoondManager resources DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}
