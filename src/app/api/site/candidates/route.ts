import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import {
  getCandidateStates,
  getCandidateStateLabelSync,
} from '@/lib/boondmanager-dictionary'

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
 * Sanitize candidate data to ensure all fields are React-renderable
 */
function sanitizeCandidate(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    firstName: safeString(candidate.firstName) || '',
    lastName: safeString(candidate.lastName) || '',
    email: safeString(candidate.email),
    phone: safeString(candidate.phone),
    title: safeString(candidate.title),
    location: safeString(candidate.location),
    source: safeString(candidate.source),
    notes: safeString(candidate.notes),
    experience: safeString(candidate.experience),
    stateLabel: safeString(candidate.stateLabel) || 'Inconnu',
    // Ensure skills is always an array of strings
    skills: Array.isArray(candidate.skills)
      ? candidate.skills.map(s => safeString(s)).filter(Boolean)
      : [],
  }
}

// GET - Fetch all site candidates (imported from BoondManager)
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const db = await connectToDatabase()

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get('state')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '500')
    const includeStats = searchParams.get('stats') === 'true'

    // Build query
    const query: Record<string, unknown> = {}
    if (state !== null && state !== '') {
      query.state = parseInt(state)
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ]
    }

    // Fetch candidates
    const candidates = await db.collection('candidates')
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray()

    // Fetch dynamic state labels from BoondManager
    const candidateStates = await getCandidateStates()

    // Sanitize and add state labels
    const candidatesWithLabels = candidates.map(c => {
      const sanitized = sanitizeCandidate(c as Record<string, unknown>)
      return {
        ...sanitized,
        id: c._id.toString(),
        stateLabel: safeString(sanitized.stateLabel) || candidateStates[c.state] || 'Inconnu',
      }
    })

    // Optionally include stats
    let stats = null
    if (includeStats) {
      const pipeline = [
        { $group: { _id: '$state', count: { $sum: 1 } } },
      ]
      const statsByState = await db.collection('candidates').aggregate(pipeline).toArray()

      const byState: Record<number, number> = {}
      let total = 0
      statsByState.forEach(s => {
        byState[s._id] = s.count
        total += s.count
      })

      stats = {
        total,
        byState,
        byStateLabeled: Object.entries(byState).map(([state, count]) => ({
          state: parseInt(state),
          label: candidateStates[parseInt(state)] || 'Inconnu',
          count,
        })),
      }
    }

    return NextResponse.json({
      success: true,
      data: candidatesWithLabels,
      total: candidatesWithLabels.length,
      stats,
    })

  } catch (error) {
    console.error('Error fetching site candidates:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

// PATCH - Update a candidate's state (for kanban drag & drop)
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, state, boondManagerId } = body

    if (!id && !boondManagerId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    if (state === undefined || state === null) {
      return NextResponse.json({ error: 'State requis' }, { status: 400 })
    }

    const db = await connectToDatabase()

    const query = boondManagerId
      ? { boondManagerId: parseInt(boondManagerId) }
      : { _id: new (await import('mongodb')).ObjectId(id) }

    // Fetch dynamic state labels from BoondManager
    const candidateStates = await getCandidateStates()

    const result = await db.collection('candidates').updateOne(
      query,
      {
        $set: {
          state: parseInt(state),
          stateLabel: candidateStates[parseInt(state)] || 'Inconnu',
          updatedAt: new Date(),
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Candidat non trouve' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Candidat mis à jour',
    })

  } catch (error) {
    console.error('Error updating candidate:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}
