import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await connectToDatabase()

    const candidate = await db.collection('candidates').findOne({ _id: new ObjectId(id) })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidat non trouve' }, { status: 404 })
    }

    return NextResponse.json({ candidate })
  } catch (error) {
    console.error('Error fetching candidate:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const db = await connectToDatabase()

    const { _id, createdAt, ...updateData } = data

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating candidate:', error)
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

    await db.collection('candidates').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting candidate:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
