import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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
    const tokens = await getCollection('apiTokens')
    await tokens.deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting token:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

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
    const { name, permissions } = await request.json()

    const tokens = await getCollection('apiTokens')
    await tokens.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, permissions, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating token:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
