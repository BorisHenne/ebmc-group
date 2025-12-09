import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondEnvironment } from '@/lib/boondmanager-client'

function getEnvironment(request: NextRequest): BoondEnvironment {
  const env = request.nextUrl.searchParams.get('env') || 'sandbox'
  return env === 'production' ? 'production' : 'sandbox'
}

// GET - List/Search opportunities
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
    const result = await client.getOpportunities({
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
    console.error('BoondManager opportunities GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: 500 })
  }
}

// POST - Create opportunity (sandbox only)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const environment = getEnvironment(request)

  try {
    const body = await request.json()
    const client = createBoondClient(environment)

    const result = await client.createOpportunity({
      title: body.title,
      mode: body.mode,
      state: body.state,
      typeOf: body.typeOf,
      companyId: body.companyId,
      contactId: body.contactId,
      mainManagerId: body.mainManagerId,
      description: body.description,
      startDate: body.startDate,
      averageDailyPriceExcludingTax: body.dailyRate || body.averageDailyPriceExcludingTax,
    })

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager opportunities POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// PATCH - Update opportunity (sandbox only)
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
    if (data.title) updateData.title = data.title
    if (data.description) updateData.description = data.description
    if (data.startDate) updateData.startDate = data.startDate
    if (data.endDate) updateData.endDate = data.endDate
    if (data.dailyRate || data.averageDailyPriceExcludingTax) {
      updateData.averageDailyPriceExcludingTax = data.dailyRate || data.averageDailyPriceExcludingTax
    }
    if (data.state !== undefined) updateData.state = data.state

    const result = await client.updateOpportunity(id, updateData)

    return NextResponse.json({
      success: true,
      environment,
      data: result.data
    })

  } catch (error) {
    console.error('BoondManager opportunities PATCH error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}

// DELETE - Delete opportunity (sandbox only)
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
    await client.deleteOpportunity(parseInt(id))

    return NextResponse.json({
      success: true,
      environment,
      message: 'Opportunite supprimee'
    })

  } catch (error) {
    console.error('BoondManager opportunities DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      environment
    }, { status: error instanceof Error && error.message.includes('non autorisee') ? 403 : 500 })
  }
}
