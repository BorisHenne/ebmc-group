import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// Public API - Get active jobs for frontend
export async function GET() {
  try {
    const db = await connectToDatabase()
    const jobs = await db
      .collection('jobs')
      .find({ active: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray()

    // Transform _id to id for frontend compatibility
    const transformedJobs = jobs.map((job) => ({
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
    }))

    return NextResponse.json({ jobs: transformedJobs })
  } catch (error) {
    console.error('Error fetching public jobs:', error)
    return NextResponse.json({ error: 'Erreur serveur', jobs: [] }, { status: 500 })
  }
}
