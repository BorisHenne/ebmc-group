// BoondManager API Client - Dual Environment (Production & Sandbox)
// Documentation: https://doc.boondmanager.com/api-externe/
// Authentication: JWT Client (X-Jwt-Client-BoondManager header)

import { SignJWT } from 'jose'

// ==================== FEATURE FLAGS ====================
// Configure API endpoint access based on BoondManager permissions
// Set to true when API access is granted for each endpoint
// If you get a 403 error, set the corresponding flag to false and contact BoondManager support

export const BOOND_FEATURES = {
  // Core entities - Usually enabled by default
  CANDIDATES_ENABLED: true,
  RESOURCES_ENABLED: true,
  COMPANIES_ENABLED: false, // 403 - Requires permission from BoondManager
  OPPORTUNITIES_ENABLED: true,
  PROJECTS_ENABLED: false, // 403 - Requires permission from BoondManager

  // Contacts - Requires specific permission (currently 403)
  CONTACTS_ENABLED: false, // TODO: Enable when API access is granted

  // Actions/Activities
  ACTIONS_ENABLED: true,

  // Documents
  DOCUMENTS_ENABLED: true,

  // Positionings (Positionnements)
  POSITIONINGS_ENABLED: true,

  // Dictionary (Application settings)
  DICTIONARY_ENABLED: true,
} as const

export type BoondFeatureKey = keyof typeof BOOND_FEATURES

// Check if a feature is enabled
export function isFeatureEnabled(feature: BoondFeatureKey): boolean {
  return BOOND_FEATURES[feature]
}

// Get list of disabled features for diagnostics
export function getDisabledFeatures(): BoondFeatureKey[] {
  return (Object.keys(BOOND_FEATURES) as BoondFeatureKey[]).filter(
    key => !BOOND_FEATURES[key]
  )
}

// ==================== ERROR CLASSES ====================

export class BoondPermissionError extends Error {
  public readonly statusCode: number
  public readonly endpoint: string
  public readonly feature: BoondFeatureKey | null

  constructor(message: string, statusCode: number, endpoint: string, feature: BoondFeatureKey | null = null) {
    super(message)
    this.name = 'BoondPermissionError'
    this.statusCode = statusCode
    this.endpoint = endpoint
    this.feature = feature
  }
}

// Helper to create a disabled feature response
export function createDisabledResponse<T>(feature: string): BoondApiResponse<T[]> {
  return {
    data: [] as T[],
    meta: { totals: { rows: 0 } }
  }
}

// Message for disabled features
export function getDisabledFeatureMessage(feature: string): string {
  return `API ${feature} desactivee - Demandez les droits d'acces a BoondManager`
}

// ==================== TYPES ====================

export type BoondEnvironment = 'production' | 'sandbox'

export interface BoondCredentials {
  username: string
  password: string
  userToken: string
  clientToken: string
  clientKey: string
}

export interface BoondConfig {
  environment: BoondEnvironment
  baseUrl: string
  credentials: BoondCredentials
}

// API Response types
export interface BoondApiResponse<T> {
  data: T
  included?: Array<BoondResource | BoondCandidate | BoondOpportunity | BoondCompany | BoondContact | BoondProject>
  meta?: {
    totals?: {
      rows: number
    }
  }
}

// Dictionary item (label/value pair)
export interface BoondDictionaryItem {
  id: number | string
  value: string
  color?: string
  isDefault?: boolean
  isActive?: boolean
  order?: number
}

// Application Dictionary - Contains all labels, states, types
export interface BoondDictionary {
  data: {
    attributes: {
      // Entity states
      candidateStates?: BoondDictionaryItem[]
      resourceStates?: BoondDictionaryItem[]
      opportunityStates?: BoondDictionaryItem[]
      projectStates?: BoondDictionaryItem[]
      companyStates?: BoondDictionaryItem[]
      contactStates?: BoondDictionaryItem[]
      positioningStates?: BoondDictionaryItem[]
      actionStates?: BoondDictionaryItem[]
      // Entity types
      candidateTypes?: BoondDictionaryItem[]
      resourceTypes?: BoondDictionaryItem[]
      opportunityTypes?: BoondDictionaryItem[]
      projectTypes?: BoondDictionaryItem[]
      companyTypes?: BoondDictionaryItem[]
      actionTypes?: BoondDictionaryItem[]
      // Modes
      opportunityModes?: BoondDictionaryItem[]
      projectModes?: BoondDictionaryItem[]
      // Other dictionaries
      civilities?: BoondDictionaryItem[]
      countries?: BoondDictionaryItem[]
      currencies?: BoondDictionaryItem[]
      languages?: BoondDictionaryItem[]
      expertises?: BoondDictionaryItem[]
      expertiseLevels?: BoondDictionaryItem[]
      agencies?: BoondDictionaryItem[]
      poles?: BoondDictionaryItem[]
      origins?: BoondDictionaryItem[]
      sources?: BoondDictionaryItem[]
      durationUnits?: BoondDictionaryItem[]
      // Custom fields
      [key: string]: unknown
    }
  }
}

