import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { CandidateState } from '@/lib/candidate-states'
import { getCandidateStateColors, getDefaultCandidateStates } from '@/lib/candidate-states'

/**
 * Candidate States API
 * Manages recruitment workflow states synced from BoondManager
 */

// Sync states from BoondManager dictionary to local MongoDB
async function syncFromBoondManager(): Promise<CandidateState[]> {
  try {
    const dictionary = await fetchDictionary('production')
    const boondStates = dictionary?.data?.attributes?.candidateStates || []

    if (!Array.isArray(boondStates) || boondStates.length === 0) {
      return []
    }

    const collection = await getCollection('candidateStates')
    const now = new Date()

    // Get existing states from MongoDB
    const existingStates = await collection.find({}).toArray()
    const existingById = new Map(existingStates.map(s => [s.id, s]))

    const syncedStates: CandidateState[] = []

    for (const boondState of boondStates) {
      // Cast to Record for extended properties from BoondManager
      const state = boondState as unknown as Record<string, unknown>
      const id = typeof state.id === 'string' ? parseInt(state.id, 10) : (state.id as number)
      const existing = existingById.get(id)

      if (existing) {
        // Update existing state with Boond data but keep local settings
        await collection.updateOne(
          { _id: existing._id },
          { $set: { value: (state.value as string) || existing.value, updatedAt: now } }
        )
        const updated = {
          ...existing,
          _id: existing._id.toString(),
          value: (state.value as string) || existing.value,
          color: existing.color ?? (typeof state.color === 'number' ? state.color : 0),
          updatedAt: now,
        }
        syncedStates.push(updated as CandidateState)
      } else {
        // Create new state from Boond
        const newState: Omit<CandidateState, '_id'> = {
          id,
          value: (state.value as string) || `État ${id}`,
          color: typeof state.color === 'number' ? state.color : 0,
          isEnabled: state.isEnabled !== false,
          isExcludedFromSentState: (state.isExcludedFromSentState as boolean) || false,
          reason: (state.reason as string[]) || [],
          order: syncedStates.length,
          createdAt: now,
          updatedAt: now,
        }
        const result = await collection.insertOne(newState)
        syncedStates.push({ ...newState, _id: result.insertedId.toString() } as CandidateState)
      }
    }

    return syncedStates
  } catch (error) {
    console.error('Error syncing from BoondManager:', error)
    return []
  }
}

// GET - Récupérer tous les états candidats
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Seul admin peut accéder aux états
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const syncFromBoond = searchParams.get('sync') === 'true'

    const collection = await getCollection('candidateStates')
    let states = await collection.find({}).sort({ order: 1, id: 1 }).toArray()

    // Si pas d'états ou sync demandé, synchroniser avec BoondManager
    if (states.length === 0 || syncFromBoond) {
      const syncedStates = await syncFromBoondManager()
      if (syncedStates.length > 0) {
        states = await collection.find({}).sort({ order: 1, id: 1 }).toArray()
      }
    }

    return NextResponse.json({
      states,
      colors: CANDIDATE_STATE_COLORS,
      synced: syncFromBoond
    })
  } catch (error) {
    console.error('Error fetching candidate states:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouvel état candidat
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { value, color, isEnabled, isExcludedFromSentState, reason } = body

    if (!value || value.trim() === '') {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    const collection = await getCollection('candidateStates')

    // Trouver le prochain ID disponible
    const maxIdResult = await collection.find({}).sort({ id: -1 }).limit(1).toArray()
    const nextId = maxIdResult.length > 0 ? maxIdResult[0].id + 1 : 0

    // Trouver le prochain ordre
    const maxOrderResult = await collection.find({}).sort({ order: -1 }).limit(1).toArray()
    const nextOrder = maxOrderResult.length > 0 ? maxOrderResult[0].order + 1 : 0

    const newState: Omit<CandidateState, '_id'> = {
      id: nextId,
      value: value.trim(),
      color: color ?? 0,
      isEnabled: isEnabled ?? true,
      isExcludedFromSentState: isExcludedFromSentState ?? false,
      reason: reason ?? [],
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newState)

    return NextResponse.json({
      success: true,
      state: { ...newState, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating candidate state:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un état candidat
export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { _id, id, value, color, isEnabled, isExcludedFromSentState, reason, order } = body

    if (!_id && id === undefined) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const collection = await getCollection('candidateStates')

    const updateData: Partial<CandidateState> = {
      updatedAt: new Date()
    }

    if (value !== undefined) updateData.value = value.trim()
    if (color !== undefined) updateData.color = color
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled
    if (isExcludedFromSentState !== undefined) updateData.isExcludedFromSentState = isExcludedFromSentState
    if (reason !== undefined) updateData.reason = reason
    if (order !== undefined) updateData.order = order

    const filter = _id
      ? { _id: new ObjectId(_id) }
      : { id: id }

    const result = await collection.updateOne(filter, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'État non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating candidate state:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un état candidat
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const _id = searchParams.get('_id')
    const id = searchParams.get('id')

    if (!_id && !id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const collection = await getCollection('candidateStates')

    const filter = _id
      ? { _id: new ObjectId(_id) }
      : { id: parseInt(id!) }

    const result = await collection.deleteOne(filter)

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'État non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting candidate state:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Réordonner les états (bulk update)
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { states } = body // Array of { _id or id, order }

    if (!Array.isArray(states)) {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
    }

    const collection = await getCollection('candidateStates')
    const now = new Date()

    // Mise à jour de l'ordre pour chaque état
    const updatePromises = states.map((state: { _id?: string; id?: number; order: number }) => {
      const filter = state._id
        ? { _id: new ObjectId(state._id) }
        : { id: state.id }

      return collection.updateOne(filter, {
        $set: { order: state.order, updatedAt: now }
      })
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering candidate states:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
