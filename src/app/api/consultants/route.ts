import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// Public API - Get consultants for frontend
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const availableOnly = searchParams.get('available') === 'true'

    const db = await connectToDatabase()

    const query: Record<string, unknown> = {}
    if (availableOnly) {
      query.available = true
    }

    const consultants = await db
      .collection('consultants')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // Transform _id to id for frontend compatibility
    const transformedConsultants = consultants.map((consultant) => ({
      id: consultant._id.toString(),
      name: consultant.name,
      title: consultant.title,
      titleEn: consultant.titleEn,
      location: consultant.location,
      experience: consultant.experience,
      experienceEn: consultant.experienceEn,
      category: consultant.category,
      available: consultant.available !== false,
      skills: consultant.skills || [],
      certifications: consultant.certifications || [],
    }))

    return NextResponse.json({ consultants: transformedConsultants })
  } catch (error) {
    console.error('Error fetching public consultants:', error)
    return NextResponse.json({ error: 'Erreur serveur', consultants: [] }, { status: 500 })
  }
}
