import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { sanitizeDocuments } from '@/lib/sanitize'

export async function GET() {
  try {
    const db = await connectToDatabase()
    const consultants = await db.collection('consultants').find({}).sort({ createdAt: -1 }).toArray()
    const sanitizedConsultants = sanitizeDocuments(consultants as Record<string, unknown>[])
    return NextResponse.json({ consultants: sanitizedConsultants })
  } catch (error) {
    console.error('Error fetching consultants:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const db = await connectToDatabase()

    const consultant = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('consultants').insertOne(consultant)
    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error('Error creating consultant:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
