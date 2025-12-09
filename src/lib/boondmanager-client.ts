// BoondManager API Client - Dual Environment (Production & Sandbox)
// Documentation: https://doc.boondmanager.com/api-externe/

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

export const CANDIDATE_STATES: Record<number, string> = {
  0: 'Nouveau',
  1: 'A qualifier',
  2: 'Qualifie',
  3: 'En cours',
  4: 'Entretien',
  5: 'Proposition',
  6: 'Embauche',
  7: 'Refuse',
  8: 'Archive',
}

export const RESOURCE_STATES: Record<number, string> = {
  0: 'Non defini',
  1: 'Disponible',
  2: 'En mission',
  3: 'Intercontrat',
  4: 'Indisponible',
  5: 'Sorti',
}

export const OPPORTUNITY_STATES: Record<number, string> = {
  0: 'En cours',
  1: 'Gagnee',
  2: 'Perdue',
  3: 'Abandonnee',
}

export const PROJECT_STATES: Record<number, string> = {
  0: 'En preparation',
  1: 'En cours',
  2: 'Termine',
  3: 'Annule',
}

export const COMPANY_STATES: Record<number, string> = {
  0: 'Prospect',
  1: 'Client',
  2: 'Ancien client',
  3: 'Fournisseur',
  4: 'Archive',
}

export const ACTION_TYPES: Record<number, string> = {
  1: 'Positionnement',
  2: 'Entretien client',
  3: 'Entretien interne',
  4: 'Proposition',
  5: 'Demarrage',
  6: 'Appel',
  7: 'Email',
  8: 'Reunion',
  9: 'Autre',
}

export const POSITIONING_STATES: Record<number, string> = {
  0: 'En attente',
  1: 'Propose',
  2: 'Valide',
  3: 'Refuse',
  4: 'Annule',
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
    clientKey: '76466d84db825e33c801',
  },
}

export const BOOND_BASE_URL = 'https://ui.boondmanager.com/api'

// ==================== CLIENT CLASS ====================

export class BoondManagerClient {
  private baseUrl: string
  private authHeader: string
  private environment: BoondEnvironment
  private credentials: BoondCredentials

  constructor(environment: BoondEnvironment = 'sandbox') {
    this.environment = environment
    this.credentials = BOOND_CREDENTIALS[environment]
    this.baseUrl = BOOND_BASE_URL
    this.authHeader = `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64')}`
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

  // Generic fetch method
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`BoondManager API error [${this.environment}]:`, response.status, errorText)
      throw new Error(`BoondManager API error: ${response.status} - ${errorText}`)
    }

    // Handle empty responses (like DELETE)
    const text = await response.text()
    if (!text) {
      return {} as T
    }

    return JSON.parse(text)
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

  async uploadDocument(file: ArrayBuffer | Blob, filename: string, parentId: number, parentType: 'candidate' | 'resource' | 'resourceResume'): Promise<BoondApiResponse<BoondDocument>> {
    this.assertCanWrite('uploadDocument')

    const formData = new FormData()
    formData.append('parentId', parentId.toString())
    formData.append('parentType', parentType)

    const blob = file instanceof Blob ? file : new Blob([file])
    formData.append('file', blob, filename)

    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
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
    candidates: { total: number; byState: Record<number, number> }
    resources: { total: number; byState: Record<number, number> }
    opportunities: { total: number; byState: Record<number, number> }
    companies: { total: number; byState: Record<number, number> }
    projects: { total: number; byState: Record<number, number> }
  }> {
    const [candidates, resources, opportunities, companies, projects] = await Promise.all([
      this.getCandidates({ maxResults: 1000 }),
      this.getResources({ maxResults: 1000 }),
      this.getOpportunities({ maxResults: 1000 }),
      this.getCompanies({ maxResults: 1000 }),
      this.getProjects({ maxResults: 1000 }),
    ])

    const countByState = <T extends { attributes: { state?: number } }>(items: T[]): Record<number, number> => {
      const list = Array.isArray(items) ? items : []
      return list.reduce((acc, item) => {
        const state = item.attributes.state ?? 0
        acc[state] = (acc[state] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }

    const candidatesList = Array.isArray(candidates.data) ? candidates.data : []
    const resourcesList = Array.isArray(resources.data) ? resources.data : []
    const opportunitiesList = Array.isArray(opportunities.data) ? opportunities.data : []
    const companiesList = Array.isArray(companies.data) ? companies.data : []
    const projectsList = Array.isArray(projects.data) ? projects.data : []

    return {
      candidates: {
        total: candidatesList.length,
        byState: countByState(candidatesList),
      },
      resources: {
        total: resourcesList.length,
        byState: countByState(resourcesList),
      },
      opportunities: {
        total: opportunitiesList.length,
        byState: countByState(opportunitiesList),
      },
      companies: {
        total: companiesList.length,
        byState: countByState(companiesList),
      },
      projects: {
        total: projectsList.length,
        byState: countByState(projectsList),
      },
    }
  }
}

// Factory function to create client
export function createBoondClient(environment: BoondEnvironment = 'sandbox'): BoondManagerClient {
  return new BoondManagerClient(environment)
}
