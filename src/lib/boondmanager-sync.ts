// BoondManager Data Synchronization & Cleaning Service
// Sync Production → Sandbox, Clean data, Export for production import

import {
  BoondManagerClient,
  createBoondClient,
  BoondCandidate,
  BoondResource,
  BoondOpportunity,
  BoondCompany,
  BoondContact,
  BoondProject,
  BoondAction,
  CANDIDATE_STATES,
  RESOURCE_STATES,
  OPPORTUNITY_STATES,
  COMPANY_STATES,
  PROJECT_STATES,
} from './boondmanager-client'

// ==================== TYPES ====================

export interface SyncProgress {
  entity: string
  total: number
  processed: number
  success: number
  failed: number
  errors: string[]
}

export interface SyncResult {
  startedAt: Date
  completedAt: Date
  entities: Record<string, SyncProgress>
  totalRecords: number
  successRecords: number
  failedRecords: number
}

export interface DataQualityIssue {
  entityType: string
  entityId: number
  field: string
  issue: string
  severity: 'error' | 'warning' | 'info'
  currentValue: unknown
  suggestedValue?: unknown
}

export interface DuplicateGroup {
  entityType: string
  field: string
  value: string
  items: Array<{ id: number; attributes: Record<string, unknown> }>
}

export interface CleaningRule {
  field: string
  type: 'normalize_name' | 'normalize_phone' | 'normalize_email' | 'trim' | 'uppercase' | 'lowercase' | 'remove_duplicates'
  description: string
}

export interface ExportData {
  exportedAt: Date
  environment: 'production' | 'sandbox'
  entities: {
    candidates: BoondCandidate[]
    resources: BoondResource[]
    opportunities: BoondOpportunity[]
    companies: BoondCompany[]
    contacts: BoondContact[]
    projects: BoondProject[]
  }
  stats: {
    candidates: number
    resources: number
    opportunities: number
    companies: number
    contacts: number
    projects: number
  }
}

// ==================== DATA CLEANING UTILITIES ====================

// Normalize French/international phone numbers
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return ''

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // Handle French numbers
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Convert to international format
    cleaned = '+33' + cleaned.substring(1)
  } else if (cleaned.startsWith('33') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned
  } else if (cleaned.length === 9 && !cleaned.startsWith('+')) {
    // Assume French number without leading 0
    cleaned = '+33' + cleaned
  }

  // Format as +33 X XX XX XX XX for French numbers
  if (cleaned.startsWith('+33') && cleaned.length === 12) {
    return `+33 ${cleaned[3]} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)} ${cleaned.substring(10, 12)}`
  }

  return cleaned || phone
}

// Normalize names (capitalize first letter of each word)
export function normalizeName(name: string | null | undefined): string {
  if (!name) return ''

  return name
    .trim()
    .toLowerCase()
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+-\s+/g, '-')
}

// Normalize email (lowercase, trim)
export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return ''
  return email.trim().toLowerCase()
}

// Normalize company name
export function normalizeCompanyName(name: string | null | undefined): string {
  if (!name) return ''

  // Trim and normalize whitespace
  let normalized = name.trim().replace(/\s+/g, ' ')

  // Common abbreviations to uppercase
  const abbreviations = ['SA', 'SAS', 'SARL', 'SASU', 'SNC', 'EURL', 'GIE', 'SCI', 'ESN', 'SSII']
  abbreviations.forEach(abbr => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi')
    normalized = normalized.replace(regex, abbr)
  })

  return normalized
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone format
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.-]/g, '')
  return /^\+?\d{9,15}$/.test(cleaned)
}

// ==================== DUPLICATE DETECTION ====================

export function findDuplicates<T extends { id: number; attributes: Record<string, unknown> }>(
  items: T[],
  fields: string[]
): DuplicateGroup[] {
  const duplicates: DuplicateGroup[] = []

  for (const field of fields) {
    const valueMap = new Map<string, T[]>()

    for (const item of items) {
      const value = String(item.attributes[field] || '').toLowerCase().trim()
      if (!value) continue

      if (!valueMap.has(value)) {
        valueMap.set(value, [])
      }
      valueMap.get(value)!.push(item)
    }

    for (const [value, groupItems] of valueMap.entries()) {
      if (groupItems.length > 1) {
        duplicates.push({
          entityType: 'unknown',
          field,
          value,
          items: groupItems.map(item => ({
            id: item.id,
            attributes: item.attributes as Record<string, unknown>
          }))
        })
      }
    }
  }

  return duplicates
}

