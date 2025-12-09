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

// Candidate states in BoondManager
export const CANDIDATE_STATES: Record<number, string> = {
  1: 'A qualifier',
  2: 'Qualifie',
  3: 'En cours',
  4: 'Entretien',
  5: 'Proposition',
  6: 'Embauche',
  7: 'Refuse',
  8: 'Archive',
}

// Resource states
export const RESOURCE_STATES: Record<number, string> = {
  1: 'Disponible',
  2: 'En mission',
  3: 'Intercontrat',
  4: 'Indisponible',
  5: 'Sorti',
}

// Opportunity states
export const OPPORTUNITY_STATES: Record<number, string> = {
  1: 'En cours',
  2: 'Gagnee',
  3: 'Perdue',
  4: 'Abandonnee',
}

// Action types (recruitment workflow)
export const ACTION_TYPES: Record<number, string> = {
  1: 'Positionnement',
  2: 'Entretien client',
  3: 'Entretien interne',
  4: 'Proposition',
  5: 'Demarrage',
}

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
