import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const db = await connectToDatabase()

    const { _id, createdAt, ...updateData } = data

    await db.collection('jobs').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await connectToDatabase()

    await db.collection('jobs').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
