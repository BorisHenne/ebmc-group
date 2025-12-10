import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { CANDIDATE_STATES, RESOURCE_STATES, OPPORTUNITY_STATES } from '@/lib/boondmanager-client'

// GET - Fetch dashboard stats from site MongoDB (imported data)
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    const db = await connectToDatabase()

    // Fetch stats from all collections in parallel
    const [
      candidateStats,
      consultantStats,
      jobStats,
      userStats,
      recentCandidates,
    ] = await Promise.all([
      // Candidates by state
      db.collection('candidates').aggregate([
        { $group: { _id: '$state', count: { $sum: 1 } } },
      ]).toArray(),

      // Consultants by state (using available field)
      db.collection('consultants').aggregate([
        { $group: { _id: '$available', count: { $sum: 1 } } },
      ]).toArray(),

      // Jobs by active status
      db.collection('jobs').aggregate([
        { $group: { _id: '$active', count: { $sum: 1 } } },
      ]).toArray(),

      // Users count
      db.collection('users').countDocuments(),

      // Recent candidates (last 10)
      db.collection('candidates')
        .find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .toArray(),
    ])

    // Process candidate stats
    const candidatesByState: Record<number, number> = {}
    let totalCandidates = 0
    candidateStats.forEach(s => {
      candidatesByState[s._id] = s.count
      totalCandidates += s.count
    })

    // Process consultant stats
    let totalConsultants = 0
    let availableConsultants = 0
    consultantStats.forEach(s => {
      totalConsultants += s.count
      if (s._id === true) availableConsultants = s.count
    })

    // Process job stats
    let totalJobs = 0
    let activeJobs = 0
    jobStats.forEach(s => {
      totalJobs += s.count
      if (s._id === true) activeJobs = s.count
    })

    // Calculate funnel data from candidate states
    const funnel = Object.entries(CANDIDATE_STATES)
      .filter(([state]) => parseInt(state) >= 0 && parseInt(state) <= 6)
      .map(([state, label]) => ({
        stage: label,
        state: parseInt(state),
        count: candidatesByState[parseInt(state)] || 0,
      }))
      .sort((a, b) => a.state - b.state)

    // Calculate monthly activity (based on updatedAt timestamps in last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyPipeline = [
      {
        $match: {
          updatedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          candidats: { $sum: 1 },
          entretiens: {
            $sum: { $cond: [{ $eq: ['$state', 4] }, 1, 0] }
          },
          placements: {
            $sum: { $cond: [{ $eq: ['$state', 6] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]

    const monthlyData = await db.collection('candidates').aggregate(monthlyPipeline).toArray()

    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyActivity = monthlyData.map(m => ({
      month: months[m._id.month - 1],
      candidats: m.candidats,
      entretiens: m.entretiens,
      placements: m.placements,
    }))

    // Build recent activity from recent candidates
    const recentActivity = recentCandidates.map(c => {
      const stateLabel = CANDIDATE_STATES[c.state] || 'Modifie'
      let action = 'Candidature mise a jour'
      if (c.state === 0) action = 'Nouveau candidat'
      else if (c.state === 4) action = 'Entretien programme'
      else if (c.state === 6) action = 'Candidat embauche'
      else if (c.state === 7) action = 'Candidature refusee'

      return {
        type: 'candidate',
        action,
        name: `${c.firstName} ${c.lastName}`,
        state: c.state,
        stateLabel,
        time: formatRelativeTime(c.updatedAt),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        candidates: {
          total: totalCandidates,
          byState: candidatesByState,
          byStateLabeled: Object.entries(candidatesByState).map(([state, count]) => ({
            state: parseInt(state),
            label: CANDIDATE_STATES[parseInt(state)] || 'Inconnu',
            count,
          })),
        },
        consultants: {
          total: totalConsultants,
          available: availableConsultants,
          onMission: totalConsultants - availableConsultants,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: totalJobs - activeJobs,
        },
        users: {
          total: userStats,
        },
        funnel,
        monthlyActivity,
        recentActivity,
        // KPIs for dashboard cards
        kpis: {
          totalCandidates,
          inProcess: (candidatesByState[1] || 0) + (candidatesByState[2] || 0) + (candidatesByState[3] || 0),
          interviews: candidatesByState[4] || 0,
          placements: candidatesByState[6] || 0,
          consultantsAvailable: availableConsultants,
          activeJobs,
        },
      },
      stateLabels: {
        candidates: CANDIDATE_STATES,
        resources: RESOURCE_STATES,
        opportunities: OPPORTUNITY_STATES,
      },
    })

  } catch (error) {
    console.error('Error fetching site stats:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'A l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return then.toLocaleDateString('fr-FR')
}
