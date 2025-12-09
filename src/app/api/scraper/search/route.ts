import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasPermission, RoleType } from '@/lib/roles'

const SCRAPER_API_URL = 'https://internal.ebmc.eu/api/v1/cvs/search'
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || '8bf428c923f01a2abea8bee4b6e83b9ec1923a5fd8c451ff729423ee5ca0a45c'

// Valid job categories
const VALID_CATEGORIES = [
  'DEVELOPER', 'DESIGNER', 'PRODUCT_MANAGER', 'MARKETING', 'SALES',
  'HR', 'FINANCE', 'OPERATIONS', 'DATA_SCIENTIST', 'FUND_ADMIN',
  'LEGAL', 'COMPLIANCE', 'OTHER'
]

// Valid sources
const VALID_SOURCES = ['LINKEDIN', 'MALT', 'MANUAL']

interface SearchParams {
  query?: string
  location?: string
  job_categories?: string[]
  open_to_work?: boolean
  source?: string
  page?: number
  page_size?: number
}

// POST - Search CVs
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Check if user has access to consultants (sourceurs, commercials, admins)
  const role = session.role as RoleType
  if (!hasPermission(role, 'consultants')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const body: SearchParams = await request.json()
    const {
      query,
      location,
      job_categories,
      open_to_work,
      source,
      page = 1,
      page_size = 20
    } = body

    // Validate categories if provided
    if (job_categories && job_categories.length > 0) {
      const invalidCategories = job_categories.filter(c => !VALID_CATEGORIES.includes(c))
      if (invalidCategories.length > 0) {
        return NextResponse.json({
          error: 'Catégories invalides',
          invalid: invalidCategories,
          valid: VALID_CATEGORIES
        }, { status: 400 })
      }
    }

    // Validate source if provided
    if (source && !VALID_SOURCES.includes(source)) {
      return NextResponse.json({
        error: 'Source invalide',
        valid: VALID_SOURCES
      }, { status: 400 })
    }

    // Build request body for external API
    const searchBody: Record<string, unknown> = {
      page: Math.max(1, page),
      page_size: Math.min(100, Math.max(1, page_size))
    }

    if (query && query.trim().length > 0) searchBody.query = query.trim()
    if (location && location.trim().length > 0) searchBody.location = location.trim()
    if (job_categories && job_categories.length > 0) searchBody.job_categories = job_categories
    if (typeof open_to_work === 'boolean') searchBody.open_to_work = open_to_work
    if (source) searchBody.source = source

    // Call external scraper API
    const response = await fetch(SCRAPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SCRAPER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('Scraper API error:', response.status, errorData)
      return NextResponse.json(
        {
          error: errorData.error || 'Erreur lors de la recherche',
          message: errorData.message
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Scraper search error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET - Return available filters
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  return NextResponse.json({
    categories: VALID_CATEGORIES.map(cat => ({
      value: cat,
      label: cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    })),
    sources: VALID_SOURCES.map(src => ({
      value: src,
      label: src === 'LINKEDIN' ? 'LinkedIn' : src === 'MALT' ? 'Malt' : 'Manuel'
    }))
  })
}
