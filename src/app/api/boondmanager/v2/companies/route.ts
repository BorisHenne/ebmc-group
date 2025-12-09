import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - List/Search companies
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
    const result = await client.getCompanies({
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
    console.error('BoondManager companies GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}

// POST - Create company (sandbox only)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = getEnvironment(request)

  try {
    const body = await request.json()
    const client = createBoondClient(environment)

    const result = await client.createCompany({
      name: body.name,
      phone1: body.phone || body.phone1,
      country: body.country,
      staff: body.staff,
      email: body.email,
      website: body.website,
      address: body.address,
      postcode: body.postcode,
      town: body.town,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager companies POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// PATCH - Update company (sandbox only)
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
    if (data.name) updateData.name = data.name
    if (data.phone || data.phone1) updateData.phone1 = data.phone || data.phone1
    if (data.country) updateData.country = data.country
    if (data.staff !== undefined) updateData.staff = data.staff
    if (data.email) updateData.email = data.email
    if (data.website) updateData.website = data.website
    if (data.state !== undefined) updateData.state = data.state

    const result = await client.updateCompany(id, updateData)

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager companies PATCH error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// DELETE - Delete company (sandbox only)
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
    await client.deleteCompany(parseInt(id))

    return NextResponse.json({
      success: true,
      environment,
      message: 'Societe supprimee'
    })

  } catch (error) {
    console.error('BoondManager companies DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}
