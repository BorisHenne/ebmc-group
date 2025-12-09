import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

// GET - Get timesheet summary for the current user
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const timesheets = await getCollection('timesheets')

    // Get current month
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`

    // Get current month timesheet
    const currentTimesheet = await timesheets.findOne({
      userId: session.userId,
      month: currentMonth
    })

    // Get all timesheets for this year
    const yearStart = `${now.getFullYear()}-01`
    const allTimesheets = await timesheets.find({
      userId: session.userId,
      month: { $gte: yearStart }
    }).toArray()

    // Calculate statistics
    const totalHoursYear = allTimesheets.reduce((sum, ts) => sum + (ts.totalHours || 0), 0)
    const validatedCount = allTimesheets.filter(ts => ts.status === 'validated').length
    const pendingCount = allTimesheets.filter(ts => ts.status === 'submitted').length
    const draftCount = allTimesheets.filter(ts => ts.status === 'draft').length

    return NextResponse.json({
      summary: {
        currentMonth: {
          month: currentMonth,
          status: currentTimesheet?.status || 'draft',
          totalHours: currentTimesheet?.totalHours || 0
        },
        yearStats: {
          totalHours: totalHoursYear,
          validated: validatedCount,
          pending: pendingCount,
          draft: draftCount
        }
      }
    })
  } catch (error) {
    console.error('Timesheets summary error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
