import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

/**
 * Safely extract a string value from potentially complex BoondManager field
 * Handles objects like {typeOf: 1, detail: "value"}
 */
function safeString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if ('detail' in obj && typeof obj.detail === 'string') {
      return obj.detail
    }
    if ('value' in obj && typeof obj.value === 'string') {
      return obj.value
    }
    if ('label' in obj && typeof obj.label === 'string') {
      return obj.label
    }
    if ('name' in obj && typeof obj.name === 'string') {
      return obj.name
    }
  }
  return undefined
}

/**
 * Sanitize consultant data to ensure all fields are React-renderable
 */
function sanitizeConsultant(consultant: Record<string, unknown>): Record<string, unknown> {
  return {
    ...consultant,
    _id: consultant._id?.toString(),
    name: safeString(consultant.name) || '',
    title: safeString(consultant.title) || '',
    titleEn: safeString(consultant.titleEn) || '',
    location: safeString(consultant.location) || '',
    experience: safeString(consultant.experience) || '',
    experienceEn: safeString(consultant.experienceEn) || '',
    category: safeString(consultant.category) || 'consulting',
    email: safeString(consultant.email),
    phone: safeString(consultant.phone),
    // Ensure arrays contain only strings
    skills: Array.isArray(consultant.skills)
      ? consultant.skills.map(s => safeString(s)).filter(Boolean)
      : [],
    certifications: Array.isArray(consultant.certifications)
      ? consultant.certifications.map(c => safeString(c)).filter(Boolean)
      : [],
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    const consultants = await db.collection('consultants').find({}).sort({ createdAt: -1 }).toArray()
    const sanitizedConsultants = consultants.map(c => sanitizeConsultant(c as Record<string, unknown>))
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
