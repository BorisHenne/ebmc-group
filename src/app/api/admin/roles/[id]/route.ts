import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { name, label, permissions } = await request.json()

    const roles = await getCollection('roles')
    await roles.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, label, permissions, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id } = await params
    const roles = await getCollection('roles')

    // Don't allow deleting admin role
    const role = await roles.findOne({ _id: new ObjectId(id) })
    if (role?.name === 'admin') {
      return NextResponse.json({ error: 'Impossible de supprimer le rôle admin' }, { status: 400 })
    }

    await roles.deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