// Resource (Consultant/Employee)
export interface BoondResource {
  id: number
  type?: string
  attributes: {
    firstName: string
    lastName: string
    email: string
    civility: number | string
    state: number
    stateLabel?: string
    title?: string
    phone1?: string
    phone2?: string
    thumbnail?: string
    dateOfBirth?: string
    address?: string
    postcode?: string
    town?: string
    country?: string
    nationality?: string
    socialSecurityNumber?: string
    creationDate?: string
    updateDate?: string
    // Technical info
    typeOf?: number
    agency?: number
    expertise1?: number
    expertise2?: number
    expertise3?: number
    // Custom fields (depends on configuration)
    [key: string]: unknown
  }
  relationships?: {
    mainManager?: { data: { id: number; type: string } }
    agency?: { data: { id: number; type: string } }
    actions?: { data: Array<{ id: number; type: string }> }
  }
}

// Candidate
export interface BoondCandidate {
  id: number
  type?: string
  attributes: {
    firstName: string
    lastName: string
    email?: string
    civility: number | string
    state: number
    stateLabel?: string
    title?: string
    phone1?: string
    phone2?: string
    thumbnail?: string
    origin?: string
    source?: string
    linkedInUrl?: string
    address?: string
    postcode?: string
    town?: string
    country?: string
    nationality?: string
    dateOfBirth?: string
    creationDate?: string
    updateDate?: string
    lastActivityDate?: string
    // Availability
    availabilityDate?: string
    mobilityArea?: string
    // Salary expectations
    minimumSalary?: number
    maximumSalary?: number
    // Technical info
    typeOf?: number
    expertise1?: number
    expertise2?: number
    expertise3?: number
    experienceYears?: number
    // Custom fields
    [key: string]: unknown
  }
  relationships?: {
    mainManager?: { data: { id: number; type: string } }
    agency?: { data: { id: number; type: string } }
    actions?: { data: Array<{ id: number; type: string }> }
  }
}

// Opportunity (Need/Job)
export interface BoondOpportunity {
  id: number
  type?: string
  attributes: {
    title: string
    reference?: string
    state: number
    stateLabel?: string
    mode?: number
    typeOf?: number
    description?: string
    startDate?: string
    endDate?: string
    duration?: number
    durationUnit?: number
    averageDailyPriceExcludingTax?: number
    currency?: string
    probability?: number
    creationDate?: string
    updateDate?: string
    closedDate?: string
    // Location
    address?: string
    postcode?: string
    town?: string
    country?: string
    // Technical info
    expertise1?: number
    expertise2?: number
    expertise3?: number
    [key: string]: unknown
  }
  relationships?: {
    mainManager?: { data: { id: number; type: string } }
    company?: { data: { id: number; type: string } }
    contact?: { data: { id: number; type: string } }
    agency?: { data: { id: number; type: string } }
  }
}

// Company
export interface BoondCompany {
  id: number
  type?: string
  attributes: {
    name: string
    legalName?: string
    phone1?: string
    phone2?: string
    email?: string
    website?: string
    address?: string
    postcode?: string
    town?: string
    country?: string
    staff?: number
    revenue?: number
    siret?: string
    nafCode?: string
    legalForm?: string
    state?: number
    stateLabel?: string
    typeOf?: number
    creationDate?: string
    updateDate?: string
    [key: string]: unknown
  }
  relationships?: {
    mainManager?: { data: { id: number; type: string } }
    agency?: { data: { id: number; type: string } }
  }
}

// Contact (Person in a Company)
export interface BoondContact {
  id: number
  type?: string
  attributes: {
    firstName: string
    lastName: string
    email?: string
    civility?: number | string
    phone1?: string
    phone2?: string
    position?: string
    state?: number
    stateLabel?: string
    creationDate?: string
    updateDate?: string
    [key: string]: unknown
  }
  relationships?: {
    company?: { data: { id: number; type: string } }
    mainManager?: { data: { id: number; type: string } }
  }
}

// Project
export interface BoondProject {
  id: number
  type?: string
  attributes: {
    title: string
    reference?: string
    state: number
    stateLabel?: string
    typeOf?: number
    mode?: number
    startDate?: string
    endDate?: string
    description?: string
    amount?: number
    currency?: string
    creationDate?: string
    updateDate?: string
    [key: string]: unknown
  }
  relationships?: {
    mainManager?: { data: { id: number; type: string } }
    company?: { data: { id: number; type: string } }
    contact?: { data: { id: number; type: string } }
    opportunity?: { data: { id: number; type: string } }
  }
}

// Action (Activity/Task)
export interface BoondAction {
  id: number
  type?: string
  attributes: {
    typeOf: number
    typeOfLabel?: string
    state: number
    stateLabel?: string
    startDate?: string
    endDate?: string
    comment?: string
    creationDate?: string
    updateDate?: string
    [key: string]: unknown
  }
  relationships?: {
    resource?: { data: { id: number; type: string } }
    candidate?: { data: { id: number; type: string } }
    opportunity?: { data: { id: number; type: string } }
    project?: { data: { id: number; type: string } }
    mainManager?: { data: { id: number; type: string } }
  }
}

// Positioning (Placement)
export interface BoondPositioning {
  id: number
  type?: string
  attributes: {
    state: number
    stateLabel?: string
    startDate?: string
    endDate?: string
    averageDailyPriceExcludingTax?: number
    creationDate?: string
    updateDate?: string
    [key: string]: unknown
  }
  relationships?: {
    resource?: { data: { id: number; type: string } }
    candidate?: { data: { id: number; type: string } }
    opportunity?: { data: { id: number; type: string } }
  }
}

// Document
export interface BoondDocument {
  id: number
  type?: string
  attributes: {
    name: string
    originalName?: string
    mimeType?: string
    size?: number
    creationDate?: string
    updateDate?: string
    [key: string]: unknown
  }
}

