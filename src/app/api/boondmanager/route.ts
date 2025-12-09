import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { BoondManagerClient, CANDIDATE_STATES, RESOURCE_STATES, OPPORTUNITY_STATES } from '@/lib/boondmanager'

// Demo data generator
function generateDemoData(type: string, userId: string) {
  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Julie', 'Nicolas', 'Emma', 'Lucas', 'Lea', 'Hugo', 'Chloe', 'Alexandre', 'Camille', 'Maxime']
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia']
  const titles = ['Developpeur Full Stack', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UX Designer', 'Tech Lead', 'Architecte Cloud', 'Consultant SAP', 'Chef de Projet', 'Scrum Master']
  const companies = ['TechCorp', 'DataFlow', 'CloudNine', 'InnovateTech', 'DigitalFirst', 'SmartSolutions', 'FutureLabs', 'AgileWorks']
  const sources = ['LinkedIn', 'Indeed', 'Site Web', 'Cooptation', 'CVtheque', 'JobBoard', 'Reseau']

  if (type === 'candidates') {
    return Array.from({ length: 25 }, (_, i) => ({
      id: 1000 + i,
      attributes: {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        email: `candidate${i}@example.com`,
        civility: Math.random() > 0.5 ? 'M' : 'Mme',
        state: Math.floor(Math.random() * 8) + 1,
        stateLabel: CANDIDATE_STATES[Math.floor(Math.random() * 8) + 1],
        title: titles[Math.floor(Math.random() * titles.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        phone: `+33 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
        createdAt: randomDate(monthAgo, now).toISOString(),
        updatedAt: randomDate(monthAgo, now).toISOString(),
        lastActivityAt: randomDate(monthAgo, now).toISOString(),
      },
      relationships: {
        mainManager: { data: { id: parseInt(userId) || 1 } }
      }
    }))
  }

  if (type === 'resources') {
    return Array.from({ length: 15 }, (_, i) => ({
      id: 2000 + i,
      attributes: {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        email: `consultant${i}@example.com`,
        civility: Math.random() > 0.5 ? 'M' : 'Mme',
        state: Math.floor(Math.random() * 5) + 1,
        stateLabel: RESOURCE_STATES[Math.floor(Math.random() * 5) + 1],
        title: titles[Math.floor(Math.random() * titles.length)],
        phone: `+33 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
        createdAt: randomDate(monthAgo, now).toISOString(),
        updatedAt: randomDate(monthAgo, now).toISOString(),
      },
      relationships: {
        mainManager: { data: { id: parseInt(userId) || 1 } }
      }
    }))
  }

  if (type === 'opportunities') {
    return Array.from({ length: 12 }, (_, i) => ({
      id: 3000 + i,
      attributes: {
        title: `${titles[Math.floor(Math.random() * titles.length)]} - ${companies[Math.floor(Math.random() * companies.length)]}`,
        reference: `OPP-2024-${String(i + 1).padStart(3, '0')}`,
        state: Math.floor(Math.random() * 4) + 1,
        stateLabel: OPPORTUNITY_STATES[Math.floor(Math.random() * 4) + 1],
        description: 'Mission de consulting IT',
        startDate: randomDate(now, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        dailyRate: Math.floor(Math.random() * 400 + 400),
        createdAt: randomDate(monthAgo, now).toISOString(),
        updatedAt: randomDate(monthAgo, now).toISOString(),
      },
      relationships: {
        mainManager: { data: { id: parseInt(userId) || 1 } },
        company: { data: { id: Math.floor(Math.random() * 100) + 1 } }
      }
    }))
  }

  if (type === 'stats') {
    // Generate realistic stats
    const candidatesByState: Record<number, number> = {}
    const resourcesByState: Record<number, number> = {}
    const opportunitiesByState: Record<number, number> = {}

    for (let i = 1; i <= 8; i++) {
      candidatesByState[i] = Math.floor(Math.random() * 10) + 1
    }
    for (let i = 1; i <= 5; i++) {
      resourcesByState[i] = Math.floor(Math.random() * 5) + 1
    }
    for (let i = 1; i <= 4; i++) {
      opportunitiesByState[i] = Math.floor(Math.random() * 8) + 1
    }

    const totalCandidates = Object.values(candidatesByState).reduce((a, b) => a + b, 0)
    const totalResources = Object.values(resourcesByState).reduce((a, b) => a + b, 0)
    const totalOpportunities = Object.values(opportunitiesByState).reduce((a, b) => a + b, 0)

    // Monthly activity data
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = now.getMonth()
    const monthlyActivity = months.slice(0, currentMonth + 1).map((month, idx) => ({
      month,
      candidats: Math.floor(Math.random() * 15) + 5,
      entretiens: Math.floor(Math.random() * 10) + 2,
      placements: Math.floor(Math.random() * 5) + 1,
    }))

    // Recruitment funnel
    const funnel = [
      { stage: 'A qualifier', count: candidatesByState[1] || 8 },
      { stage: 'Qualifie', count: candidatesByState[2] || 6 },
      { stage: 'En cours', count: candidatesByState[3] || 5 },
      { stage: 'Entretien', count: candidatesByState[4] || 4 },
      { stage: 'Proposition', count: candidatesByState[5] || 2 },
      { stage: 'Embauche', count: candidatesByState[6] || 1 },
    ]

    return {
      candidates: {
        total: totalCandidates,
        byState: candidatesByState,
      },
      resources: {
        total: totalResources,
        byState: resourcesByState,
      },
      opportunities: {
        total: totalOpportunities,
        byState: opportunitiesByState,
      },
      monthlyActivity,
      funnel,
      recentActivity: [
        { type: 'candidate', action: 'Nouveau candidat', name: 'Jean Martin', time: '2h' },
        { type: 'interview', action: 'Entretien planifie', name: 'Sophie Dubois', time: '4h' },
        { type: 'opportunity', action: 'Nouvelle offre', name: 'Dev Full Stack - TechCorp', time: '6h' },
        { type: 'placement', action: 'Placement confirme', name: 'Pierre Bernard', time: '1j' },
        { type: 'candidate', action: 'CV recu', name: 'Emma Thomas', time: '1j' },
      ]
    }
  }

  return []
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'stats'
  const demo = searchParams.get('demo') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  // Use demo data if requested or if no Boond credentials
  const cookieStore = await cookies()
  const boondToken = cookieStore.get('boond-token')?.value
  const boondSubdomain = cookieStore.get('boond-subdomain')?.value

  const useDemo = demo || !boondToken || !boondSubdomain

  if (useDemo) {
    const data = generateDemoData(type, session.userId)
    return NextResponse.json({
      success: true,
      demo: true,
      data,
      meta: {
        totals: { rows: Array.isArray(data) ? data.length : 0 }
      }
    })
  }

  try {
    // Decode boond token to get email:password
    const decoded = Buffer.from(boondToken, 'base64').toString('utf-8')
    const [email, password] = decoded.split(':')
    const client = new BoondManagerClient(boondSubdomain, email, password)

    let result

    switch (type) {
      case 'candidates':
        result = await client.getMyCandidates(page, limit)
        break
      case 'resources':
        result = await client.getMyResources(page, limit)
        break
      case 'opportunities':
        result = await client.getMyOpportunities(page, limit)
        break
      case 'stats':
        result = await client.getDashboardStats()
        // Add chart data
        const monthlyActivity = generateDemoData('stats', session.userId) as { monthlyActivity: unknown[] }
        return NextResponse.json({
          success: true,
          demo: false,
          data: {
            ...result,
            monthlyActivity: monthlyActivity.monthlyActivity
          }
        })
      default:
        return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      demo: false,
      data: result.data,
      meta: result.meta
    })

  } catch (error) {
    console.error('BoondManager API error:', error)
    // Fallback to demo data on error
    const data = generateDemoData(type, session.userId)
    return NextResponse.json({
      success: true,
      demo: true,
      fallback: true,
      error: 'Connexion BoondManager echouee, donnees demo utilisees',
      data,
      meta: {
        totals: { rows: Array.isArray(data) ? data.length : 0 }
      }
    })
  }
}
