import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { BoondManagerClient } from '@/lib/boondmanager'
import { hasPermission } from '@/lib/roles'

// GET - List resources
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'consultants')) {
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
    const search = searchParams.get('search')

    let result
    if (search) {
      result = await client.searchResources(search, page, limit)
    } else {
      result = await client.getMyResources(page, limit)
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta
    })
  } catch (error) {
    console.error('BoondManager resources error:', error)
    return NextResponse.json({ error: 'Erreur API BoondManager' }, { status: 500 })
  }
}

// POST - Create resource
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'consultants')) {
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
    const result = await client.createResource(body)

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('BoondManager create resource error:', error)
    return NextResponse.json({ error: 'Erreur creation ressource' }, { status: 500 })
  }
}

// PATCH - Update resource
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'consultants')) {
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

    const result = await client.updateResource(id, data)

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('BoondManager update resource error:', error)
    return NextResponse.json({ error: 'Erreur mise a jour ressource' }, { status: 500 })
  }
}

// DELETE - Delete resource
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'consultants')) {
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

    await client.deleteResource(parseInt(id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('BoondManager delete resource error:', error)
    return NextResponse.json({ error: 'Erreur suppression ressource' }, { status: 500 })
  }
}
