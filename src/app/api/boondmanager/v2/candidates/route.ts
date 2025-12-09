import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - List/Search candidates
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

  try {
    const client = createBoondClient(environment)
    const result = await client.getCandidates({
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
    console.error('BoondManager candidates GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}

// POST - Create candidate (sandbox only)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = getEnvironment(request)

  try {
    const body = await request.json()
    const client = createBoondClient(environment)

    const result = await client.createCandidate({
      firstName: body.firstName,
      lastName: body.lastName,
      civility: body.civility,
      email: body.email,
      phone1: body.phone || body.phone1,
      title: body.title,
      origin: body.source || body.origin,
      state: body.state,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager candidates POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// PATCH - Update candidate (sandbox only)
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
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
    if (data.source || data.origin) updateData.origin = data.source || data.origin
    if (data.state !== undefined) updateData.state = data.state

    const result = await client.updateCandidate(id, updateData)

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager candidates PATCH error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// DELETE - Delete candidate (sandbox only)
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = getEnvironment(request)
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const client = createBoondClient(environment)
    await client.deleteCandidate(parseInt(id))

    return NextResponse.json({
      success: true,
      environment,
      message: 'Candidat supprime'
    })

  } catch (error) {
    console.error('BoondManager candidates DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}
