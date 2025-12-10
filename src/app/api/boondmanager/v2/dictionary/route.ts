import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondDictionary } from '@/lib/boondmanager-client'

// Cache the dictionary for 1 hour (it rarely changes)
let cachedDictionary: { data: BoondDictionary; timestamp: number; environment: string } | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in ms

// GET - Fetch the application dictionary
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const environment = request.nextUrl.searchParams.get('env') === 'production' ? 'production' : 'sandbox'
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true'

  try {
    // Check cache
    const now = Date.now()
    if (
      !forceRefresh &&
      cachedDictionary &&
      cachedDictionary.environment === environment &&
      now - cachedDictionary.timestamp < CACHE_DURATION
    ) {
      return NextResponse.json({
        success: true,
        cached: true,
        environment,
        data: cachedDictionary.data
      })
    }

    // Fetch fresh dictionary
    const client = createBoondClient(environment)
    const dictionary = await client.getDictionary()

    // Update cache
    cachedDictionary = {
      data: dictionary,
      timestamp: now,
      environment
    }

    return NextResponse.json({
      success: true,
      cached: false,
      environment,
      data: dictionary
    })

  } catch (error) {
    console.error('Dictionary fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

// POST - Clear dictionary cache
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  cachedDictionary = null

  return NextResponse.json({
    success: true,
    message: 'Cache du dictionnaire vide'
  })
}
