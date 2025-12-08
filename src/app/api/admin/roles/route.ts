import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const roles = await getCollection('roles')
    const allRoles = await roles.find({}).toArray()

    // Add default roles if none exist
    if (allRoles.length === 0) {
      const defaultRoles = [
        { name: 'admin', label: 'Administrateur', permissions: ['*'], createdAt: new Date() },
        { name: 'user', label: 'Utilisateur', permissions: ['read'], createdAt: new Date() },
        { name: 'editor', label: 'Éditeur', permissions: ['read', 'write'], createdAt: new Date() },
      ]
      await roles.insertMany(defaultRoles)
      return NextResponse.json({ roles: defaultRoles })
    }

    return NextResponse.json({ roles: allRoles })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { name, label, permissions } = await request.json()

    if (!name || !label) {
      return NextResponse.json({ error: 'Nom et label requis' }, { status: 400 })
    }

    const roles = await getCollection('roles')

    // Check if role already exists
    const existing = await roles.findOne({ name })
    if (existing) {
      return NextResponse.json({ error: 'Ce rôle existe déjà' }, { status: 400 })
    }

    const result = await roles.insertOne({
      name,
      label,
      permissions: permissions || [],
      createdAt: new Date()
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
