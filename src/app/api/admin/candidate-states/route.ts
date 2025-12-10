import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Interface pour un état candidat
export interface CandidateState {
  _id?: ObjectId
  id: number // Boond ID
  value: string
  color: number
  isEnabled: boolean
  isExcludedFromSentState: boolean
  reason: string[]
  order: number
  createdAt?: Date
  updatedAt?: Date
}

// Couleurs disponibles (basées sur BoondManager)
export const CANDIDATE_STATE_COLORS: Record<number, { name: string; hex: string; tailwind: string }> = {
  0: { name: 'Gris', hex: '#6B7280', tailwind: 'bg-gray-500' },
  1: { name: 'Bleu clair', hex: '#3B82F6', tailwind: 'bg-blue-500' },
  2: { name: 'Vert', hex: '#22C55E', tailwind: 'bg-green-500' },
  3: { name: 'Orange', hex: '#F97316', tailwind: 'bg-orange-500' },
  4: { name: 'Rouge', hex: '#EF4444', tailwind: 'bg-red-500' },
  5: { name: 'Violet', hex: '#8B5CF6', tailwind: 'bg-violet-500' },
  6: { name: 'Rose', hex: '#EC4899', tailwind: 'bg-pink-500' },
  7: { name: 'Cyan', hex: '#06B6D4', tailwind: 'bg-cyan-500' },
  8: { name: 'Rouge foncé', hex: '#DC2626', tailwind: 'bg-red-600' },
  9: { name: 'Jaune', hex: '#EAB308', tailwind: 'bg-yellow-500' },
  10: { name: 'Vert émeraude', hex: '#10B981', tailwind: 'bg-emerald-500' },
  11: { name: 'Indigo', hex: '#6366F1', tailwind: 'bg-indigo-500' },
  12: { name: 'Gris foncé', hex: '#374151', tailwind: 'bg-gray-700' },
  13: { name: 'Ambre', hex: '#F59E0B', tailwind: 'bg-amber-500' },
  14: { name: 'Bleu ardoise', hex: '#64748B', tailwind: 'bg-slate-500' },
  15: { name: 'Turquoise', hex: '#14B8A6', tailwind: 'bg-teal-500' },
  16: { name: 'Lime', hex: '#84CC16', tailwind: 'bg-lime-500' },
  17: { name: 'Fuchsia', hex: '#D946EF', tailwind: 'bg-fuchsia-500' },
}

// États par défaut (basés sur BoondManager)
const DEFAULT_CANDIDATE_STATES: Omit<CandidateState, '_id'>[] = [
  { id: 0, color: 3, value: 'A traiter !', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 0 },
  { id: 1, color: 1, value: 'En cours de qualif.', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 1 },
  { id: 2, color: 10, value: 'Vivier++', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 2 },
  { id: 3, color: 7, value: 'Converti en Ressource', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 3 },
  { id: 4, color: 8, value: 'Blacklist', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 4 },
  { id: 5, color: 12, value: 'Ne plus contacter', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 5 },
  { id: 6, color: 5, value: 'Freelance', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 6 },
  { id: 7, color: 14, value: 'Ne répond plus', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 7 },
  { id: 8, color: 13, value: 'Refus de Proposition', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 8 },
  { id: 9, color: 9, value: 'Vivier', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 9 },
  { id: 10, color: 17, value: 'Ancien Salarié', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 10 },
  { id: 11, color: 15, value: 'Junior', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 11 },
  { id: 12, color: 16, value: 'CV Partenaire', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 12 },
  { id: 13, color: 13, value: 'Need LU Work Permit', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 13 },
  { id: 14, color: 14, value: 'Envoyé aux Sales', isEnabled: true, isExcludedFromSentState: false, reason: [], order: 14 },
]

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
