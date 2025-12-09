import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Fetch timesheet for a specific month
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: YYYY-MM

    if (!month) {
      return NextResponse.json({ error: 'Paramètre month requis' }, { status: 400 })
    }

    const timesheets = await getCollection('timesheets')
    const timesheet = await timesheets.findOne({
      userId: session.userId,
      month: month
    })

    if (!timesheet) {
      // Return empty timesheet structure
      const [year, monthNum] = month.split('-').map(Number)
      const daysInMonth = new Date(year, monthNum, 0).getDate()
      const days: Record<string, number> = {}

      for (let i = 1; i <= daysInMonth; i++) {
        const date = `${month}-${i.toString().padStart(2, '0')}`
        days[date] = 0
      }

      return NextResponse.json({
        timesheet: {
          month,
          days,
          status: 'draft',
          totalHours: 0
        }
      })
    }

    return NextResponse.json({ timesheet })
  } catch (error) {
    console.error('Timesheets GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Save timesheet
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { month, days } = body

    if (!month || !days) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Calculate total hours
    const totalHours = Object.values(days as Record<string, number>).reduce((sum, hours) => sum + hours, 0)

    const timesheets = await getCollection('timesheets')

    // Check if timesheet exists and is not already validated
    const existing = await timesheets.findOne({
      userId: session.userId,
      month: month
    })

    if (existing && existing.status === 'validated') {
      return NextResponse.json({ error: 'Ce CRA a déjà été validé' }, { status: 400 })
    }

    const timesheetData = {
      userId: session.userId,
      userEmail: session.email,
      month,
      days,
      totalHours,
      status: 'draft',
      updatedAt: new Date()
    }

    if (existing) {
      await timesheets.updateOne(
        { _id: existing._id },
        { $set: timesheetData }
      )
    } else {
      await timesheets.insertOne({
        ...timesheetData,
        createdAt: new Date()
      })
    }

    return NextResponse.json({ success: true, totalHours })
  } catch (error) {
    console.error('Timesheets POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
