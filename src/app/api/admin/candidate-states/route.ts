import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import {
  CANDIDATE_STATE_COLORS,
  DEFAULT_CANDIDATE_STATES,
  CandidateState
} from '@/lib/candidate-states'

// GET - Récupérer tous les états candidats
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Seul admin peut accéder aux états
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const collection = await getCollection('candidateStates')
    const states = await collection.find({}).sort({ order: 1, id: 1 }).toArray()

    // Si pas d'états, initialiser avec les valeurs par défaut
    if (states.length === 0) {
      const now = new Date()
      const statesWithDates = DEFAULT_CANDIDATE_STATES.map(state => ({
        ...state,
        createdAt: now,
        updatedAt: now
      }))
      await collection.insertMany(statesWithDates)
      return NextResponse.json({
        states: statesWithDates,
        colors: CANDIDATE_STATE_COLORS
      })
    }

    return NextResponse.json({
      states,
      colors: CANDIDATE_STATE_COLORS
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
