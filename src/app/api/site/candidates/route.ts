import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { getCandidateStates } from '@/lib/boondmanager-dictionary'
import { sanitizeDocument } from '@/lib/sanitize'
import { hasPermission } from '@/lib/roles'
import { createBoondClient, BoondAction } from '@/lib/boondmanager-client'
import { determineRecruitmentStateFromActions } from '@/lib/boondmanager-import'

/**
 * Map stateLabel string to state number
 * Mirrors the function in boondmanager-import.ts for consistency
 */
function mapStateLabelToState(stateLabel: string | undefined, defaultState: number): number {
  if (!stateLabel) return defaultState

  const label = stateLabel.toLowerCase().trim()

  // Map French labels to state numbers (supporting various spellings)
  if (label.includes('nouveau')) return 0
  if (label.includes('a qualifier') || label.includes('à qualifier')) return 1
  if (label.includes('qualifi')) return 2 // qualifié, qualifiée, qualifie
  if (label.includes('en cours')) return 3
  if (label.includes('entretien')) return 4
  if (label.includes('proposition')) return 5
  if (label.includes('embauche') || label.includes('embauché') || label.includes('hire')) return 6
  if (label.includes('refus') || label.includes('refuse')) return 7 // refusé, refus
  if (label.includes('archiv')) return 8 // archivé, archive

  // If no match, return the default state from BoondManager
  return defaultState
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
      const sanitized = sanitizeDocument(c as Record<string, unknown>)
      return {
        ...sanitized,
        id: String(c._id),
        stateLabel: sanitized.stateLabel || candidateStates[c.state as number] || 'Inconnu',
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

// POST - Fix/migrate existing candidates' states
// Mode 1 (default): Use stateLabel to recalculate state
// Mode 2 (useBoondManagerActions=true): Fetch actions from BoondManager to determine state
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Check permission - only admin can run migrations
  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({
      error: 'Permission refusée - Seuls les administrateurs peuvent corriger les états'
    }, { status: 403 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { dryRun = false, useBoondManagerActions = false } = body

    const db = await connectToDatabase()
    const candidateStates = await getCandidateStates()

    // Fetch all candidates
    const candidates = await db.collection('candidates').find({}).toArray()

    const updates: Array<{
      id: string
      boondManagerId?: number
      name: string
      oldState: number
      newState: number
      stateLabel: string
      source: string
    }> = []

    // Mode 2: Use BoondManager actions to determine state
    if (useBoondManagerActions) {
      console.log('[Fix States] Using BoondManager actions to determine recruitment state')
      const client = createBoondClient('production')

      // Process candidates with boondManagerId in batches
      const candidatesWithBoondId = candidates.filter(c => c.boondManagerId)
      console.log(`[Fix States] Processing ${candidatesWithBoondId.length} candidates with BoondManager ID`)

      const BATCH_SIZE = 20
      for (let i = 0; i < candidatesWithBoondId.length; i += BATCH_SIZE) {
        const batch = candidatesWithBoondId.slice(i, i + BATCH_SIZE)

        // Fetch actions for this batch in parallel
        const results = await Promise.all(
          batch.map(async (candidate) => {
            try {
              const response = await client.getCandidateActions(candidate.boondManagerId)
              return {
                candidate,
                actions: response.data || [],
              }
            } catch (error) {
              console.warn(`Could not fetch actions for candidate ${candidate.boondManagerId}:`, error)
              return { candidate, actions: [] as BoondAction[] }
            }
          })
        )

        // Process results
        for (const { candidate, actions } of results) {
          const currentState = candidate.state as number
          const { state: newState, stateLabel: newLabel } = determineRecruitmentStateFromActions(
            actions,
            currentState
          )

          if (newState !== currentState) {
            updates.push({
              id: String(candidate._id),
              boondManagerId: candidate.boondManagerId,
              name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
              oldState: currentState,
              newState,
              stateLabel: newLabel,
              source: `${actions.length} actions BoondManager`,
            })

            if (!dryRun) {
              await db.collection('candidates').updateOne(
                { _id: candidate._id },
                {
                  $set: {
                    state: newState,
                    stateLabel: newLabel,
                    updatedAt: new Date(),
                  }
                }
              )
            }
          }
        }
      }
    } else {
      // Mode 1: Use stateLabel to determine state (fallback)
      console.log('[Fix States] Using stateLabel to determine recruitment state')

      for (const candidate of candidates) {
        const currentState = candidate.state as number
        const stateLabel = candidate.stateLabel as string | undefined

        // Calculate the correct state from stateLabel
        const correctState = mapStateLabelToState(stateLabel, currentState)

        // Only update if there's a change
        if (correctState !== currentState) {
          updates.push({
            id: String(candidate._id),
            boondManagerId: candidate.boondManagerId,
            name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
            oldState: currentState,
            newState: correctState,
            stateLabel: stateLabel || candidateStates[correctState] || 'Inconnu',
            source: 'stateLabel mapping',
          })

          if (!dryRun) {
            await db.collection('candidates').updateOne(
              { _id: candidate._id },
              {
                $set: {
                  state: correctState,
                  stateLabel: stateLabel || candidateStates[correctState] || 'Inconnu',
                  updatedAt: new Date(),
                }
              }
            )
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      mode: useBoondManagerActions ? 'boondManagerActions' : 'stateLabel',
      totalCandidates: candidates.length,
      updated: updates.length,
      updates: updates.slice(0, 100), // Limit to 100 for response size
      message: dryRun
        ? `Simulation: ${updates.length} candidats seraient mis à jour`
        : `${updates.length} candidats ont été corrigés`,
    })

  } catch (error) {
    console.error('Error fixing candidate states:', error)
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
