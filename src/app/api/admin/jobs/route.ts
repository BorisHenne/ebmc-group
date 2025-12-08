import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await connectToDatabase()
    const jobs = await db.collection('jobs').find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const db = await connectToDatabase()

    const job = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('jobs').insertOne(job)
    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
