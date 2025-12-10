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
 * Sanitize job data to ensure all fields are React-renderable
 */
function sanitizeJob(job: Record<string, unknown>): Record<string, unknown> {
  return {
    ...job,
    _id: job._id?.toString(),
    title: safeString(job.title) || '',
    titleEn: safeString(job.titleEn) || '',
    location: safeString(job.location) || '',
    type: safeString(job.type) || 'CDI',
    typeEn: safeString(job.typeEn) || '',
    category: safeString(job.category) || 'consulting',
    experience: safeString(job.experience) || '',
    experienceEn: safeString(job.experienceEn) || '',
    description: safeString(job.description) || '',
    descriptionEn: safeString(job.descriptionEn) || '',
    assignedToName: safeString(job.assignedToName),
    // Ensure arrays contain only strings
    missions: Array.isArray(job.missions)
      ? job.missions.map(m => safeString(m)).filter(Boolean)
      : [],
    missionsEn: Array.isArray(job.missionsEn)
      ? job.missionsEn.map(m => safeString(m)).filter(Boolean)
      : [],
    requirements: Array.isArray(job.requirements)
      ? job.requirements.map(r => safeString(r)).filter(Boolean)
      : [],
    requirementsEn: Array.isArray(job.requirementsEn)
      ? job.requirementsEn.map(r => safeString(r)).filter(Boolean)
      : [],
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    const jobs = await db.collection('jobs').find({}).sort({ createdAt: -1 }).toArray()
    const sanitizedJobs = jobs.map(job => sanitizeJob(job as Record<string, unknown>))
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