// ==================== DATA QUALITY ANALYSIS ====================

export function analyzeDataQuality<T extends { id: number; attributes: Record<string, unknown> }>(
  items: T[],
  entityType: string,
  requiredFields: string[],
  emailFields: string[] = [],
  phoneFields: string[] = [],
  nameFields: string[] = []
): DataQualityIssue[] {
  const issues: DataQualityIssue[] = []

  for (const item of items) {
    // Check required fields
    for (const field of requiredFields) {
      const value = item.attributes[field]
      if (value === null || value === undefined || value === '') {
        issues.push({
          entityType,
          entityId: item.id,
          field,
          issue: 'Champ requis manquant',
          severity: 'error',
          currentValue: value
        })
      }
    }

    // Check email fields
    for (const field of emailFields) {
      const value = item.attributes[field]
      if (value && typeof value === 'string') {
        if (!isValidEmail(value)) {
          issues.push({
            entityType,
            entityId: item.id,
            field,
            issue: 'Format email invalide',
            severity: 'warning',
            currentValue: value
          })
        }
        const normalized = normalizeEmail(value)
        if (normalized !== value) {
          issues.push({
            entityType,
            entityId: item.id,
            field,
            issue: 'Email non normalise',
            severity: 'info',
            currentValue: value,
            suggestedValue: normalized
          })
        }
      }
    }

    // Check phone fields
    for (const field of phoneFields) {
      const value = item.attributes[field]
      if (value && typeof value === 'string') {
        const normalized = normalizePhone(value)
        if (normalized !== value) {
          issues.push({
            entityType,
            entityId: item.id,
            field,
            issue: 'Telephone non normalise',
            severity: 'info',
            currentValue: value,
            suggestedValue: normalized
          })
        }
      }
    }

    // Check name fields
    for (const field of nameFields) {
      const value = item.attributes[field]
      if (value && typeof value === 'string') {
        const normalized = normalizeName(value)
        if (normalized !== value) {
          issues.push({
            entityType,
            entityId: item.id,
            field,
            issue: 'Nom non normalise (casse)',
            severity: 'info',
            currentValue: value,
            suggestedValue: normalized
          })
        }
      }
    }
  }

  return issues
}

// ==================== SYNC SERVICE ====================

export class BoondSyncService {
  private prodClient: BoondManagerClient
  private sandboxClient: BoondManagerClient

  constructor() {
    this.prodClient = createBoondClient('production')
    this.sandboxClient = createBoondClient('sandbox')
  }

  // Fetch all data from an environment
  async fetchAllData(environment: 'production' | 'sandbox'): Promise<ExportData> {
    const client = environment === 'production' ? this.prodClient : this.sandboxClient

    const [candidates, resources, opportunities, companies, contacts, projects] = await Promise.all([
      this.fetchAllPages(async (page) => client.getCandidates({ page, maxResults: 100 })),
      this.fetchAllPages(async (page) => client.getResources({ page, maxResults: 100 })),
      this.fetchAllPages(async (page) => client.getOpportunities({ page, maxResults: 100 })),
      this.fetchAllPages(async (page) => client.getCompanies({ page, maxResults: 100 })),
      this.fetchAllPages(async (page) => client.getContacts({ page, maxResults: 100 })),
      this.fetchAllPages(async (page) => client.getProjects({ page, maxResults: 100 })),
    ])

    return {
      exportedAt: new Date(),
      environment,
      entities: {
        candidates: candidates as BoondCandidate[],
        resources: resources as BoondResource[],
        opportunities: opportunities as BoondOpportunity[],
        companies: companies as BoondCompany[],
        contacts: contacts as BoondContact[],
        projects: projects as BoondProject[],
      },
      stats: {
        candidates: candidates.length,
        resources: resources.length,
        opportunities: opportunities.length,
        companies: companies.length,
        contacts: contacts.length,
        projects: projects.length,
      }
    }
  }

  // Fetch all pages of a paginated endpoint
  private async fetchAllPages<T>(
    fetcher: (page: number) => Promise<{ data: T[]; meta?: { totals?: { rows: number } } }>
  ): Promise<T[]> {
    const allItems: T[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const result = await fetcher(page)
      const items = Array.isArray(result.data) ? result.data : []
      allItems.push(...items)

      // Check if there are more pages
      if (items.length < 100) {
        hasMore = false
      } else {
        page++
      }

      // Safety limit
      if (page > 100) {
        hasMore = false
      }
    }

    return allItems
  }

