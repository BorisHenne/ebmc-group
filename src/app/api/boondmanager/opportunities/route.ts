import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { BoondManagerClient } from '@/lib/boondmanager'
import { hasPermission } from '@/lib/roles'

// GET - List opportunities
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'jobs')) {
    return NextResponse.json({ error: 'Permission refusee' }, { status: 403 })
  }

  const cookieStore = await cookies()
  const boondToken = cookieStore.get('boond-token')?.value
  const boondSubdomain = cookieStore.get('boond-subdomain')?.value

  if (!boondToken || !boondSubdomain) {
    return NextResponse.json({ error: 'Connexion BoondManager requise' }, { status: 401 })
  }

  try {
    const decoded = Buffer.from(boondToken, 'base64').toString('utf-8')
    const [email, password] = decoded.split(':')
    const client = new BoondManagerClient(boondSubdomain, email, password)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await client.getMyOpportunities(page, limit)

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta
    })
  } catch (error) {
    console.error('BoondManager opportunities error:', error)
    return NextResponse.json({ error: 'Erreur API BoondManager' }, { status: 500 })
  }
}

// POST - Create opportunity
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'jobs')) {
    return NextResponse.json({ error: 'Permission refusee' }, { status: 403 })
  }

  const cookieStore = await cookies()
  const boondToken = cookieStore.get('boond-token')?.value
  const boondSubdomain = cookieStore.get('boond-subdomain')?.value

  if (!boondToken || !boondSubdomain) {
    return NextResponse.json({ error: 'Connexion BoondManager requise' }, { status: 401 })
  }

  try {
    const decoded = Buffer.from(boondToken, 'base64').toString('utf-8')
    const [email, password] = decoded.split(':')
    const client = new BoondManagerClient(boondSubdomain, email, password)

    const body = await request.json()
    const result = await client.createOpportunity(body)

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('BoondManager create opportunity error:', error)
    return NextResponse.json({ error: 'Erreur creation opportunite' }, { status: 500 })
  }
}

// PATCH - Update opportunity
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'jobs')) {
    return NextResponse.json({ error: 'Permission refusee' }, { status: 403 })
  }

  const cookieStore = await cookies()
  const boondToken = cookieStore.get('boond-token')?.value
  const boondSubdomain = cookieStore.get('boond-subdomain')?.value

  if (!boondToken || !boondSubdomain) {
    return NextResponse.json({ error: 'Connexion BoondManager requise' }, { status: 401 })
  }

  try {
    const decoded = Buffer.from(boondToken, 'base64').toString('utf-8')
    const [email, password] = decoded.split(':')
    const client = new BoondManagerClient(boondSubdomain, email, password)

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const result = await client.updateOpportunity(id, data)

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('BoondManager update opportunity error:', error)
    return NextResponse.json({ error: 'Erreur mise a jour opportunite' }, { status: 500 })
  }
}

// DELETE - Delete opportunity
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'jobs')) {
    return NextResponse.json({ error: 'Permission refusee' }, { status: 403 })
  }

  const cookieStore = await cookies()
  const boondToken = cookieStore.get('boond-token')?.value
  const boondSubdomain = cookieStore.get('boond-subdomain')?.value

  if (!boondToken || !boondSubdomain) {
    return NextResponse.json({ error: 'Connexion BoondManager requise' }, { status: 401 })
  }

  try {
    const decoded = Buffer.from(boondToken, 'base64').toString('utf-8')
    const [email, password] = decoded.split(':')
    const client = new BoondManagerClient(boondSubdomain, email, password)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await client.deleteOpportunity(parseInt(id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('BoondManager delete opportunity error:', error)
    return NextResponse.json({ error: 'Erreur suppression opportunite' }, { status: 500 })
  }
}
