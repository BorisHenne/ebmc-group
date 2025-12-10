// BoondManager API Client
// Documentation: https://doc.boondmanager.com/api-externe/

export interface BoondResource {
  id: number
  attributes: {
    firstName: string
    lastName: string
    email: string
    civility: string
    state: number
    stateLabel?: string
    title?: string
    mainManager?: {
      id: number
      firstName: string
      lastName: string
    }
    thumbnail?: string
    phone?: string
    dateOfBirth?: string
    createdAt?: string
    updatedAt?: string
  }
  relationships?: {
    mainManager?: { data: { id: number } }
    agency?: { data: { id: number } }
  }
}

export interface BoondCandidate {
  id: number
  attributes: {
    firstName: string
    lastName: string
    email: string
    civility: string
    state: number
    stateLabel?: string
    title?: string
    source?: string
    phone?: string
    thumbnail?: string
    createdAt?: string
    updatedAt?: string
    lastActivityAt?: string
  }
  relationships?: {
    mainManager?: { data: { id: number } }
    actions?: { data: Array<{ id: number }> }
  }
}

export interface BoondOpportunity {
  id: number
  attributes: {
    title: string
    reference?: string
    state: number
    stateLabel?: string
    description?: string
    startDate?: string
    endDate?: string
    dailyRate?: number
    createdAt?: string
    updatedAt?: string
  }
  relationships?: {
    mainManager?: { data: { id: number } }
    contact?: { data: { id: number } }
    company?: { data: { id: number } }
  }
}

export interface BoondAction {
  id: number
  attributes: {
    typeOf: number
    typeOfLabel?: string
    state: number
    stateLabel?: string
    startDate?: string
    endDate?: string
    comment?: string
    createdAt?: string
    updatedAt?: string
  }
  relationships?: {
    resource?: { data: { id: number } }
    candidate?: { data: { id: number } }
    opportunity?: { data: { id: number } }
    deliverable?: { data: { id: number } }
  }
}

export interface BoondApiResponse<T> {
  data: T
  included?: Array<BoondResource | BoondCandidate | BoondOpportunity>
  meta?: {
    totals?: {
      rows: number
    }
  }
}

// =============================================================================
// BOONDMANAGER STATES - Now fetched dynamically from BoondManager API
// =============================================================================
// For dynamic state lookups, use functions from '@/lib/boondmanager-dictionary'
// The constants below are re-exported from the dictionary service for backwards compatibility

export {
  FALLBACK_CANDIDATE_STATES as CANDIDATE_STATES,
  FALLBACK_RESOURCE_STATES as RESOURCE_STATES,
  FALLBACK_OPPORTUNITY_STATES as OPPORTUNITY_STATES,
  FALLBACK_ACTION_TYPES as ACTION_TYPES,
  // Also export the dynamic getters for modern usage
  getCandidateStates,
  getResourceStates,
  getOpportunityStates,
  getActionTypes,
  getAllStates,
} from './boondmanager-dictionary'

export class BoondManagerClient {
  private baseUrl: string
  private authHeader: string