  // Sync a single entity type from prod to sandbox
  async syncEntityToSandbox<T extends { id: number; attributes: Record<string, unknown> }>(
    entityType: 'candidates' | 'resources' | 'opportunities' | 'companies' | 'contacts',
    items: T[],
    createFn: (data: Record<string, unknown>) => Promise<unknown>,
    onProgress?: (progress: SyncProgress) => void
  ): Promise<SyncProgress> {
    const progress: SyncProgress = {
      entity: entityType,
      total: items.length,
      processed: 0,
      success: 0,
      failed: 0,
      errors: []
    }

    for (const item of items) {
      try {
        // Transform attributes for creation
        const data = this.transformAttributesForCreation(entityType, item.attributes)
        await createFn(data)
        progress.success++
      } catch (error) {
        progress.failed++
        progress.errors.push(`ID ${item.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
      progress.processed++
      onProgress?.(progress)
    }

    return progress
  }

  // Transform attributes for creation (remove read-only fields)
  private transformAttributesForCreation(
    entityType: string,
    attributes: Record<string, unknown>
  ): Record<string, unknown> {
    const readOnlyFields = ['id', 'creationDate', 'updateDate', 'stateLabel', 'thumbnail']
    const data: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(attributes)) {
      if (!readOnlyFields.includes(key) && value !== null && value !== undefined) {
        data[key] = value
      }
    }

    return data
  }

  // Full sync from Production to Sandbox
  async syncProdToSandbox(
    onProgress?: (entityType: string, progress: SyncProgress) => void
  ): Promise<SyncResult> {
    const startedAt = new Date()
    const entities: Record<string, SyncProgress> = {}

    // Fetch all data from production
    const prodData = await this.fetchAllData('production')

    // Sync companies first (needed for contacts and opportunities)
    entities.companies = await this.syncEntityToSandbox(
      'companies',
      prodData.entities.companies,
      (data) => this.sandboxClient.createCompany(data as Parameters<typeof this.sandboxClient.createCompany>[0]),
      (p) => onProgress?.('companies', p)
    )

    // Sync contacts
    entities.contacts = await this.syncEntityToSandbox(
      'contacts',
      prodData.entities.contacts,
      (data) => this.sandboxClient.createContact(data as Parameters<typeof this.sandboxClient.createContact>[0]),
      (p) => onProgress?.('contacts', p)
    )

    // Sync candidates
    entities.candidates = await this.syncEntityToSandbox(
      'candidates',
      prodData.entities.candidates,
      (data) => this.sandboxClient.createCandidate(data as Parameters<typeof this.sandboxClient.createCandidate>[0]),
      (p) => onProgress?.('candidates', p)
    )

    // Sync resources
    entities.resources = await this.syncEntityToSandbox(
      'resources',
      prodData.entities.resources,
      (data) => this.sandboxClient.createResource(data as Parameters<typeof this.sandboxClient.createResource>[0]),
      (p) => onProgress?.('resources', p)
    )

    // Sync opportunities
    entities.opportunities = await this.syncEntityToSandbox(
      'opportunities',
      prodData.entities.opportunities,
      (data) => this.sandboxClient.createOpportunity(data as Parameters<typeof this.sandboxClient.createOpportunity>[0]),
      (p) => onProgress?.('opportunities', p)
    )

    const completedAt = new Date()

    let totalRecords = 0
    let successRecords = 0
    let failedRecords = 0

    for (const progress of Object.values(entities)) {
      totalRecords += progress.total
      successRecords += progress.success
      failedRecords += progress.failed
    }

    return {
      startedAt,
      completedAt,
      entities,
      totalRecords,
      successRecords,
      failedRecords
    }
  }

  // Analyze all data quality
  async analyzeAllDataQuality(environment: 'production' | 'sandbox'): Promise<{
    issues: DataQualityIssue[]
    duplicates: DuplicateGroup[]
    summary: {
      totalIssues: number
      errors: number
      warnings: number
      info: number
      duplicateGroups: number
    }
  }> {
    const data = await this.fetchAllData(environment)
    const allIssues: DataQualityIssue[] = []
    const allDuplicates: DuplicateGroup[] = []

    // Analyze candidates
    const candidateIssues = analyzeDataQuality(
      data.entities.candidates,
      'candidate',
      ['firstName', 'lastName'],
      ['email'],
      ['phone1'],
      ['firstName', 'lastName']
    )
    allIssues.push(...candidateIssues)

    const candidateDupes = findDuplicates(data.entities.candidates, ['email'])
    candidateDupes.forEach(d => d.entityType = 'candidate')
    allDuplicates.push(...candidateDupes)

    // Analyze resources
    const resourceIssues = analyzeDataQuality(
      data.entities.resources,
      'resource',
      ['firstName', 'lastName', 'email'],
      ['email'],
      ['phone1'],
      ['firstName', 'lastName']
    )
    allIssues.push(...resourceIssues)

    const resourceDupes = findDuplicates(data.entities.resources, ['email'])
    resourceDupes.forEach(d => d.entityType = 'resource')
    allDuplicates.push(...resourceDupes)

    // Analyze companies
    const companyIssues = analyzeDataQuality(
      data.entities.companies,
      'company',
      ['name'],
      ['email'],
      ['phone1'],
      []
    )
    allIssues.push(...companyIssues)

    const companyDupes = findDuplicates(data.entities.companies, ['name'])
    companyDupes.forEach(d => d.entityType = 'company')
    allDuplicates.push(...companyDupes)

    // Analyze contacts
    const contactIssues = analyzeDataQuality(
      data.entities.contacts,
      'contact',
      ['firstName', 'lastName'],
      ['email'],
      ['phone1'],
      ['firstName', 'lastName']
    )
    allIssues.push(...contactIssues)

    const contactDupes = findDuplicates(data.entities.contacts, ['email'])
    contactDupes.forEach(d => d.entityType = 'contact')
    allDuplicates.push(...contactDupes)

    // Analyze opportunities
    const opportunityIssues = analyzeDataQuality(
      data.entities.opportunities,
      'opportunity',
      ['title'],
      [],
      [],
      []
    )
    allIssues.push(...opportunityIssues)

    return {
      issues: allIssues,
      duplicates: allDuplicates,
      summary: {
        totalIssues: allIssues.length,
        errors: allIssues.filter(i => i.severity === 'error').length,
        warnings: allIssues.filter(i => i.severity === 'warning').length,
        info: allIssues.filter(i => i.severity === 'info').length,
        duplicateGroups: allDuplicates.length
      }
    }
  }

  // Apply cleaning to data and return cleaned version
  cleanData(data: ExportData): ExportData {
    const cleaned: ExportData = {
      ...data,
      exportedAt: new Date(),
      entities: {
        candidates: data.entities.candidates.map(c => ({
          ...c,
          attributes: {
            ...c.attributes,
            firstName: normalizeName(c.attributes.firstName as string),
            lastName: normalizeName(c.attributes.lastName as string),
            email: normalizeEmail(c.attributes.email as string),
            phone1: normalizePhone(c.attributes.phone1 as string),
          }
        })),
        resources: data.entities.resources.map(r => ({
          ...r,
          attributes: {
            ...r.attributes,
            firstName: normalizeName(r.attributes.firstName as string),
            lastName: normalizeName(r.attributes.lastName as string),
            email: normalizeEmail(r.attributes.email as string),
            phone1: normalizePhone(r.attributes.phone1 as string),
          }
        })),
        opportunities: data.entities.opportunities,
        companies: data.entities.companies.map(c => ({
          ...c,
          attributes: {
            ...c.attributes,
            name: normalizeCompanyName(c.attributes.name as string),
            email: normalizeEmail(c.attributes.email as string),
            phone1: normalizePhone(c.attributes.phone1 as string),
          }
        })),
        contacts: data.entities.contacts.map(c => ({
          ...c,
          attributes: {
            ...c.attributes,
            firstName: normalizeName(c.attributes.firstName as string),
            lastName: normalizeName(c.attributes.lastName as string),
            email: normalizeEmail(c.attributes.email as string),
            phone1: normalizePhone(c.attributes.phone1 as string),
          }
        })),
        projects: data.entities.projects,
      }
    }

    return cleaned
  }

  // Export data to JSON format for manual import
  exportToJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2)
  }

  // Export data to CSV format (per entity type)
  exportToCSV(items: Array<{ id: number; attributes: Record<string, unknown> }>, fields: string[]): string {
    const header = ['id', ...fields].join(',')
    const rows = items.map(item => {
      const values = [
        item.id,
        ...fields.map(field => {
          const value = item.attributes[field]
          if (value === null || value === undefined) return ''
          const strValue = String(value)
          // Escape quotes and wrap in quotes if contains comma
          if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`
          }
          return strValue
        })
      ]
      return values.join(',')
    })

    return [header, ...rows].join('\n')
  }
}

// Singleton instance
let syncServiceInstance: BoondSyncService | null = null

export function getBoondSyncService(): BoondSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new BoondSyncService()
  }
  return syncServiceInstance
}
