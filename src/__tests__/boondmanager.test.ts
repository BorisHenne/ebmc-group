/**
 * Tests unitaires pour l'integration BoondManager
 *
 * Ces tests couvrent:
 * - Connexion API (Production/Sandbox)
 * - CRUD Operations
 * - Retry logic
 * - Normalisation des donnees
 * - Detection des doublons
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  normalizePhone,
  normalizeName,
  normalizeEmail,
  normalizeCompanyName,
  isValidEmail,
  isValidPhone,
  findDuplicates,
  analyzeDataQuality,
} from '@/lib/boondmanager-sync'

// Mock fetch for API tests
const mockFetch = vi.fn()
global.fetch = mockFetch

// ==================== NORMALISATION TESTS ====================

describe('normalizePhone', () => {
  it('should normalize French phone numbers to international format', () => {
    expect(normalizePhone('0612345678')).toBe('+33 6 12 34 56 78')
    expect(normalizePhone('06.12.34.56.78')).toBe('+33 6 12 34 56 78')
    expect(normalizePhone('06 12 34 56 78')).toBe('+33 6 12 34 56 78')
    expect(normalizePhone('06-12-34-56-78')).toBe('+33 6 12 34 56 78')
  })

  it('should handle numbers already in international format', () => {
    expect(normalizePhone('+33612345678')).toBe('+33 6 12 34 56 78')
    expect(normalizePhone('33612345678')).toBe('+33 6 12 34 56 78')
  })

  it('should handle numbers without leading 0', () => {
    expect(normalizePhone('612345678')).toBe('+33 6 12 34 56 78')
  })

  it('should handle null and undefined', () => {
    expect(normalizePhone(null)).toBe('')
    expect(normalizePhone(undefined)).toBe('')
    expect(normalizePhone('')).toBe('')
  })

  it('should return original for non-standard formats', () => {
    expect(normalizePhone('+1234567890123')).toBe('+1234567890123')
  })
})

describe('normalizeName', () => {
  it('should capitalize first letter of each word', () => {
    expect(normalizeName('jean dupont')).toBe('Jean Dupont')
    expect(normalizeName('JEAN DUPONT')).toBe('Jean Dupont')
    expect(normalizeName('jEaN dUpOnT')).toBe('Jean Dupont')
  })

  it('should handle hyphenated names', () => {
    expect(normalizeName('jean-pierre dupont')).toBe('Jean Pierre Dupont')
    expect(normalizeName('MARIE-CLAIRE DUBOIS')).toBe('Marie Claire Dubois')
  })

  it('should trim whitespace', () => {
    expect(normalizeName('  jean dupont  ')).toBe('Jean Dupont')
    expect(normalizeName('jean   dupont')).toBe('Jean Dupont')
  })

  it('should handle null and undefined', () => {
    expect(normalizeName(null)).toBe('')
    expect(normalizeName(undefined)).toBe('')
    expect(normalizeName('')).toBe('')
  })
})

describe('normalizeEmail', () => {
  it('should lowercase and trim emails', () => {
    expect(normalizeEmail('Jean.Dupont@Example.COM')).toBe('jean.dupont@example.com')
    expect(normalizeEmail('  TEST@email.com  ')).toBe('test@email.com')
  })

  it('should handle null and undefined', () => {
    expect(normalizeEmail(null)).toBe('')
    expect(normalizeEmail(undefined)).toBe('')
    expect(normalizeEmail('')).toBe('')
  })
})

describe('normalizeCompanyName', () => {
  it('should preserve legal form abbreviations in uppercase', () => {
    expect(normalizeCompanyName('acme sas')).toBe('acme SAS')
    expect(normalizeCompanyName('ACME SARL')).toBe('ACME SARL')
    expect(normalizeCompanyName('tech sa france')).toBe('tech SA france')
  })

  it('should normalize whitespace', () => {
    expect(normalizeCompanyName('  ACME   SAS  ')).toBe('ACME SAS')
  })

  it('should handle null and undefined', () => {
    expect(normalizeCompanyName(null)).toBe('')
    expect(normalizeCompanyName(undefined)).toBe('')
  })
})

// ==================== VALIDATION TESTS ====================

describe('isValidEmail', () => {
  it('should validate correct email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('should reject invalid email formats', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
    expect(isValidEmail('test @example.com')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('should validate correct phone formats', () => {
    expect(isValidPhone('+33612345678')).toBe(true)
    expect(isValidPhone('0612345678')).toBe(true)
    expect(isValidPhone('+1 234 567 8901')).toBe(true)
  })

  it('should reject invalid phone formats', () => {
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('abc')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})

// ==================== DUPLICATE DETECTION TESTS ====================

describe('findDuplicates', () => {
  it('should find duplicates by email', () => {
    const items = [
      { id: 1, attributes: { email: 'test@example.com', firstName: 'Jean' } },
      { id: 2, attributes: { email: 'test@example.com', firstName: 'Pierre' } },
      { id: 3, attributes: { email: 'other@example.com', firstName: 'Marie' } },
    ]

    const duplicates = findDuplicates(items, ['email'])
    expect(duplicates).toHaveLength(1)
    expect(duplicates[0].items).toHaveLength(2)
    expect(duplicates[0].value).toBe('test@example.com')
  })

  it('should be case-insensitive', () => {
    const items = [
      { id: 1, attributes: { email: 'TEST@example.com', firstName: 'Jean' } },
      { id: 2, attributes: { email: 'test@example.com', firstName: 'Pierre' } },
    ]

    const duplicates = findDuplicates(items, ['email'])
    expect(duplicates).toHaveLength(1)
  })

  it('should find no duplicates when all are unique', () => {
    const items = [
      { id: 1, attributes: { email: 'a@example.com' } },
      { id: 2, attributes: { email: 'b@example.com' } },
    ]

    const duplicates = findDuplicates(items, ['email'])
    expect(duplicates).toHaveLength(0)
  })

  it('should handle empty or null values', () => {
    const items = [
      { id: 1, attributes: { email: null } },
      { id: 2, attributes: { email: '' } },
      { id: 3, attributes: { email: 'test@example.com' } },
    ]

    const duplicates = findDuplicates(items, ['email'])
    expect(duplicates).toHaveLength(0)
  })
})

// ==================== DATA QUALITY TESTS ====================

describe('analyzeDataQuality', () => {
  it('should detect missing required fields', () => {
    const items = [
      { id: 1, attributes: { firstName: 'Jean', lastName: '' } },
      { id: 2, attributes: { firstName: '', lastName: 'Dupont' } },
    ]

    const issues = analyzeDataQuality(items, 'candidate', ['firstName', 'lastName'])
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(2)
  })

  it('should detect invalid email formats', () => {
    const items = [
      { id: 1, attributes: { email: 'invalid-email' } },
      { id: 2, attributes: { email: 'valid@example.com' } },
    ]

    const issues = analyzeDataQuality(items, 'candidate', [], ['email'])
    expect(issues.filter(i => i.issue === 'Format email invalide')).toHaveLength(1)
  })

  it('should suggest email normalization', () => {
    const items = [
      { id: 1, attributes: { email: 'TEST@EXAMPLE.COM' } },
    ]

    const issues = analyzeDataQuality(items, 'candidate', [], ['email'])
    const normalizationIssue = issues.find(i => i.issue === 'Email non normalise')
    expect(normalizationIssue).toBeDefined()
    expect(normalizationIssue?.suggestedValue).toBe('test@example.com')
  })

  it('should suggest phone normalization', () => {
    const items = [
      { id: 1, attributes: { phone1: '0612345678' } },
    ]

    const issues = analyzeDataQuality(items, 'candidate', [], [], ['phone1'])
    const normalizationIssue = issues.find(i => i.issue === 'Telephone non normalise')
    expect(normalizationIssue).toBeDefined()
    expect(normalizationIssue?.suggestedValue).toBe('+33 6 12 34 56 78')
  })

  it('should suggest name normalization', () => {
    const items = [
      { id: 1, attributes: { firstName: 'JEAN', lastName: 'dupont' } },
    ]

    const issues = analyzeDataQuality(items, 'candidate', [], [], [], ['firstName', 'lastName'])
    const normalizationIssues = issues.filter(i => i.issue === 'Nom non normalise (casse)')
    expect(normalizationIssues).toHaveLength(2)
  })
})

// ==================== API CLIENT TESTS ====================

describe('BoondManagerClient', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Environment Configuration', () => {
    it('should initialize with sandbox environment by default', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient()
      expect(client.getEnvironment()).toBe('sandbox')
    })

    it('should initialize with production environment when specified', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('production')
      expect(client.getEnvironment()).toBe('production')
    })
  })

  describe('Write Protection', () => {
    it('should allow writes in sandbox environment', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: { id: 1 } })),
      })

      // Should not throw
      await expect(client.createCandidate({
        firstName: 'Test',
        lastName: 'User',
      })).resolves.toBeDefined()
    })

    it('should block writes in production environment', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('production')

      await expect(client.createCandidate({
        firstName: 'Test',
        lastName: 'User',
      })).rejects.toThrow('non autorisee en production')
    })

    it('should block updates in production environment', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('production')

      await expect(client.updateCandidate(1, {
        firstName: 'Updated',
      })).rejects.toThrow('non autorisee en production')
    })

    it('should block deletes in production environment', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('production')

      await expect(client.deleteCandidate(1)).rejects.toThrow('non autorisee en production')
    })
  })

  describe('API Calls', () => {
    it('should include proper authorization header', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: [] })),
      })

      await client.getCandidates()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/candidates'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      )
    })

    it('should handle API errors gracefully', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      })

      await expect(client.getCandidates()).rejects.toThrow('401')
    })

    it('should handle empty responses', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })

      // deleteCandidate returns void, so just check it doesn't throw
      await expect(client.deleteCandidate(1)).resolves.toBeUndefined()
    })

    it('should build correct query parameters', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: [] })),
      })

      await client.getCandidates({
        page: 2,
        maxResults: 50,
        keywords: 'test',
        state: 1,
      })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('page=2')
      expect(calledUrl).toContain('maxResults=50')
      expect(calledUrl).toContain('keywords=test')
      expect(calledUrl).toContain('state=1')
    })
  })

  describe('Dashboard Stats', () => {
    it('should aggregate stats correctly', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      // Mock all entity fetches
      const mockResponse = (data: unknown[]) => ({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data })),
      })

      mockFetch
        .mockResolvedValueOnce(mockResponse([
          { id: 1, attributes: { state: 0 } },
          { id: 2, attributes: { state: 1 } },
          { id: 3, attributes: { state: 1 } },
        ])) // candidates
        .mockResolvedValueOnce(mockResponse([
          { id: 1, attributes: { state: 1 } },
        ])) // resources
        .mockResolvedValueOnce(mockResponse([])) // opportunities
        .mockResolvedValueOnce(mockResponse([])) // companies
        .mockResolvedValueOnce(mockResponse([])) // projects

      const stats = await client.getDashboardStats()

      expect(stats.candidates.total).toBe(3)
      expect(stats.candidates.byState[0]).toBe(1)
      expect(stats.candidates.byState[1]).toBe(2)
      expect(stats.resources.total).toBe(1)
      expect(stats.opportunities.total).toBe(0)
    })
  })
})

// ==================== SYNC SERVICE TESTS ====================

describe('BoondSyncService', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('Data Cleaning', () => {
    it('should clean all entity data', async () => {
      const { BoondSyncService } = await import('@/lib/boondmanager-sync')
      const service = new BoondSyncService()

      const testData = {
        exportedAt: new Date(),
        environment: 'sandbox' as const,
        entities: {
          candidates: [{
            id: 1,
            attributes: {
              firstName: 'JEAN',
              lastName: 'dupont',
              email: 'JEAN@EXAMPLE.COM',
              phone1: '0612345678',
            }
          }],
          resources: [],
          opportunities: [],
          companies: [],
          contacts: [],
          projects: [],
        },
        stats: {
          candidates: 1,
          resources: 0,
          opportunities: 0,
          companies: 0,
          contacts: 0,
          projects: 0,
        }
      }

      const cleaned = service.cleanData(testData)

      expect(cleaned.entities.candidates[0].attributes.firstName).toBe('Jean')
      expect(cleaned.entities.candidates[0].attributes.lastName).toBe('Dupont')
      expect(cleaned.entities.candidates[0].attributes.email).toBe('jean@example.com')
      expect(cleaned.entities.candidates[0].attributes.phone1).toBe('+33 6 12 34 56 78')
    })
  })

  describe('Export Functions', () => {
    it('should export data to JSON', async () => {
      const { BoondSyncService } = await import('@/lib/boondmanager-sync')
      const service = new BoondSyncService()

      const testData = {
        exportedAt: new Date(),
        environment: 'sandbox' as const,
        entities: {
          candidates: [{ id: 1, attributes: { firstName: 'Test' } }],
          resources: [],
          opportunities: [],
          companies: [],
          contacts: [],
          projects: [],
        },
        stats: {
          candidates: 1,
          resources: 0,
          opportunities: 0,
          companies: 0,
          contacts: 0,
          projects: 0,
        }
      }

      const json = service.exportToJSON(testData)
      const parsed = JSON.parse(json)

      expect(parsed.entities.candidates).toHaveLength(1)
      expect(parsed.environment).toBe('sandbox')
    })

    it('should export data to CSV', async () => {
      const { BoondSyncService } = await import('@/lib/boondmanager-sync')
      const service = new BoondSyncService()

      const items = [
        { id: 1, attributes: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com' } },
        { id: 2, attributes: { firstName: 'Marie', lastName: 'Martin', email: 'marie@test.com' } },
      ]

      const csv = service.exportToCSV(items, ['firstName', 'lastName', 'email'])
      const lines = csv.split('\n')

      expect(lines[0]).toBe('id,firstName,lastName,email')
      expect(lines[1]).toBe('1,Jean,Dupont,jean@test.com')
      expect(lines[2]).toBe('2,Marie,Martin,marie@test.com')
    })

    it('should escape special characters in CSV', async () => {
      const { BoondSyncService } = await import('@/lib/boondmanager-sync')
      const service = new BoondSyncService()

      const items = [
        { id: 1, attributes: { name: 'Test, Inc', note: 'Line 1\nLine 2' } },
      ]

      const csv = service.exportToCSV(items, ['name', 'note'])
      const lines = csv.split('\n')

      expect(lines[1]).toContain('"Test, Inc"')
      expect(lines[1]).toContain('"Line 1')
    })
  })
})

// ==================== STATE MAPPINGS TESTS ====================

describe('State Mappings', () => {
  it('should have valid candidate states', async () => {
    const { CANDIDATE_STATES } = await import('@/lib/boondmanager-client')
    expect(CANDIDATE_STATES[0]).toBe('Nouveau')
    expect(CANDIDATE_STATES[6]).toBe('Embauche')
    expect(CANDIDATE_STATES[7]).toBe('Refuse')
  })

  it('should have valid resource states', async () => {
    const { RESOURCE_STATES } = await import('@/lib/boondmanager-client')
    expect(RESOURCE_STATES[1]).toBe('Disponible')
    expect(RESOURCE_STATES[2]).toBe('En mission')
  })

  it('should have valid opportunity states', async () => {
    const { OPPORTUNITY_STATES } = await import('@/lib/boondmanager-client')
    expect(OPPORTUNITY_STATES[0]).toBe('En cours')
    expect(OPPORTUNITY_STATES[1]).toBe('Gagnee')
    expect(OPPORTUNITY_STATES[2]).toBe('Perdue')
  })

  it('should have valid company states', async () => {
    const { COMPANY_STATES } = await import('@/lib/boondmanager-client')
    expect(COMPANY_STATES[0]).toBe('Prospect')
    expect(COMPANY_STATES[1]).toBe('Client')
  })
})

// ==================== DICTIONARY API TESTS ====================

describe('Dictionary API', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const mockDictionaryResponse = {
    data: {
      attributes: {
        candidateStates: [
          { id: 0, value: 'Nouveau', color: '#999999', isDefault: true, isActive: true },
          { id: 1, value: 'A contacter', color: '#3498db', isActive: true },
          { id: 6, value: 'Embauche', color: '#27ae60', isActive: true },
          { id: 7, value: 'Refuse', color: '#e74c3c', isActive: true },
        ],
        resourceStates: [
          { id: 1, value: 'Disponible', color: '#27ae60', isActive: true },
          { id: 2, value: 'En mission', color: '#3498db', isActive: true },
          { id: 3, value: 'Parti', color: '#e74c3c', isActive: false },
        ],
        opportunityStates: [
          { id: 0, value: 'En cours', color: '#f39c12' },
          { id: 1, value: 'Gagnee', color: '#27ae60' },
          { id: 2, value: 'Perdue', color: '#e74c3c' },
        ],
        companyTypes: [
          { id: 1, value: 'Client' },
          { id: 2, value: 'Fournisseur' },
          { id: 3, value: 'Partenaire' },
        ],
        projectTypes: [
          { id: 1, value: 'Regie' },
          { id: 2, value: 'Forfait' },
        ],
        activityAreas: [
          { id: 1, value: 'IT / Digital' },
          { id: 2, value: 'Banque / Finance' },
          { id: 3, value: 'Industrie' },
        ],
      }
    }
  }

  describe('getDictionary', () => {
    it('should fetch dictionary from API', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockDictionaryResponse)),
      })

      const dictionary = await client.getDictionary()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/application/dictionary'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
            Accept: 'application/json',
          }),
        })
      )

      expect(dictionary.data.attributes.candidateStates).toBeDefined()
      expect(dictionary.data.attributes.candidateStates).toHaveLength(4)
    })

    it('should include candidate states with proper structure', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockDictionaryResponse)),
      })

      const dictionary = await client.getDictionary()
      const candidateStates = dictionary.data.attributes.candidateStates

      expect(candidateStates?.[0]).toEqual({
        id: 0,
        value: 'Nouveau',
        color: '#999999',
        isDefault: true,
        isActive: true,
      })
    })

    it('should include resource states', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockDictionaryResponse)),
      })

      const dictionary = await client.getDictionary()
      const resourceStates = dictionary.data.attributes.resourceStates

      expect(resourceStates).toHaveLength(3)
      expect(resourceStates?.[0].value).toBe('Disponible')
    })

    it('should include opportunity states', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockDictionaryResponse)),
      })

      const dictionary = await client.getDictionary()
      const opportunityStates = dictionary.data.attributes.opportunityStates

      expect(opportunityStates).toHaveLength(3)
      expect(opportunityStates?.find(s => s.value === 'Gagnee')).toBeDefined()
    })

    it('should include company types', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockDictionaryResponse)),
      })

      const dictionary = await client.getDictionary()
      const companyTypes = dictionary.data.attributes.companyTypes

      expect(companyTypes).toHaveLength(3)
      expect(companyTypes?.[0].value).toBe('Client')
    })

    it('should include activity areas', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockDictionaryResponse)),
      })

      const dictionary = await client.getDictionary()
      const activityAreas = dictionary.data.attributes.activityAreas

      expect(activityAreas).toHaveLength(3)
      expect(activityAreas?.find(a => a.value === 'IT / Digital')).toBeDefined()
    })

    it('should handle API errors gracefully', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      })

      await expect(client.getDictionary()).rejects.toThrow('500')
    })

    it('should work with production environment (read-only)', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('production')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockDictionaryResponse)),
      })

      // Dictionary fetch should work in production (read-only operation)
      const dictionary = await client.getDictionary()
      expect(dictionary.data.attributes.candidateStates).toBeDefined()
    })
  })

  describe('Dictionary Data Structure', () => {
    it('should have optional fields for dictionary items', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      const minimalDictionary = {
        data: {
          attributes: {
            candidateStates: [
              { id: 0, value: 'Test' }, // Only required fields
            ],
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(minimalDictionary)),
      })

      const dictionary = await client.getDictionary()
      const state = dictionary.data.attributes.candidateStates?.[0]

      expect(state?.id).toBe(0)
      expect(state?.value).toBe('Test')
      expect(state?.color).toBeUndefined()
      expect(state?.isDefault).toBeUndefined()
    })

    it('should handle empty dictionary attributes', async () => {
      const { BoondManagerClient } = await import('@/lib/boondmanager-client')
      const client = new BoondManagerClient('sandbox')

      const emptyDictionary = {
        data: {
          attributes: {}
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(emptyDictionary)),
      })

      const dictionary = await client.getDictionary()
      expect(dictionary.data.attributes.candidateStates).toBeUndefined()
      expect(dictionary.data.attributes.resourceStates).toBeUndefined()
    })
  })
})

// ==================== ENVIRONMENT SWITCHING TESTS ====================

describe('Environment Switching', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should track environment correctly for sandbox', async () => {
    const { BoondManagerClient } = await import('@/lib/boondmanager-client')
    const sandboxClient = new BoondManagerClient('sandbox')
    expect(sandboxClient.getEnvironment()).toBe('sandbox')
  })

  it('should track environment correctly for production', async () => {
    const { BoondManagerClient } = await import('@/lib/boondmanager-client')
    const prodClient = new BoondManagerClient('production')
    expect(prodClient.getEnvironment()).toBe('production')
  })

  it('should preserve environment across multiple calls', async () => {
    const { BoondManagerClient } = await import('@/lib/boondmanager-client')
    const client = new BoondManagerClient('sandbox')

    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: [] })),
    })

    await client.getCandidates()
    await client.getResources()
    await client.getCompanies()

    expect(client.getEnvironment()).toBe('sandbox')
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('should allow reads in both environments', async () => {
    const { BoondManagerClient } = await import('@/lib/boondmanager-client')

    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: [] })),
    })

    const sandboxClient = new BoondManagerClient('sandbox')
    const prodClient = new BoondManagerClient('production')

    // Both should allow reads
    await expect(sandboxClient.getCandidates()).resolves.toBeDefined()
    await expect(prodClient.getCandidates()).resolves.toBeDefined()
  })
})
