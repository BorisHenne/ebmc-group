/**
 * BoondManager Dictionary Service
 * Fetches and caches state labels from BoondManager API
 * Falls back to default values if API is unavailable
 */

import { createBoondClient, BoondDictionary, BoondDictionaryItem, BoondEnvironment } from './boondmanager-client'

// =============================================================================
// DEFAULT FALLBACK STATES (used when API is unavailable)
// =============================================================================

const DEFAULT_CANDIDATE_STATES: Record<number, string> = {
  0: 'Nouveau',
  1: 'A qualifier',
  2: 'Qualifié',
  3: 'En cours',
  4: 'Entretien',
  5: 'Proposition',
  6: 'Embauché',
  7: 'Refusé',
  8: 'Archivé',
}

const DEFAULT_RESOURCE_STATES: Record<number, string> = {
  0: 'Non défini',
  1: 'Disponible',
  2: 'En mission',
  3: 'Intercontrat',
  4: 'Indisponible',
  5: 'Sorti',
}

const DEFAULT_OPPORTUNITY_STATES: Record<number, string> = {
  0: 'En cours',
  1: 'Gagnée',
  2: 'Perdue',
  3: 'Abandonnée',
}

const DEFAULT_PROJECT_STATES: Record<number, string> = {
  0: 'En préparation',
  1: 'En cours',
  2: 'Terminé',
  3: 'Annulé',
}

const DEFAULT_COMPANY_STATES: Record<number, string> = {
  0: 'Prospect',
  1: 'Client',
  2: 'Ancien client',
  3: 'Fournisseur',
  4: 'Archivé',
}

const DEFAULT_POSITIONING_STATES: Record<number, string> = {
  0: 'En attente',
  1: 'Proposé',
  2: 'Validé',
  3: 'Refusé',
  4: 'Annulé',
}

