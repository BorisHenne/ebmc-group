import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

// GET - Fetch site settings
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Only admin can access settings
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const settingsCollection = await getCollection('settings')
    const settings = await settingsCollection.findOne({ type: 'site' })

    return NextResponse.json({
      settings: settings?.data || null
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Save site settings
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Only admin can modify settings
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const settingsCollection = await getCollection('settings')

    // Upsert settings
    await settingsCollection.updateOne(
      { type: 'site' },
      {
        $set: {
          type: 'site',
          data: body,
          updatedAt: new Date(),
          updatedBy: session.userId
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
