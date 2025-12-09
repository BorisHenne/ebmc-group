import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

// POST - Submit timesheet for validation
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { month } = body

    if (!month) {
      return NextResponse.json({ error: 'Paramètre month requis' }, { status: 400 })
    }

    const timesheets = await getCollection('timesheets')

    // Find the timesheet
    const timesheet = await timesheets.findOne({
      userId: session.userId,
      month: month
    })

    if (!timesheet) {
      return NextResponse.json({ error: 'CRA non trouvé' }, { status: 404 })
    }

    if (timesheet.status === 'validated') {
      return NextResponse.json({ error: 'Ce CRA a déjà été validé' }, { status: 400 })
    }

    if (timesheet.status === 'submitted') {
      return NextResponse.json({ error: 'Ce CRA est déjà en attente de validation' }, { status: 400 })
    }

    // Check if there are any hours
    if (!timesheet.totalHours || timesheet.totalHours === 0) {
      return NextResponse.json({ error: 'Le CRA ne contient aucune heure' }, { status: 400 })
    }

    // Update status to submitted
    await timesheets.updateOne(
      { _id: timesheet._id },
      {
        $set: {
          status: 'submitted',
          submittedAt: new Date()
        }
      }
    )

    // TODO: Optionally sync with BoondManager API here
    // This would send the timesheet to BoondManager for validation

    return NextResponse.json({ success: true, message: 'CRA soumis pour validation' })
  } catch (error) {
    console.error('Timesheets submit error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
