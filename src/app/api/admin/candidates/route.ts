import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { sanitizeDocuments } from '@/lib/sanitize'

export async function GET(request: NextRequest) {
  try {
    // Parse pagination and filter parameters from query string
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    // Filter parameters
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const source = searchParams.get('source') || ''

    const db = await connectToDatabase()

    // Build filter query
    const filter: Record<string, unknown> = {}

    // Text search on name, email, position
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ]
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status
    }

    // Source filter
    if (source && source !== 'all') {
      filter.source = source
    }

    // Get total count for pagination (with filters applied)
    const totalDocs = await db.collection('candidates').countDocuments(filter)

    // Fetch paginated results with filters
    const candidates = await db.collection('candidates')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .maxTimeMS(15000)
      .toArray()

    const sanitizedCandidates = sanitizeDocuments(candidates as Record<string, unknown>[])

    const totalPages = Math.ceil(totalDocs / limit)

    return NextResponse.json({
      candidates: sanitizedCandidates,
      pagination: {
        page,
        limit,
        total: totalDocs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const db = await connectToDatabase()

    const candidate = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('candidates').insertOne(candidate)
    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error('Error creating candidate:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