const DEFAULT_ACTION_TYPES: Record<number, string> = {
  1: 'Positionnement',
  2: 'Entretien client',
  3: 'Entretien interne',
  4: 'Proposition',
  5: 'Démarrage',
  6: 'Appel',
  7: 'Email',
  8: 'Réunion',
  9: 'Autre',
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

interface CacheEntry {
  data: BoondDictionary
  timestamp: number
  environment: BoondEnvironment
}

// Cache duration: 1 hour (same as the API route)
const CACHE_DURATION_MS = 60 * 60 * 1000

// In-memory cache
let dictionaryCache: CacheEntry | null = null

// =============================================================================
// DICTIONARY SERVICE
// =============================================================================

/**
 * Fetch the dictionary from BoondManager API with caching
 */
export async function fetchDictionary(
  environment: BoondEnvironment = 'production',
  forceRefresh = false
): Promise<BoondDictionary | null> {
  const now = Date.now()

  // Check cache
  if (
    !forceRefresh &&
    dictionaryCache &&
    dictionaryCache.environment === environment &&
    now - dictionaryCache.timestamp < CACHE_DURATION_MS
  ) {
    return dictionaryCache.data
  }

  try {
    const client = createBoondClient(environment)
    const dictionary = await client.getDictionary()

    // Update cache
    dictionaryCache = {
      data: dictionary,
      timestamp: now,
      environment,
    }

    return dictionary
  } catch (error) {
    console.error('Error fetching BoondManager dictionary:', error)
    return dictionaryCache?.data || null
  }
}

/**
 * Clear the dictionary cache
 */
export function clearDictionaryCache(): void {
  dictionaryCache = null
}

/**
 * Convert BoondDictionaryItem array to Record<number, string>
 */
function itemsToRecord(items: BoondDictionaryItem[] | undefined): Record<number, string> {
  if (!items || !Array.isArray(items)) {
    return {}
  }
  return items.reduce((acc, item) => {
    const id = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id
    acc[id] = item.value
    return acc
  }, {} as Record<number, string>)
}

// =============================================================================
// STATE GETTERS (with fallbacks)
// =============================================================================

/**
 * Get candidate states from dictionary or fallback
 */
export async function getCandidateStates(
  environment: BoondEnvironment = 'production'
): Promise<Record<number, string>> {
  const dictionary = await fetchDictionary(environment)
  const items = dictionary?.data?.attributes?.candidateStates
  const states = itemsToRecord(items)
  return Object.keys(states).length > 0 ? states : DEFAULT_CANDIDATE_STATES
}

/**
 * Get resource states from dictionary or fallback
 */
export async function getResourceStates(
  environment: BoondEnvironment = 'production'
): Promise<Record<number, string>> {
  const dictionary = await fetchDictionary(environment)
  const items = dictionary?.data?.attributes?.resourceStates
  const states = itemsToRecord(items)
  return Object.keys(states).length > 0 ? states : DEFAULT_RESOURCE_STATES
}

/**
 * Get opportunity states from dictionary or fallback
 */
export async function getOpportunityStates(
  environment: BoondEnvironment = 'production'
): Promise<Record<number, string>> {
  const dictionary = await fetchDictionary(environment)
  const items = dictionary?.data?.attributes?.opportunityStates
  const states = itemsToRecord(items)
  return Object.keys(states).length > 0 ? states : DEFAULT_OPPORTUNITY_STATES
}

/**
 * Get project states from dictionary or fallback
 */
export async function getProjectStates(
  environment: BoondEnvironment = 'production'
): Promise<Record<number, string>> {
  const dictionary = await fetchDictionary(environment)
  const items = dictionary?.data?.attributes?.projectStates
  const states = itemsToRecord(items)
  return Object.keys(states).length > 0 ? states : DEFAULT_PROJECT_STATES
}

/**
 * Get company states from dictionary or fallback
 */
export async function getCompanyStates(
  environment: BoondEnvironment = 'production'
): Promise<Record<number, string>> {
  const dictionary = await fetchDictionary(environment)
  const items = dictionary?.data?.attributes?.companyStates
  const states = itemsToRecord(items)
  return Object.keys(states).length > 0 ? states : DEFAULT_COMPANY_STATES
}

/**
 * Get positioning states from dictionary or fallback
 */
export async function getPositioningStates(
  environment: BoondEnvironment = 'production'
): Promise<Record<number, string>> {
  const dictionary = await fetchDictionary(environment)
  const items = dictionary?.data?.attributes?.positioningStates
  const states = itemsToRecord(items)
  return Object.keys(states).length > 0 ? states : DEFAULT_POSITIONING_STATES
}

/**
 * Get action types from dictionary or fallback
 */
export async function getActionTypes(
  environment: BoondEnvironment = 'production'
): Promise<Record<number, string>> {
  const dictionary = await fetchDictionary(environment)
  const items = dictionary?.data?.attributes?.actionTypes
  const types = itemsToRecord(items)
  return Object.keys(types).length > 0 ? types : DEFAULT_ACTION_TYPES
}

// =============================================================================
// LABEL GETTERS (for single state lookup)
// =============================================================================

/**
 * Get candidate state label by ID
 */
export async function getCandidateStateLabel(
  stateId: number,
  environment: BoondEnvironment = 'production'
): Promise<string> {
  const states = await getCandidateStates(environment)
  return states[stateId] || DEFAULT_CANDIDATE_STATES[stateId] || 'Inconnu'
}

/**
 * Get resource state label by ID
 */
export async function getResourceStateLabel(
  stateId: number,
  environment: BoondEnvironment = 'production'
): Promise<string> {
  const states = await getResourceStates(environment)
  return states[stateId] || DEFAULT_RESOURCE_STATES[stateId] || 'Inconnu'
}

/**
 * Get opportunity state label by ID
 */
export async function getOpportunityStateLabel(
  stateId: number,
  environment: BoondEnvironment = 'production'
): Promise<string> {
  const states = await getOpportunityStates(environment)
  return states[stateId] || DEFAULT_OPPORTUNITY_STATES[stateId] || 'Inconnu'
}

/**
 * Get project state label by ID
 */
export async function getProjectStateLabel(
  stateId: number,
  environment: BoondEnvironment = 'production'
): Promise<string> {
  const states = await getProjectStates(environment)
  return states[stateId] || DEFAULT_PROJECT_STATES[stateId] || 'Inconnu'
}

/**
 * Get company state label by ID
 */
export async function getCompanyStateLabel(
  stateId: number,
  environment: BoondEnvironment = 'production'
): Promise<string> {
  const states = await getCompanyStates(environment)
  return states[stateId] || DEFAULT_COMPANY_STATES[stateId] || 'Inconnu'
}

/**
 * Get positioning state label by ID
 */
export async function getPositioningStateLabel(
  stateId: number,
  environment: BoondEnvironment = 'production'
): Promise<string> {
  const states = await getPositioningStates(environment)
  return states[stateId] || DEFAULT_POSITIONING_STATES[stateId] || 'Inconnu'
}

/**
 * Get action type label by ID
 */
export async function getActionTypeLabel(
  typeId: number,
  environment: BoondEnvironment = 'production'
): Promise<string> {
  const types = await getActionTypes(environment)
  return types[typeId] || DEFAULT_ACTION_TYPES[typeId] || 'Autre'
}

// =============================================================================
// SYNC GETTERS (for synchronous access using cached/default values)
// These are useful when async is not practical (e.g., in render functions)
// =============================================================================

/**
 * Get candidate state label synchronously (uses cache or fallback)
 */
export function getCandidateStateLabelSync(stateId: number): string {
  const cachedStates = dictionaryCache?.data?.data?.attributes?.candidateStates
  if (cachedStates) {
    const item = cachedStates.find(s => s.id === stateId || s.id === stateId.toString())
    if (item) return item.value
  }
  return DEFAULT_CANDIDATE_STATES[stateId] || 'Inconnu'
}

/**
 * Get resource state label synchronously (uses cache or fallback)
 */
export function getResourceStateLabelSync(stateId: number): string {
  const cachedStates = dictionaryCache?.data?.data?.attributes?.resourceStates
  if (cachedStates) {
    const item = cachedStates.find(s => s.id === stateId || s.id === stateId.toString())
    if (item) return item.value
  }
  return DEFAULT_RESOURCE_STATES[stateId] || 'Inconnu'
}

/**
 * Get opportunity state label synchronously (uses cache or fallback)
 */
export function getOpportunityStateLabelSync(stateId: number): string {
  const cachedStates = dictionaryCache?.data?.data?.attributes?.opportunityStates
  if (cachedStates) {
    const item = cachedStates.find(s => s.id === stateId || s.id === stateId.toString())
    if (item) return item.value
  }
  return DEFAULT_OPPORTUNITY_STATES[stateId] || 'Inconnu'
}

/**
 * Get project state label synchronously (uses cache or fallback)
 */
export function getProjectStateLabelSync(stateId: number): string {
  const cachedStates = dictionaryCache?.data?.data?.attributes?.projectStates
  if (cachedStates) {
    const item = cachedStates.find(s => s.id === stateId || s.id === stateId.toString())
    if (item) return item.value
  }
  return DEFAULT_PROJECT_STATES[stateId] || 'Inconnu'
}

/**
 * Get company state label synchronously (uses cache or fallback)
 */
export function getCompanyStateLabelSync(stateId: number): string {
  const cachedStates = dictionaryCache?.data?.data?.attributes?.companyStates
  if (cachedStates) {
    const item = cachedStates.find(s => s.id === stateId || s.id === stateId.toString())
    if (item) return item.value
  }
  return DEFAULT_COMPANY_STATES[stateId] || 'Inconnu'
}

// =============================================================================
// BATCH STATE RESOLUTION (for importing/syncing many records)
// =============================================================================

export interface AllStates {
  candidateStates: Record<number, string>
  resourceStates: Record<number, string>
  opportunityStates: Record<number, string>
  projectStates: Record<number, string>
  companyStates: Record<number, string>
  positioningStates: Record<number, string>
  actionTypes: Record<number, string>
}

/**
 * Get all states at once (optimized for batch operations)
 */
export async function getAllStates(
  environment: BoondEnvironment = 'production'
): Promise<AllStates> {
  const dictionary = await fetchDictionary(environment)
  const attrs = dictionary?.data?.attributes

  return {
    candidateStates: itemsToRecord(attrs?.candidateStates) || DEFAULT_CANDIDATE_STATES,
    resourceStates: itemsToRecord(attrs?.resourceStates) || DEFAULT_RESOURCE_STATES,
    opportunityStates: itemsToRecord(attrs?.opportunityStates) || DEFAULT_OPPORTUNITY_STATES,
    projectStates: itemsToRecord(attrs?.projectStates) || DEFAULT_PROJECT_STATES,
    companyStates: itemsToRecord(attrs?.companyStates) || DEFAULT_COMPANY_STATES,
    positioningStates: itemsToRecord(attrs?.positioningStates) || DEFAULT_POSITIONING_STATES,
    actionTypes: itemsToRecord(attrs?.actionTypes) || DEFAULT_ACTION_TYPES,
  }
}

// =============================================================================
// EXPORTS FOR BACKWARDS COMPATIBILITY
// These are the default fallbacks that can be used synchronously
// =============================================================================

export const FALLBACK_CANDIDATE_STATES = DEFAULT_CANDIDATE_STATES
export const FALLBACK_RESOURCE_STATES = DEFAULT_RESOURCE_STATES
export const FALLBACK_OPPORTUNITY_STATES = DEFAULT_OPPORTUNITY_STATES
export const FALLBACK_PROJECT_STATES = DEFAULT_PROJECT_STATES
export const FALLBACK_COMPANY_STATES = DEFAULT_COMPANY_STATES
export const FALLBACK_POSITIONING_STATES = DEFAULT_POSITIONING_STATES
export const FALLBACK_ACTION_TYPES = DEFAULT_ACTION_TYPES
