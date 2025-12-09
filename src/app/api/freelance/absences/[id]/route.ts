import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// DELETE - Cancel/delete an absence request (only if pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id } = await params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const absences = await getCollection('absences')

    // Find the absence
    const absence = await absences.findOne({
      _id: new ObjectId(id),
      userId: session.userId
    })

    if (!absence) {
      return NextResponse.json({ error: 'Absence non trouvée' }, { status: 404 })
    }

    // Only allow deletion of pending absences
    if (absence.status !== 'pending') {
      return NextResponse.json(
        { error: 'Seules les demandes en attente peuvent être annulées' },
        { status: 400 }
      )
    }

    // Delete the absence
    await absences.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true, message: 'Demande annulée' })
  } catch (error) {
    console.error('Absence DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
