import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment, BOOND_FEATURES } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// Feature disabled response
const CONTACTS_DISABLED_RESPONSE = {
  success: false,
  error: 'API Contacts desactivee - En attente des permissions BoondManager',
  disabled: true,
  data: [],
  meta: { totals: { rows: 0 } }
}

// GET - List/Search contacts
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  // Return empty data when contacts are disabled
  if (!BOOND_FEATURES.CONTACTS_ENABLED) {
    return NextResponse.json(CONTACTS_DISABLED_RESPONSE, { status: 200 })
  }

  const environment = getEnvironment(request)
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const keywords = searchParams.get('search') || searchParams.get('keywords') || undefined
  const company = searchParams.get('company') ? parseInt(searchParams.get('company')!) : undefined

  try {
    const client = createBoondClient(environment)
    const result = await client.getContacts({
      page,
      maxResults: limit,
      keywords,
      company,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data,
      meta: result.meta
    })

  } catch (error) {
    console.error('BoondManager contacts GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}

// POST - Create contact (sandbox only)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  if (!BOOND_FEATURES.CONTACTS_ENABLED) {
    return NextResponse.json(CONTACTS_DISABLED_RESPONSE, { status: 403 })
  }

  const environment = getEnvironment(request)

  try {
    const body = await request.json()
    const client = createBoondClient(environment)

    if (!body.companyId) {
      return NextResponse.json({ error: 'companyId requis' }, { status: 400 })
    }

    const result = await client.createContact({
      firstName: body.firstName,
      lastName: body.lastName,
      companyId: body.companyId,
      civility: body.civility,
      email: body.email,
      phone1: body.phone || body.phone1,
      position: body.position,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager contacts POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// PATCH - Update contact (sandbox only)
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  if (!BOOND_FEATURES.CONTACTS_ENABLED) {
    return NextResponse.json(CONTACTS_DISABLED_RESPONSE, { status: 403 })
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
    if (data.civility !== undefined) updateData.civility = data.civility
    if (data.email) updateData.email = data.email
    if (data.phone || data.phone1) updateData.phone1 = data.phone || data.phone1
    if (data.position) updateData.position = data.position

    const result = await client.updateContact(id, updateData)

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager contacts PATCH error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// DELETE - Delete contact (sandbox only)
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  if (!BOOND_FEATURES.CONTACTS_ENABLED) {
    return NextResponse.json(CONTACTS_DISABLED_RESPONSE, { status: 403 })
  }

  const environment = getEnvironment(request)
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const client = createBoondClient(environment)
    await client.deleteContact(parseInt(id))

    return NextResponse.json({
      success: true,
      environment,
      message: 'Contact supprime'
    })

  } catch (error) {
    console.error('BoondManager contacts DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}
