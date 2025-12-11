import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondDictionary } from '@/lib/boondmanager-client'

// Cache the dictionary for 1 hour (it rarely changes)
let cachedDictionary: {
  data: BoondDictionary
  normalizedAttributes: Record<string, unknown>
  timestamp: number
  environment: string
} | null = null
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
      // Return cached normalized attributes
      // The cache stores normalized attributes directly now
      return NextResponse.json({
        success: true,
        cached: true,
        environment,
        data: cachedDictionary.normalizedAttributes || {}
      })
    }

    // Fetch fresh dictionary
    const client = createBoondClient(environment)
    const dictionary = await client.getDictionary()

    // BoondManager uses data.setting.* format, not data.attributes.*
    const setting = (dictionary?.data as Record<string, unknown>)?.setting

    // Normalize dictionary structure for frontend
    // BoondManager API returns: { data: { setting: { state: {...}, typeOf: {...}, ... } } }
    // We need to transform this to the format expected by the frontend
    let attributes: Record<string, unknown> = {}

    if (setting && typeof setting === 'object') {
      const settingObj = setting as Record<string, unknown>

      // Map BoondManager setting structure to our expected format
      // States are in setting.state.*
      const states = settingObj.state as Record<string, unknown> | undefined
      if (states) {
        if (states.candidate) attributes.candidateStates = states.candidate
        if (states.resource) attributes.resourceStates = states.resource
        if (states.opportunity) attributes.opportunityStates = states.opportunity
        if (states.project) attributes.projectStates = states.project
        if (states.company) attributes.companyStates = states.company
        if (states.contact) attributes.contactStates = states.contact
        if (states.positioning) attributes.positioningStates = states.positioning
        if (states.action) attributes.actionStates = states.action
      }

      // Types are in setting.typeOf.*
      const typeOf = settingObj.typeOf as Record<string, unknown> | undefined
      if (typeOf) {
        if (typeOf.candidate) attributes.candidateTypes = typeOf.candidate
        if (typeOf.resource) attributes.resourceTypes = typeOf.resource
        if (typeOf.opportunity) attributes.opportunityTypes = typeOf.opportunity
        if (typeOf.project) attributes.projectTypes = typeOf.project
        if (typeOf.company) attributes.companyTypes = typeOf.company
        if (typeOf.action) attributes.actionTypes = typeOf.action
        if (typeOf.employee) attributes.employeeTypes = typeOf.employee
      }

      // Modes
      const mode = settingObj.mode as Record<string, unknown> | undefined
      if (mode) {
        if (mode.opportunity) attributes.opportunityModes = mode.opportunity
        if (mode.project) attributes.projectModes = mode.project
      }

      // Other dictionaries - direct mapping
      if (settingObj.civility) attributes.civilities = settingObj.civility
      if (settingObj.country) attributes.countries = settingObj.country
      if (settingObj.currency) attributes.currencies = settingObj.currency
      if (settingObj.languageSpoken) attributes.languages = settingObj.languageSpoken
      if (settingObj.expertiseArea) attributes.expertises = settingObj.expertiseArea
      if (settingObj.experience) attributes.expertiseLevels = settingObj.experience
      if (settingObj.agency) attributes.agencies = settingObj.agency
      if (settingObj.pole) attributes.poles = settingObj.pole
      if (settingObj.origin) attributes.origins = settingObj.origin
      if (settingObj.source) attributes.sources = settingObj.source
      if (settingObj.durationUnit) attributes.durationUnits = settingObj.durationUnit
      if (settingObj.activityArea) attributes.activityAreas = settingObj.activityArea
      if (settingObj.tool) attributes.tools = settingObj.tool
    }
    // Fallback: try data.attributes (JSON:API standard)
    else if (dictionary?.data?.attributes) {
      attributes = dictionary.data.attributes
    }
    // Fallback: try direct format
    else if (dictionary && typeof dictionary === 'object') {
      const dictKeys = Object.keys(dictionary)
      if (dictKeys.some(k => k.includes('States') || k.includes('Types') || k.includes('setting'))) {
        attributes = dictionary as unknown as Record<string, unknown>
      }
    }

    // Update cache with normalized attributes
    cachedDictionary = {
      data: dictionary,
      normalizedAttributes: attributes,
      timestamp: now,
      environment
    }

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
