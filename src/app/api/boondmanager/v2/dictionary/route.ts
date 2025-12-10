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
      // Normalize cached dictionary structure for frontend
      const cachedAttributes = cachedDictionary.data?.data?.attributes || cachedDictionary.data || {}
      return NextResponse.json({
        success: true,
        cached: true,
        environment,
        data: cachedAttributes
      })
    }

    // Fetch fresh dictionary
    const client = createBoondClient(environment)
    const dictionary = await client.getDictionary()

    // Debug: Log the raw dictionary structure
    console.log('[Dictionary API] Raw response keys:', Object.keys(dictionary || {}))
    console.log('[Dictionary API] dictionary.data keys:', Object.keys(dictionary?.data || {}))
    console.log('[Dictionary API] dictionary.data.attributes keys:', Object.keys(dictionary?.data?.attributes || {}))

    // Update cache
    cachedDictionary = {
      data: dictionary,
      timestamp: now,
      environment
    }

    // Normalize dictionary structure for frontend
    // BoondManager API returns: { data: { type, id, attributes: {...} } }
    // We need to extract attributes and send them to frontend
    let attributes: Record<string, unknown> = {}

    if (dictionary?.data?.attributes) {
      // Standard JSON:API format
      attributes = dictionary.data.attributes
    } else if (dictionary?.data && typeof dictionary.data === 'object') {
      // Check if data itself contains the states directly
      const dataKeys = Object.keys(dictionary.data)
      if (dataKeys.some(k => k.includes('States') || k.includes('Types'))) {
        attributes = dictionary.data as Record<string, unknown>
      }
    } else if (dictionary && typeof dictionary === 'object') {
      // Direct format - dictionary itself contains the states
      const dictKeys = Object.keys(dictionary)
      if (dictKeys.some(k => k.includes('States') || k.includes('Types'))) {
        attributes = dictionary as unknown as Record<string, unknown>
      }
    }

    console.log('[Dictionary API] Final attributes keys:', Object.keys(attributes))

    return NextResponse.json({
      success: true,
      cached: false,
      environment,
      data: attributes
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
