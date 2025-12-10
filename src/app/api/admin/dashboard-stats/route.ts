import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'

interface AggregationResult {
  _id: string | null
  count: number
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    const db = await connectToDatabase()

    // Get all collections counts
    const [
      usersCount,
      candidatesCount,
      jobsCount,
      consultantsCount,
      messagesCount,
      timesheetsCount,
      absencesCount,
      webhooksCount,
      apiTokensCount,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('candidates').countDocuments(),
      db.collection('jobs').countDocuments(),
      db.collection('consultants').countDocuments(),
      db.collection('messages').countDocuments(),
      db.collection('timesheets').countDocuments(),
      db.collection('absences').countDocuments(),
      db.collection('webhooks').countDocuments(),
      db.collection('apiTokens').countDocuments(),
    ])

    // Get active jobs
    const activeJobsCount = await db.collection('jobs').countDocuments({ active: true })

    // Get users by role
    const usersByRole = await db.collection('users').aggregate<AggregationResult>([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]).toArray()

    // Get candidates by status
    const candidatesByStatus = await db.collection('candidates').aggregate<AggregationResult>([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()

    // Get consultants by state
    const consultantsByState = await db.collection('consultants').aggregate<AggregationResult>([
      { $group: { _id: '$state', count: { $sum: 1 } } }
    ]).toArray()

    // Get consultants by contract type
    const consultantsByContract = await db.collection('consultants').aggregate<AggregationResult>([
      { $group: { _id: '$contractType', count: { $sum: 1 } } }
    ]).toArray()

    // Get jobs by category
    const jobsByCategory = await db.collection('jobs').aggregate<AggregationResult>([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray()

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentCandidates = await db.collection('candidates').countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    const recentMessages = await db.collection('messages').countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    // Get monthly data for charts (last 12 months)
    const monthlyStats = await getMonthlyStats(db)

    // Get skills distribution from candidates
    const skillsDistribution = await db.collection('candidates').aggregate<AggregationResult>([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray()

    // Get recent sync logs
    const recentSyncs = await db.collection('sync_logs')
      .find({})
      .sort({ syncDate: -1 })
      .limit(5)
      .toArray()

    // Database stats
    const dbStats = await db.stats()

    return NextResponse.json({
      overview: {
        totalUsers: usersCount,
        totalCandidates: candidatesCount,
        totalJobs: jobsCount,
        activeJobs: activeJobsCount,
        totalConsultants: consultantsCount,
        totalMessages: messagesCount,
        totalTimesheets: timesheetsCount,
        totalAbsences: absencesCount,
        totalWebhooks: webhooksCount,
        totalApiTokens: apiTokensCount,
      },
      recent: {
        candidatesLast30Days: recentCandidates,
        messagesLast30Days: recentMessages,
      },
      distributions: {
        usersByRole: formatDistribution(usersByRole),
        candidatesByStatus: formatDistribution(candidatesByStatus),
        consultantsByState: formatDistribution(consultantsByState),
        consultantsByContract: formatDistribution(consultantsByContract),
        jobsByCategory: formatDistribution(jobsByCategory),
        topSkills: formatDistribution(skillsDistribution),
      },
      monthlyStats,
      syncs: recentSyncs.map(sync => ({
        date: sync.syncDate,
        status: sync.status,
        records: sync.recordsProcessed || 0,
        errors: sync.errors?.length || 0,
      })),
      database: {
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        avgObjSize: dbStats.avgObjSize,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function formatDistribution(data: AggregationResult[]) {
  return data.reduce((acc, item) => {
    const key = item._id || 'unknown'
    acc[key] = item.count
    return acc
  }, {} as Record<string, number>)
}

async function getMonthlyStats(db: ReturnType<typeof connectToDatabase> extends Promise<infer T> ? T : never) {
  const months = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const [candidates, jobs, messages] = await Promise.all([
      db.collection('candidates').countDocuments({
        createdAt: { $gte: date, $lt: nextMonth }
      }),
      db.collection('jobs').countDocuments({
        createdAt: { $gte: date, $lt: nextMonth }
      }),
      db.collection('messages').countDocuments({
        createdAt: { $gte: date, $lt: nextMonth }
      }),
    ])

    months.push({
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      year: date.getFullYear(),
      candidates,
      jobs,
      messages,
    })
  }

  return months
}
