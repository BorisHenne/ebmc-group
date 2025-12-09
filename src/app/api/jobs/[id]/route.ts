import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Public API - Get single job by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await connectToDatabase()

    let job = null

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      job = await db.collection('jobs').findOne({
        _id: new ObjectId(id),
        active: { $ne: false },
      })
    }

    // If not found, try to find by numeric id (for backward compatibility)
    if (!job) {
      job = await db.collection('jobs').findOne({
        id: parseInt(id),
        active: { $ne: false },
      })
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Transform for frontend
    const transformedJob = {
      id: job._id.toString(),
      title: job.title,
      titleEn: job.titleEn,
      location: job.location,
      type: job.type,
      typeEn: job.typeEn,
      category: job.category,
      experience: job.experience,
      experienceEn: job.experienceEn,
      description: job.description,
      descriptionEn: job.descriptionEn,
      missions: job.missions || [],
      missionsEn: job.missionsEn || [],
      requirements: job.requirements || [],
      requirementsEn: job.requirementsEn || [],
    }

    return NextResponse.json({ job: transformedJob })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
