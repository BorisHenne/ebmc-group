import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Fetch all absences for current user
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const absences = await getCollection('absences')
    const userAbsences = await absences
      .find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .toArray()

    // Calculate balance
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)

    // Default balance: 25 days per year
    const totalDays = 25

    // Calculate used and pending days
    const approvedAbsences = userAbsences.filter(
      a => a.status === 'approved' && new Date(a.startDate) >= yearStart
    )
    const pendingAbsences = userAbsences.filter(
      a => a.status === 'pending' && new Date(a.startDate) >= yearStart
    )

    const usedDays = approvedAbsences.reduce((sum, a) => sum + (a.days || 0), 0)
    const pendingDays = pendingAbsences.reduce((sum, a) => sum + (a.days || 0), 0)
    const remainingDays = totalDays - usedDays - pendingDays

    return NextResponse.json({
      absences: userAbsences.map(a => ({
        id: a._id.toString(),
        type: a.type,
        startDate: a.startDate,
        endDate: a.endDate,
        days: a.days,
        reason: a.reason,
        status: a.status,
        createdAt: a.createdAt,
        reviewedAt: a.reviewedAt,
        reviewedBy: a.reviewedBy
      })),
      balance: {
        total: totalDays,
        used: usedDays,
        pending: pendingDays,
        remaining: remainingDays
      }
    })
  } catch (error) {
    console.error('Absences GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Create new absence request
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, startDate, endDate, days, reason } = body

    // Validation
    if (!type || !startDate || !endDate) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const validTypes = ['conges_payes', 'rtt', 'maladie', 'sans_solde', 'autre']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Type d\'absence invalide' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      return NextResponse.json({ error: 'La date de fin doit être après la date de début' }, { status: 400 })
    }

    // Check for overlapping absences
    const absences = await getCollection('absences')
    const overlapping = await absences.findOne({
      userId: session.userId,
      status: { $ne: 'rejected' },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    })

    if (overlapping) {
      return NextResponse.json({ error: 'Une absence existe déjà pour cette période' }, { status: 400 })
    }

    // Create absence request
    const absenceData = {
      userId: session.userId,
      userEmail: session.email,
      type,
      startDate,
      endDate,
      days: days || 1,
      reason: reason || '',
      status: 'pending',
      createdAt: new Date()
    }

    const result = await absences.insertOne(absenceData)

    // TODO: Optionally sync with BoondManager API here

    return NextResponse.json({
      success: true,
      absence: {
        id: result.insertedId.toString(),
        ...absenceData
      }
    })
  } catch (error) {
    console.error('Absences POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