// ==================== STATE MAPPINGS ====================
// Note: State labels are now fetched dynamically from BoondManager API.
// These are fallback values used when the API is unavailable.
// For dynamic state lookups, use functions from '@/lib/boondmanager-dictionary'

export const CANDIDATE_STATES: Record<number, string> = {
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

export const RESOURCE_STATES: Record<number, string> = {
  0: 'Non défini',
  1: 'Disponible',
  2: 'En mission',
  3: 'Intercontrat',
  4: 'Indisponible',
  5: 'Sorti',
}

export const OPPORTUNITY_STATES: Record<number, string> = {
  0: 'En cours',
  1: 'Gagnée',
  2: 'Perdue',
  3: 'Abandonnée',
}

export const PROJECT_STATES: Record<number, string> = {
  0: 'En préparation',
  1: 'En cours',
  2: 'Terminé',
  3: 'Annulé',
}

export const COMPANY_STATES: Record<number, string> = {
  0: 'Prospect',
  1: 'Client',
  2: 'Ancien client',
  3: 'Fournisseur',
  4: 'Archivé',
}

export const ACTION_TYPES: Record<number, string> = {
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

export const POSITIONING_STATES: Record<number, string> = {
  0: 'En attente',
  1: 'Proposé',
  2: 'Validé',
  3: 'Refusé',
  4: 'Annulé',
}

// ==================== CREDENTIALS CONFIG ====================

export const BOOND_CREDENTIALS = {
  production: {
    username: 'b.henne@ebmc.eu',
    password: 'Henne2024@!',
    userToken: '3232322e65626d63',
    clientToken: '65626d63',
    clientKey: '988a5c655f628794b290',
  },
  sandbox: {
    username: 'b.henne@ebmc.eu',
    password: 'Henne2024@!',
    userToken: '322e65626d635f73616e64626f78',
    clientToken: '65626d635f73616e64626f78',
    clientKey: '826cc16cca2d6bae6fef',
  },
}

// BoondManager utilise la même URL, les tokens différencient prod/sandbox
export const BOOND_BASE_URL = 'https://ui.boondmanager.com/api'

// ==================== CLIENT CLASS ====================

export class BoondManagerClient {
  private baseUrl: string
  private environment: BoondEnvironment
  private credentials: BoondCredentials

  constructor(environment: BoondEnvironment = 'sandbox') {
    this.environment = environment
    this.credentials = BOOND_CREDENTIALS[environment]
    this.baseUrl = BOOND_BASE_URL
    console.log(`[BoondManager] Client initialized for ${environment}`)
    console.log(`[BoondManager] Using userToken: ${this.credentials.userToken}`)
  }

  // Generate JWT for BoondManager API authentication
  private async generateJWT(): Promise<string> {
    const secret = new TextEncoder().encode(this.credentials.clientKey)

    // Use tokens as-is (hex format) - BoondManager expects raw hex tokens
    console.log(`[BoondManager] JWT clientToken: ${this.credentials.clientToken}`)
    console.log(`[BoondManager] JWT userToken: ${this.credentials.userToken}`)

    const jwt = await new SignJWT({
      // clientToken identifies the application (hex format)
      clientToken: this.credentials.clientToken,
      // userToken identifies the user/space (hex format)
      userToken: this.credentials.userToken,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret)

    return jwt
  }

  // Check if write operations are allowed
  private canWrite(): boolean {
    return this.environment === 'sandbox'
  }

  // Throw error if trying to write in production
  private assertCanWrite(operation: string): void {
    if (!this.canWrite()) {
      throw new Error(`Operation "${operation}" non autorisee en production. Utilisez l'environnement sandbox.`)
    }
  }

  // Detect which feature an endpoint relates to (for error reporting)
  private detectFeatureFromEndpoint(endpoint: string): BoondFeatureKey | null {
    if (endpoint.includes('/contacts')) return 'CONTACTS_ENABLED'
    if (endpoint.includes('/candidates')) return 'CANDIDATES_ENABLED'
    if (endpoint.includes('/resources')) return 'RESOURCES_ENABLED'
    if (endpoint.includes('/companies')) return 'COMPANIES_ENABLED'
    if (endpoint.includes('/opportunities')) return 'OPPORTUNITIES_ENABLED'
    if (endpoint.includes('/projects')) return 'PROJECTS_ENABLED'
    if (endpoint.includes('/actions')) return 'ACTIONS_ENABLED'
    if (endpoint.includes('/documents')) return 'DOCUMENTS_ENABLED'
    if (endpoint.includes('/positionings')) return 'POSITIONINGS_ENABLED'
    if (endpoint.includes('/dictionary')) return 'DICTIONARY_ENABLED'
    return null
  }

  // Generic fetch method
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Generate JWT for this request
    const jwtToken = await this.generateJWT()

    // DEBUG: Log which environment is being used
    console.log(`[BoondManager] Fetching ${endpoint}`)
    console.log(`[BoondManager] Environment: ${this.environment}`)
    console.log(`[BoondManager] UserToken: ${this.credentials.userToken}`)

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // JWT Client authentication - identifies the space (LMGC or LMGC-SANDBOX)
        'X-Jwt-Client-BoondManager': jwtToken,
        ...options.headers,
      },
      // Disable Next.js cache for API calls
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`BoondManager API error [${this.environment}]:`, response.status, errorText)

      // Handle permission errors (403) specially
      if (response.status === 403) {
        // Try to detect which feature this relates to
        const feature = this.detectFeatureFromEndpoint(endpoint)
        throw new BoondPermissionError(
          `Acces refuse (403) pour ${endpoint} - Demandez les droits a BoondManager`,
          403,
          endpoint,
          feature
        )
      }

      throw new Error(`BoondManager API error: ${response.status} - ${errorText}`)
    }

    // Handle empty responses (like DELETE)
    const text = await response.text()
    if (!text) {
      return {} as T
    }

    // Check if response is HTML instead of JSON (indicates auth issue or redirect)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error(`[BoondManager] Received HTML instead of JSON for ${endpoint}`)
      console.error(`[BoondManager] First 500 chars: ${text.substring(0, 500)}`)
      throw new Error(`BoondManager returned HTML instead of JSON - possible auth issue or redirect. Status: ${response.status}`)
    }

    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error(`[BoondManager] Failed to parse JSON for ${endpoint}:`, text.substring(0, 500))
      throw new Error(`BoondManager returned invalid JSON: ${text.substring(0, 200)}...`)
    }
  }

  // Get current environment
  getEnvironment(): BoondEnvironment {
    return this.environment
  }

  // ==================== APPLICATION ====================

  async getCurrentUser(): Promise<BoondApiResponse<BoondResource>> {
    return this.fetch('/application/current-user')
  }

  async getApplicationSettings(): Promise<BoondApiResponse<Record<string, unknown>>> {
    return this.fetch('/application/settings')
  }

  // Get application dictionary (all labels, states, types, etc.)
  async getDictionary(): Promise<BoondDictionary> {
    return this.fetch('/application/dictionary')
  }

  // ==================== CANDIDATES ====================

  async getCandidates(params?: {
    page?: number
    maxResults?: number
    keywords?: string
    state?: number
    mainManager?: number
    sort?: string
  }): Promise<BoondApiResponse<BoondCandidate[]>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.maxResults) searchParams.set('maxResults', params.maxResults.toString())
    if (params?.keywords) searchParams.set('keywords', params.keywords)
    if (params?.state !== undefined) searchParams.set('state', params.state.toString())
    if (params?.mainManager) searchParams.set('mainManager', params.mainManager.toString())
    searchParams.set('sort', params?.sort || '-updateDate')

    return this.fetch(`/candidates?${searchParams.toString()}`)
  }

  async getCandidate(id: number): Promise<BoondApiResponse<BoondCandidate>> {
    return this.fetch(`/candidates/${id}`)
  }

  async getCandidateInformation(id: number): Promise<BoondApiResponse<BoondCandidate>> {
    return this.fetch(`/candidates/${id}/information`)
  }

  async getCandidateActions(id: number): Promise<BoondApiResponse<BoondAction[]>> {
    return this.fetch(`/candidates/${id}/actions`)
  }

  async searchCandidates(query: string, page = 1, limit = 50): Promise<BoondApiResponse<BoondCandidate[]>> {
    return this.getCandidates({ keywords: query, page, maxResults: limit })
  }

  async createCandidate(data: {
    firstName: string
    lastName: string
    civility?: number
    email?: string
    phone1?: string
    title?: string
    origin?: string
    state?: number
  }): Promise<BoondApiResponse<BoondCandidate>> {
    this.assertCanWrite('createCandidate')

    return this.fetch('/candidates', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'candidate',
          attributes: {
            firstName: data.firstName,
            lastName: data.lastName,
            civility: data.civility ?? 0,
            email: data.email || '',
            phone1: data.phone1 || '',
            title: data.title || '',
            origin: data.origin || 'API',
            state: data.state ?? 1,
          }
        }
      })
    })
  }

  async updateCandidate(id: number, data: Partial<{
    firstName: string
    lastName: string
    civility: number
    email: string
    phone1: string
    title: string
    origin: string
    state: number
    address: string
    postcode: string
    town: string
    country: string
  }>): Promise<BoondApiResponse<BoondCandidate>> {
    this.assertCanWrite('updateCandidate')

    return this.fetch(`/candidates/${id}/information`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          attributes: data
        }
      })
    })
  }

  async deleteCandidate(id: number): Promise<void> {
    this.assertCanWrite('deleteCandidate')
    await this.fetch(`/candidates/${id}`, { method: 'DELETE' })
  }

  // ==================== RESOURCES ====================

  async getResources(params?: {
    page?: number
    maxResults?: number
    keywords?: string
    state?: number
    mainManager?: number
    sort?: string
  }): Promise<BoondApiResponse<BoondResource[]>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.maxResults) searchParams.set('maxResults', params.maxResults.toString())
    if (params?.keywords) searchParams.set('keywords', params.keywords)
    if (params?.state !== undefined) searchParams.set('state', params.state.toString())
    if (params?.mainManager) searchParams.set('mainManager', params.mainManager.toString())
    searchParams.set('sort', params?.sort || '-updateDate')

    return this.fetch(`/resources?${searchParams.toString()}`)
  }

  async getResource(id: number): Promise<BoondApiResponse<BoondResource>> {
    return this.fetch(`/resources/${id}`)
  }

  async getResourceInformation(id: number): Promise<BoondApiResponse<BoondResource>> {
    return this.fetch(`/resources/${id}/information`)
  }

  async getResourceActions(id: number): Promise<BoondApiResponse<BoondAction[]>> {
    return this.fetch(`/resources/${id}/actions`)
  }

  async searchResources(query: string, page = 1, limit = 50): Promise<BoondApiResponse<BoondResource[]>> {
    return this.getResources({ keywords: query, page, maxResults: limit })
  }

  async createResource(data: {
    firstName: string
    lastName: string
    civility?: number
    email?: string
    phone1?: string
    title?: string
    state?: number
  }): Promise<BoondApiResponse<BoondResource>> {
    this.assertCanWrite('createResource')

    return this.fetch('/resources', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'resource',
          attributes: {
            firstName: data.firstName,
            lastName: data.lastName,
            civility: data.civility ?? 0,
            email: data.email || '',
            phone1: data.phone1 || '',
            title: data.title || '',
            state: data.state ?? 1,
          }
        }
      })
    })
  }

  async updateResource(id: number, data: Partial<{
    firstName: string
    lastName: string
    civility: number
    email: string
    phone1: string
    title: string
    state: number
  }>): Promise<BoondApiResponse<BoondResource>> {
    this.assertCanWrite('updateResource')

    return this.fetch(`/resources/${id}/information`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          attributes: data
        }
      })
    })
  }

  async deleteResource(id: number): Promise<void> {
    this.assertCanWrite('deleteResource')
    await this.fetch(`/resources/${id}`, { method: 'DELETE' })
  }

  // ==================== OPPORTUNITIES ====================

  async getOpportunities(params?: {
    page?: number
    maxResults?: number
    keywords?: string
    state?: number
    mainManager?: number
    company?: number
    sort?: string
  }): Promise<BoondApiResponse<BoondOpportunity[]>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.maxResults) searchParams.set('maxResults', params.maxResults.toString())
    if (params?.keywords) searchParams.set('keywords', params.keywords)
    if (params?.state !== undefined) searchParams.set('state', params.state.toString())
    if (params?.mainManager) searchParams.set('mainManager', params.mainManager.toString())
    if (params?.company) searchParams.set('company', params.company.toString())
    searchParams.set('sort', params?.sort || '-updateDate')

    return this.fetch(`/opportunities?${searchParams.toString()}`)
  }

  async getOpportunity(id: number): Promise<BoondApiResponse<BoondOpportunity>> {
    return this.fetch(`/opportunities/${id}`)
  }

  async getOpportunityInformation(id: number): Promise<BoondApiResponse<BoondOpportunity>> {
    return this.fetch(`/opportunities/${id}/information`)
  }

  async getOpportunityActions(id: number): Promise<BoondApiResponse<BoondAction[]>> {
    return this.fetch(`/opportunities/${id}/actions`)
  }

  async getOpportunityPositionings(id: number): Promise<BoondApiResponse<BoondPositioning[]>> {
    return this.fetch(`/opportunities/${id}/positionings`)
  }

  async searchOpportunities(query: string, page = 1, limit = 50): Promise<BoondApiResponse<BoondOpportunity[]>> {
    return this.getOpportunities({ keywords: query, page, maxResults: limit })
  }

  async createOpportunity(data: {
    title: string
    mode?: number
    state?: number
    typeOf?: number
    companyId?: number
    contactId?: number
    mainManagerId?: number
    description?: string
    startDate?: string
    averageDailyPriceExcludingTax?: number
  }): Promise<BoondApiResponse<BoondOpportunity>> {
    this.assertCanWrite('createOpportunity')

    const body: Record<string, unknown> = {
      data: {
        type: 'opportunity',
        attributes: {
          title: data.title,
          mode: data.mode ?? 1,
          state: data.state ?? 0,
          typeOf: data.typeOf ?? 1,
          description: data.description || '',
          startDate: data.startDate || null,
          averageDailyPriceExcludingTax: data.averageDailyPriceExcludingTax || 0,
        },
        relationships: {} as Record<string, unknown>
      }
    }

    if (data.companyId) {
      (body.data as Record<string, unknown>).relationships = {
        ...((body.data as Record<string, unknown>).relationships as Record<string, unknown>),
        company: { data: { id: data.companyId.toString(), type: 'company' } }
      }
    }
    if (data.contactId) {
      (body.data as Record<string, unknown>).relationships = {
        ...((body.data as Record<string, unknown>).relationships as Record<string, unknown>),
        contact: { data: { id: data.contactId.toString(), type: 'contact' } }
      }
    }
    if (data.mainManagerId) {
      (body.data as Record<string, unknown>).relationships = {
        ...((body.data as Record<string, unknown>).relationships as Record<string, unknown>),
        mainManager: { data: { id: data.mainManagerId.toString(), type: 'resource' } }
      }
    }

    return this.fetch('/opportunities', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  async updateOpportunity(id: number, data: Partial<{
    title: string
    state: number
    description: string
    startDate: string
    endDate: string
    averageDailyPriceExcludingTax: number
  }>): Promise<BoondApiResponse<BoondOpportunity>> {
    this.assertCanWrite('updateOpportunity')

    return this.fetch(`/opportunities/${id}/information`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          type: 'opportunity',
          attributes: data
        }
      })
    })
  }

  async deleteOpportunity(id: number): Promise<void> {
    this.assertCanWrite('deleteOpportunity')
    await this.fetch(`/opportunities/${id}`, { method: 'DELETE' })
  }

  // ==================== COMPANIES ====================

  async getCompanies(params?: {
    page?: number
    maxResults?: number
    keywords?: string
    state?: number
    mainManager?: number
    sort?: string
  }): Promise<BoondApiResponse<BoondCompany[]>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.maxResults) searchParams.set('maxResults', params.maxResults.toString())
    if (params?.keywords) searchParams.set('keywords', params.keywords)
    if (params?.state !== undefined) searchParams.set('state', params.state.toString())
    if (params?.mainManager) searchParams.set('mainManager', params.mainManager.toString())
    searchParams.set('sort', params?.sort || '-updateDate')

    return this.fetch(`/companies?${searchParams.toString()}`)
  }

  async getCompany(id: number): Promise<BoondApiResponse<BoondCompany>> {
    return this.fetch(`/companies/${id}`)
  }

  async getCompanyInformation(id: number): Promise<BoondApiResponse<BoondCompany>> {
    return this.fetch(`/companies/${id}/information`)
  }

  async getCompanyContacts(id: number): Promise<BoondApiResponse<BoondContact[]>> {
    return this.fetch(`/companies/${id}/contacts`)
  }

  async getCompanyOpportunities(id: number): Promise<BoondApiResponse<BoondOpportunity[]>> {
    return this.fetch(`/companies/${id}/opportunities`)
  }

  async getCompanyProjects(id: number): Promise<BoondApiResponse<BoondProject[]>> {
    return this.fetch(`/companies/${id}/projects`)
  }

  async searchCompanies(query: string, page = 1, limit = 50): Promise<BoondApiResponse<BoondCompany[]>> {
    return this.getCompanies({ keywords: query, page, maxResults: limit })
  }

  async createCompany(data: {
    name: string
    phone1?: string
    country?: string
    staff?: number
    email?: string
    website?: string
    address?: string
    postcode?: string
    town?: string
  }): Promise<BoondApiResponse<BoondCompany>> {
    this.assertCanWrite('createCompany')

    return this.fetch('/companies', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            name: data.name,
            phone1: data.phone1 || '',
            country: data.country || 'FR',
            staff: data.staff || 0,
            email: data.email || '',
            website: data.website || '',
            address: data.address || '',
            postcode: data.postcode || '',
            town: data.town || '',
          }
        }
      })
    })
  }

  async updateCompany(id: number, data: Partial<{
    name: string
    phone1: string
    country: string
    staff: number
    email: string
    website: string
    state: number
  }>): Promise<BoondApiResponse<BoondCompany>> {
    this.assertCanWrite('updateCompany')

    return this.fetch(`/companies/${id}/information`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          attributes: data
        }
      })
    })
  }

  async deleteCompany(id: number): Promise<void> {
    this.assertCanWrite('deleteCompany')
    await this.fetch(`/companies/${id}`, { method: 'DELETE' })
  }

  // ==================== CONTACTS ====================

  async getContacts(params?: {
    page?: number
    maxResults?: number
    keywords?: string
    company?: number
    sort?: string
  }): Promise<BoondApiResponse<BoondContact[]>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.maxResults) searchParams.set('maxResults', params.maxResults.toString())
    if (params?.keywords) searchParams.set('keywords', params.keywords)
    if (params?.company) searchParams.set('company', params.company.toString())
    searchParams.set('sort', params?.sort || '-updateDate')

    return this.fetch(`/contacts?${searchParams.toString()}`)
  }

  async getContact(id: number): Promise<BoondApiResponse<BoondContact>> {
    return this.fetch(`/contacts/${id}`)
  }

  async searchContacts(query: string, page = 1, limit = 50): Promise<BoondApiResponse<BoondContact[]>> {
    return this.getContacts({ keywords: query, page, maxResults: limit })
  }

  async createContact(data: {
    firstName: string
    lastName: string
    companyId: number
    civility?: number
    email?: string
    phone1?: string
    position?: string
  }): Promise<BoondApiResponse<BoondContact>> {
    this.assertCanWrite('createContact')

    return this.fetch('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'contact',
          attributes: {
            firstName: data.firstName,
            lastName: data.lastName,
            civility: data.civility ?? 0,
            email: data.email || '',
            phone1: data.phone1 || '',
            position: data.position || '',
          },
          relationships: {
            company: { data: { id: data.companyId.toString(), type: 'company' } }
          }
        }
      })
    })
  }

  async updateContact(id: number, data: Partial<{
    firstName: string
    lastName: string
    civility: number
    email: string
    phone1: string
    position: string
  }>): Promise<BoondApiResponse<BoondContact>> {
    this.assertCanWrite('updateContact')

    return this.fetch(`/contacts/${id}/information`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          attributes: data
        }
      })
    })
  }

  async deleteContact(id: number): Promise<void> {
    this.assertCanWrite('deleteContact')
    await this.fetch(`/contacts/${id}`, { method: 'DELETE' })
  }

  // ==================== PROJECTS ====================

  async getProjects(params?: {
    page?: number
    maxResults?: number
    keywords?: string
    state?: number
    mainManager?: number
    company?: number
    sort?: string
  }): Promise<BoondApiResponse<BoondProject[]>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.maxResults) searchParams.set('maxResults', params.maxResults.toString())
    if (params?.keywords) searchParams.set('keywords', params.keywords)
    if (params?.state !== undefined) searchParams.set('state', params.state.toString())
    if (params?.mainManager) searchParams.set('mainManager', params.mainManager.toString())
    if (params?.company) searchParams.set('company', params.company.toString())
    searchParams.set('sort', params?.sort || '-updateDate')

    return this.fetch(`/projects?${searchParams.toString()}`)
  }

  async getProject(id: number): Promise<BoondApiResponse<BoondProject>> {
    return this.fetch(`/projects/${id}`)
  }

  async getProjectInformation(id: number): Promise<BoondApiResponse<BoondProject>> {
    return this.fetch(`/projects/${id}/information`)
  }

  async getProjectActions(id: number): Promise<BoondApiResponse<BoondAction[]>> {
    return this.fetch(`/projects/${id}/actions`)
  }

  async getProjectBatchesMarkers(id: number): Promise<BoondApiResponse<unknown>> {
    return this.fetch(`/projects/${id}/batches-markers`)
  }

  async getProjectDeliveries(id: number): Promise<BoondApiResponse<unknown>> {
    return this.fetch(`/projects/${id}/deliveries-groupments`)
  }

  async searchProjects(query: string, page = 1, limit = 50): Promise<BoondApiResponse<BoondProject[]>> {
    return this.getProjects({ keywords: query, page, maxResults: limit })
  }

  // ==================== ACTIONS ====================

  async getActions(params?: {
    page?: number
    maxResults?: number
    resource?: number
    candidate?: number
    opportunity?: number
    project?: number
    typeOf?: number
    state?: number
    sort?: string
  }): Promise<BoondApiResponse<BoondAction[]>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.maxResults) searchParams.set('maxResults', params.maxResults.toString())
    if (params?.resource) searchParams.set('resource', params.resource.toString())
    if (params?.candidate) searchParams.set('candidate', params.candidate.toString())
    if (params?.opportunity) searchParams.set('opportunity', params.opportunity.toString())
    if (params?.project) searchParams.set('project', params.project.toString())
    if (params?.typeOf) searchParams.set('typeOf', params.typeOf.toString())
    if (params?.state !== undefined) searchParams.set('state', params.state.toString())
    searchParams.set('sort', params?.sort || '-updateDate')

    return this.fetch(`/actions?${searchParams.toString()}`)
  }

  async getAction(id: number): Promise<BoondApiResponse<BoondAction>> {
    return this.fetch(`/actions/${id}`)
  }

  async createAction(data: {
    typeOf: number
    state?: number
    comment?: string
    startDate?: string
    endDate?: string
    resourceId?: number
    candidateId?: number
    opportunityId?: number
    projectId?: number
  }): Promise<BoondApiResponse<BoondAction>> {
    this.assertCanWrite('createAction')

    const relationships: Record<string, unknown> = {}
    if (data.resourceId) relationships.resource = { data: { id: data.resourceId.toString(), type: 'resource' } }
    if (data.candidateId) relationships.candidate = { data: { id: data.candidateId.toString(), type: 'candidate' } }
    if (data.opportunityId) relationships.opportunity = { data: { id: data.opportunityId.toString(), type: 'opportunity' } }
    if (data.projectId) relationships.project = { data: { id: data.projectId.toString(), type: 'project' } }

    return this.fetch('/actions', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'action',
          attributes: {
            typeOf: data.typeOf,
            state: data.state ?? 0,
            comment: data.comment || '',
            startDate: data.startDate || null,
            endDate: data.endDate || null,
          },
          relationships
        }
      })
    })
  }

  // ==================== POSITIONINGS ====================

  async getPositionings(params?: {
    page?: number
    maxResults?: number
    resource?: number
    candidate?: number
    opportunity?: number
    state?: number
    sort?: string
  }): Promise<BoondApiResponse<BoondPositioning[]>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.maxResults) searchParams.set('maxResults', params.maxResults.toString())
    if (params?.resource) searchParams.set('resource', params.resource.toString())
    if (params?.candidate) searchParams.set('candidate', params.candidate.toString())
    if (params?.opportunity) searchParams.set('opportunity', params.opportunity.toString())
    if (params?.state !== undefined) searchParams.set('state', params.state.toString())
    searchParams.set('sort', params?.sort || '-updateDate')

    return this.fetch(`/positionings?${searchParams.toString()}`)
  }

  async getPositioning(id: number): Promise<BoondApiResponse<BoondPositioning>> {
    return this.fetch(`/positionings/${id}`)
  }

  async updatePositioning(id: number, data: { state: number }): Promise<BoondApiResponse<BoondPositioning>> {
    this.assertCanWrite('updatePositioning')

    return this.fetch(`/positionings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          type: 'opportunity',
          attributes: data
        }
      })
    })
  }

  // ==================== DOCUMENTS ====================

  /**
   * Download a document by ID - returns binary content
   * Based on Python script: GET /documents/{id}
   */
  async downloadDocument(documentId: number): Promise<{ content: ArrayBuffer; filename: string; mimeType: string }> {
    const jwtToken = await this.generateJWT()

    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      headers: {
        'X-Jwt-Client-BoondManager': jwtToken,
      },
    })

    if (!response.ok) {
      if (response.status === 403) {
        throw new BoondPermissionError(
          `Access denied to document ${documentId}`,
          403,
          `/documents/${documentId}`,
          'DOCUMENTS_ENABLED'
        )
      }
      throw new Error(`BoondManager API error: ${response.status}`)
    }

    // Get filename from Content-Disposition header or default
    const contentDisposition = response.headers.get('content-disposition')
    let filename = `document_${documentId}`
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match) {
        filename = match[1].replace(/['"]/g, '')
      }
    }

    const mimeType = response.headers.get('content-type') || 'application/octet-stream'
    const content = await response.arrayBuffer()

    return { content, filename, mimeType }
  }

  /**
   * Get document metadata (without downloading content)
   */
  async getDocument(documentId: number): Promise<BoondApiResponse<BoondDocument>> {
    return this.fetch(`/documents/${documentId}/information`)
  }

  /**
   * Get resumes/CVs for a resource
   * Based on Python script structure: GET /resources/{id}/information
   * Returns documents from the 'included' array where type='document' and linked to resumes
   */
  async getResourceResumes(resourceId: number): Promise<BoondDocument[]> {
    const response = await this.fetch<BoondApiResponse<BoondResource>>(`/resources/${resourceId}/information`)

    // Extract documents from included array (like Python script)
    const documents: BoondDocument[] = []
    if (response.included && Array.isArray(response.included)) {
      for (const item of response.included) {
        if (item.type === 'document') {
          documents.push(item as unknown as BoondDocument)
        }
      }
    }

    return documents
  }

  /**
   * Get resumes/CVs for a candidate
   */
  async getCandidateResumes(candidateId: number): Promise<BoondDocument[]> {
    const response = await this.fetch<BoondApiResponse<BoondCandidate>>(`/candidates/${candidateId}/information`)

    const documents: BoondDocument[] = []
    if (response.included && Array.isArray(response.included)) {
      for (const item of response.included) {
        if (item.type === 'document') {
          documents.push(item as unknown as BoondDocument)
        }
      }
    }

    return documents
  }

  async uploadDocument(file: ArrayBuffer | Blob, filename: string, parentId: number, parentType: 'candidate' | 'resource' | 'resourceResume'): Promise<BoondApiResponse<BoondDocument>> {
    this.assertCanWrite('uploadDocument')

    const jwtToken = await this.generateJWT()

    const formData = new FormData()
    formData.append('parentId', parentId.toString())
    formData.append('parentType', parentType)

    const blob = file instanceof Blob ? file : new Blob([file])
    formData.append('file', blob, filename)

    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      headers: {
        'X-Jwt-Client-BoondManager': jwtToken,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`BoondManager API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  // ==================== DASHBOARD & STATS ====================

  async getDashboardStats(): Promise<{
    candidates: { total: number; byState: Record<number, number>; error?: string }
    resources: { total: number; byState: Record<number, number>; error?: string }
    opportunities: { total: number; byState: Record<number, number>; error?: string }
    companies: { total: number; byState: Record<number, number>; error?: string }
    projects: { total: number; byState: Record<number, number>; error?: string }
    disabledEndpoints?: string[]
  }> {
    // Helper to safely fetch with 403 handling - returns total from meta.totals.rows
    const safeFetch = async <T>(
      fetcher: () => Promise<BoondApiResponse<T[]>>,
      name: string
    ): Promise<{ data: T[]; total: number; error?: string }> => {
      try {
        const result = await fetcher()
        // Use meta.totals.rows for the real total count (not data.length which is limited by pagination)
        const total = result.meta?.totals?.rows ?? (Array.isArray(result.data) ? result.data.length : 0)
        return {
          data: Array.isArray(result.data) ? result.data : [],
          total
        }
      } catch (error) {
        if (error instanceof BoondPermissionError) {
          console.warn(`Permission denied for ${name}: ${error.message}`)
          return { data: [], total: 0, error: `403 - Acces refuse pour ${name}` }
        }
        throw error // Re-throw non-permission errors
      }
    }

    const [candidates, resources, opportunities, companies, projects] = await Promise.all([
      safeFetch(() => this.getCandidates({ maxResults: 500 }), 'candidates'),
      safeFetch(() => this.getResources({ maxResults: 500 }), 'resources'),
      safeFetch(() => this.getOpportunities({ maxResults: 500 }), 'opportunities'),
      safeFetch(() => this.getCompanies({ maxResults: 500 }), 'companies'),
      safeFetch(() => this.getProjects({ maxResults: 500 }), 'projects'),
    ])

    const countByState = <T extends { attributes: { state?: number } }>(items: T[]): Record<number, number> => {
      const list = Array.isArray(items) ? items : []
      return list.reduce((acc, item) => {
        const state = item.attributes.state ?? 0
        acc[state] = (acc[state] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }

    // Collect disabled endpoints for reporting
    const disabledEndpoints: string[] = []
    if (candidates.error) disabledEndpoints.push('candidates')
    if (resources.error) disabledEndpoints.push('resources')
    if (opportunities.error) disabledEndpoints.push('opportunities')
    if (companies.error) disabledEndpoints.push('companies')
    if (projects.error) disabledEndpoints.push('projects')

    return {
      candidates: {
        total: candidates.total,  // Use total from meta.totals.rows
        byState: countByState(candidates.data),
        ...(candidates.error && { error: candidates.error }),
      },
      resources: {
        total: resources.total,
        byState: countByState(resources.data),
        ...(resources.error && { error: resources.error }),
      },
      opportunities: {
        total: opportunities.total,
        byState: countByState(opportunities.data),
        ...(opportunities.error && { error: opportunities.error }),
      },
      companies: {
        total: companies.total,
        byState: countByState(companies.data),
        ...(companies.error && { error: companies.error }),
      },
      projects: {
        total: projects.total,
        byState: countByState(projects.data),
        ...(projects.error && { error: projects.error }),
      },
      ...(disabledEndpoints.length > 0 && { disabledEndpoints }),
    }
  }
}

// Factory function to create client
export function createBoondClient(environment: BoondEnvironment = 'sandbox'): BoondManagerClient {
  return new BoondManagerClient(environment)
}