  constructor(subdomain: string, email: string, password: string) {
    this.baseUrl = `https://${subdomain}.boondmanager.com/api`
    this.authHeader = `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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
      throw new Error(`BoondManager API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  // Get current user info
  async getCurrentUser(): Promise<BoondApiResponse<BoondResource>> {
    return this.fetch('/application/current-user')
  }

  // Get all resources (consultants) - optionally filtered by manager
  async getResources(managerId?: number, page = 1, limit = 50): Promise<BoondApiResponse<BoondResource[]>> {
    let endpoint = `/resources?page=${page}&maxResults=${limit}&sort=-updatedAt`
    if (managerId) {
      endpoint += `&mainManager=${managerId}`
    }
    return this.fetch(endpoint)
  }

  // Get resources assigned to current user
  async getMyResources(page = 1, limit = 50): Promise<BoondApiResponse<BoondResource[]>> {
    const currentUser = await this.getCurrentUser()
    const userId = (currentUser.data as BoondResource).id
    return this.getResources(userId, page, limit)
  }

  // Get all candidates - optionally filtered by manager
  async getCandidates(managerId?: number, page = 1, limit = 50): Promise<BoondApiResponse<BoondCandidate[]>> {
    let endpoint = `/candidates?page=${page}&maxResults=${limit}&sort=-updatedAt`
    if (managerId) {
      endpoint += `&mainManager=${managerId}`
    }
    return this.fetch(endpoint)
  }

  // Get candidates assigned to current user
  async getMyCandidates(page = 1, limit = 50): Promise<BoondApiResponse<BoondCandidate[]>> {
    const currentUser = await this.getCurrentUser()
    const userId = (currentUser.data as BoondResource).id
    return this.getCandidates(userId, page, limit)
  }

  // Get all opportunities (job offers)
  async getOpportunities(managerId?: number, page = 1, limit = 50): Promise<BoondApiResponse<BoondOpportunity[]>> {
    let endpoint = `/opportunities?page=${page}&maxResults=${limit}&sort=-updatedAt`
    if (managerId) {
      endpoint += `&mainManager=${managerId}`
    }
    return this.fetch(endpoint)
  }

  // Get opportunities assigned to current user
  async getMyOpportunities(page = 1, limit = 50): Promise<BoondApiResponse<BoondOpportunity[]>> {
    const currentUser = await this.getCurrentUser()
    const userId = (currentUser.data as BoondResource).id
    return this.getOpportunities(userId, page, limit)
  }

  // Get actions (recruitment workflow items)
  async getActions(filters?: {
    resourceId?: number
    candidateId?: number
    opportunityId?: number
    state?: number
  }, page = 1, limit = 50): Promise<BoondApiResponse<BoondAction[]>> {
    let endpoint = `/actions?page=${page}&maxResults=${limit}&sort=-updatedAt`
    if (filters?.resourceId) endpoint += `&resource=${filters.resourceId}`
    if (filters?.candidateId) endpoint += `&candidate=${filters.candidateId}`
    if (filters?.opportunityId) endpoint += `&opportunity=${filters.opportunityId}`
    if (filters?.state) endpoint += `&state=${filters.state}`
    return this.fetch(endpoint)
  }

  // Get a single resource by ID
  async getResource(id: number): Promise<BoondApiResponse<BoondResource>> {
    return this.fetch(`/resources/${id}`)
  }

  // Get a single candidate by ID
  async getCandidate(id: number): Promise<BoondApiResponse<BoondCandidate>> {
    return this.fetch(`/candidates/${id}`)
  }

  // Get a single opportunity by ID
  async getOpportunity(id: number): Promise<BoondApiResponse<BoondOpportunity>> {
    return this.fetch(`/opportunities/${id}`)
  }

  // Search candidates
  async searchCandidates(query: string, page = 1, limit = 50): Promise<BoondApiResponse<BoondCandidate[]>> {
    const endpoint = `/candidates?page=${page}&maxResults=${limit}&keywords=${encodeURIComponent(query)}&sort=-updatedAt`
    return this.fetch(endpoint)
  }

  // Search resources
  async searchResources(query: string, page = 1, limit = 50): Promise<BoondApiResponse<BoondResource[]>> {
    const endpoint = `/resources?page=${page}&maxResults=${limit}&keywords=${encodeURIComponent(query)}&sort=-updatedAt`
    return this.fetch(endpoint)
  }

  // Get dashboard stats for current user
  async getDashboardStats(): Promise<{
    candidates: { total: number; byState: Record<number, number> }
    resources: { total: number; byState: Record<number, number> }
    opportunities: { total: number; byState: Record<number, number> }
  }> {
    const [candidates, resources, opportunities] = await Promise.all([
      this.getMyCandidates(1, 1000),
      this.getMyResources(1, 1000),
      this.getMyOpportunities(1, 1000),
    ])

    const candidatesList = Array.isArray(candidates.data) ? candidates.data : []
    const resourcesList = Array.isArray(resources.data) ? resources.data : []
    const opportunitiesList = Array.isArray(opportunities.data) ? opportunities.data : []

    const countByState = <T extends { attributes: { state: number } }>(items: T[]): Record<number, number> => {
      return items.reduce((acc, item) => {
        const state = item.attributes.state
        acc[state] = (acc[state] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }

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
    }
  }

  // ==================== CRUD OPERATIONS ====================

  // Create a new candidate
  async createCandidate(data: {
    firstName: string
    lastName: string
    email: string
    civility?: string
    title?: string
    phone?: string
    source?: string
  }): Promise<BoondApiResponse<BoondCandidate>> {
    return this.fetch('/candidates', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            civility: data.civility || 'M',
            title: data.title || '',
            phone1: data.phone || '',
            origin: data.source || 'Site Web',
            state: 1, // A qualifier
          }
        }
      })
    })
  }

  // Update a candidate
  async updateCandidate(id: number, data: {
    firstName?: string
    lastName?: string
    email?: string
    civility?: string
    title?: string
    phone?: string
    state?: number
    source?: string
  }): Promise<BoondApiResponse<BoondCandidate>> {
    const attributes: Record<string, unknown> = {}
    if (data.firstName) attributes.firstName = data.firstName
    if (data.lastName) attributes.lastName = data.lastName
    if (data.email) attributes.email = data.email
    if (data.civility) attributes.civility = data.civility
    if (data.title) attributes.title = data.title
    if (data.phone) attributes.phone1 = data.phone
    if (data.state) attributes.state = data.state
    if (data.source) attributes.origin = data.source

    return this.fetch(`/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: { attributes }
      })
    })
  }

  // Delete a candidate
  async deleteCandidate(id: number): Promise<void> {
    await this.fetch(`/candidates/${id}`, { method: 'DELETE' })
  }

  // Create a new resource
  async createResource(data: {
    firstName: string
    lastName: string
    email: string
    civility?: string
    title?: string
    phone?: string
  }): Promise<BoondApiResponse<BoondResource>> {
    return this.fetch('/resources', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            civility: data.civility || 'M',
            title: data.title || '',
            phone1: data.phone || '',
            state: 1, // Disponible
          }
        }
      })
    })
  }

  // Update a resource
  async updateResource(id: number, data: {
    firstName?: string
    lastName?: string
    email?: string
    civility?: string
    title?: string
    phone?: string
    state?: number
  }): Promise<BoondApiResponse<BoondResource>> {
    const attributes: Record<string, unknown> = {}
    if (data.firstName) attributes.firstName = data.firstName
    if (data.lastName) attributes.lastName = data.lastName
    if (data.email) attributes.email = data.email
    if (data.civility) attributes.civility = data.civility
    if (data.title) attributes.title = data.title
    if (data.phone) attributes.phone1 = data.phone
    if (data.state) attributes.state = data.state

    return this.fetch(`/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: { attributes }
      })
    })
  }

  // Delete a resource
  async deleteResource(id: number): Promise<void> {
    await this.fetch(`/resources/${id}`, { method: 'DELETE' })
  }

  // Create a new opportunity
  async createOpportunity(data: {
    title: string
    reference?: string
    description?: string
    startDate?: string
    dailyRate?: number
  }): Promise<BoondApiResponse<BoondOpportunity>> {
    return this.fetch('/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            title: data.title,
            reference: data.reference || '',
            description: data.description || '',
            startDate: data.startDate || null,
            averageDailyPriceExcludingTax: data.dailyRate || 0,
            state: 1, // En cours
          }
        }
      })
    })
  }

  // Update an opportunity
  async updateOpportunity(id: number, data: {
    title?: string
    reference?: string
    description?: string
    startDate?: string
    dailyRate?: number
    state?: number
  }): Promise<BoondApiResponse<BoondOpportunity>> {
    const attributes: Record<string, unknown> = {}
    if (data.title) attributes.title = data.title
    if (data.reference) attributes.reference = data.reference
    if (data.description) attributes.description = data.description
    if (data.startDate) attributes.startDate = data.startDate
    if (data.dailyRate) attributes.averageDailyPriceExcludingTax = data.dailyRate
    if (data.state) attributes.state = data.state

    return this.fetch(`/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: { attributes }
      })
    })
  }

  // Delete an opportunity
  async deleteOpportunity(id: number): Promise<void> {
    await this.fetch(`/opportunities/${id}`, { method: 'DELETE' })
  }
}

// Create client from stored credentials
export async function createBoondClientFromSession(
  boondSubdomain: string,
  boondEmail: string,
  boondToken: string
): Promise<BoondManagerClient | null> {
  try {
    // boondToken is base64 encoded email:password
    const decoded = Buffer.from(boondToken, 'base64').toString('utf-8')
    const [email, password] = decoded.split(':')
    return new BoondManagerClient(boondSubdomain, email, password)
  } catch {
    return null
  }
}
