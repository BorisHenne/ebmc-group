import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { sanitizeDocuments } from '@/lib/sanitize'

export async function GET() {
  try {
    const db = await connectToDatabase()
    const jobs = await db.collection('jobs').find({}).sort({ createdAt: -1 }).toArray()
    const sanitizedJobs = sanitizeDocuments(jobs as Record<string, unknown>[])
    return NextResponse.json({ jobs: sanitizedJobs })
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
