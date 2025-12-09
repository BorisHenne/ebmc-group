/**
 * Tests for the Candidate/Consultant type system
 *
 * Flow: Candidat → (recruitment) → Consultant CDI or Freelance
 */

import {
  Candidate,
  CandidateStatus,
  ContractType,
  Seniority,
  Mobility,
  JobFamilyCategory,
  JOB_FAMILIES,
  SKILLS_BY_CATEGORY,
  PHONE_COUNTRY_CODES,
  LANGUAGES,
  STATUS_LABELS,
  STATUS_COLORS,
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  isConsultant,
  isConsultantCDI,
  isFreelance,
  getCandidateRole,
  getFullName,
  getInitials,
  getJobFamilyCategory,
  getSkillsForJobFamily,
  generateDemoCandidates,
  getCandidateCountsByStatus,
  getAverageTJM
} from '@/types/candidate'

describe('Candidate Status', () => {
  const allStatuses: CandidateStatus[] = [
    'a_qualifier', 'qualifie', 'en_cours', 'entretien', 'proposition', 'embauche'
  ]

  test.each(allStatuses)('status %s should have a label', (status) => {
    expect(STATUS_LABELS[status]).toBeTruthy()
    expect(typeof STATUS_LABELS[status]).toBe('string')
  })

  test.each(allStatuses)('status %s should have a color', (status) => {
    expect(STATUS_COLORS[status]).toBeTruthy()
    expect(STATUS_COLORS[status]).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  test('embauche should be the hired status', () => {
    expect(STATUS_LABELS['embauche']).toBe('Embauché')
  })
})

describe('Contract Types', () => {
  const contractTypes: ContractType[] = ['cdi', 'freelance']

  test.each(contractTypes)('contract type %s should have a label', (type) => {
    expect(CONTRACT_TYPE_LABELS[type]).toBeTruthy()
  })

  test.each(contractTypes)('contract type %s should have colors', (type) => {
    expect(CONTRACT_TYPE_COLORS[type].bg).toBeTruthy()
    expect(CONTRACT_TYPE_COLORS[type].text).toBeTruthy()
  })
})

describe('Job Families', () => {
  const categories: JobFamilyCategory[] = ['SAP', 'Dev', 'Data', 'Cloud', 'Cyber', 'Gestion']

  test('should have job families defined', () => {
    expect(JOB_FAMILIES.length).toBeGreaterThan(0)
  })

  test('each job family should have id, label, and category', () => {
    JOB_FAMILIES.forEach(family => {
      expect(family.id).toBeTruthy()
      expect(family.label).toBeTruthy()
      expect(family.category).toBeTruthy()
      expect(categories).toContain(family.category)
    })
  })

  test('should have SAP job families', () => {
    const sapFamilies = JOB_FAMILIES.filter(f => f.category === 'SAP')
    expect(sapFamilies.length).toBeGreaterThan(0)
  })

  test('should have Dev job families', () => {
    const devFamilies = JOB_FAMILIES.filter(f => f.category === 'Dev')
    expect(devFamilies.length).toBeGreaterThan(0)
  })

  test('getJobFamilyCategory should return correct category', () => {
    expect(getJobFamilyCategory('consultant_sap_fonctionnel')).toBe('SAP')
    expect(getJobFamilyCategory('developpeur_fullstack')).toBe('Dev')
    expect(getJobFamilyCategory('data_engineer')).toBe('Data')
    expect(getJobFamilyCategory('unknown')).toBeNull()
  })
})

describe('Skills by Category', () => {
  const categories: JobFamilyCategory[] = ['SAP', 'Dev', 'Data', 'Cloud', 'Cyber', 'Gestion']

  test.each(categories)('%s category should have modules and subModules', (category) => {
    const skills = SKILLS_BY_CATEGORY[category]
    expect(skills.modules.length).toBeGreaterThan(0)
    expect(skills.subModules.length).toBeGreaterThan(0)
  })

  test('SAP skills should include SAP modules', () => {
    const sapSkills = SKILLS_BY_CATEGORY.SAP
    expect(sapSkills.modules).toContain('SAP FI')
    expect(sapSkills.modules).toContain('SAP S/4HANA')
    expect(sapSkills.subModules).toContain('FIORI')
  })

  test('Dev skills should include programming languages', () => {
    const devSkills = SKILLS_BY_CATEGORY.Dev
    expect(devSkills.modules).toContain('JavaScript')
    expect(devSkills.modules).toContain('TypeScript')
    expect(devSkills.subModules).toContain('React')
  })

  test('getSkillsForJobFamily should return correct skills', () => {
    const sapSkills = getSkillsForJobFamily('consultant_sap_fonctionnel')
    expect(sapSkills.modules).toContain('SAP FI')

    const devSkills = getSkillsForJobFamily('developpeur_fullstack')
    expect(devSkills.modules).toContain('JavaScript')

    const unknownSkills = getSkillsForJobFamily('unknown')
    expect(unknownSkills.modules).toHaveLength(0)
    expect(unknownSkills.subModules).toHaveLength(0)
  })
})

describe('Phone Country Codes', () => {
  test('should have country codes defined', () => {
    expect(PHONE_COUNTRY_CODES.length).toBeGreaterThan(0)
  })

  test('each code should have code, country, and flag', () => {
    PHONE_COUNTRY_CODES.forEach(entry => {
      expect(entry.code).toMatch(/^\+\d+$/)
      expect(entry.country).toBeTruthy()
      expect(entry.flag).toBeTruthy()
    })
  })

  test('should include France (+33)', () => {
    const france = PHONE_COUNTRY_CODES.find(c => c.code === '+33')
    expect(france).toBeDefined()
    expect(france?.country).toBe('France')
  })

  test('should include Luxembourg (+352)', () => {
    const lux = PHONE_COUNTRY_CODES.find(c => c.code === '+352')
    expect(lux).toBeDefined()
    expect(lux?.country).toBe('Luxembourg')
  })
})

describe('Languages', () => {
  test('should have languages defined', () => {
    expect(LANGUAGES.length).toBeGreaterThan(0)
  })

  test('should include French and English', () => {
    expect(LANGUAGES).toContain('Français')
    expect(LANGUAGES).toContain('Anglais')
  })
})

describe('Candidate Helper Functions', () => {
  const baseCandidateProps = {
    id: 'test-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@test.com',
    modules: [],
    subModules: [],
    experience: { years: 5, seniority: 'Senior' as Seniority },
    availability: { isAvailable: true },
    location: { city: 'Paris', country: 'France' },
    mobility: ['IDF' as Mobility],
    remoteWork: false,
    languages: ['Français' as const],
    createdAt: new Date().toISOString()
  }

  describe('isConsultant', () => {
    test('should return true for embauche status', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'embauche' }
      expect(isConsultant(candidate)).toBe(true)
    })

    test('should return false for other statuses', () => {
      const statuses: CandidateStatus[] = ['a_qualifier', 'qualifie', 'en_cours', 'entretien', 'proposition']
      statuses.forEach(status => {
        const candidate: Candidate = { ...baseCandidateProps, status }
        expect(isConsultant(candidate)).toBe(false)
      })
    })
  })

  describe('isConsultantCDI', () => {
    test('should return true for embauche with cdi contract', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'embauche', contractType: 'cdi' }
      expect(isConsultantCDI(candidate)).toBe(true)
    })

    test('should return false for freelance contract', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'embauche', contractType: 'freelance' }
      expect(isConsultantCDI(candidate)).toBe(false)
    })

    test('should return false if not hired', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'entretien', contractType: 'cdi' }
      expect(isConsultantCDI(candidate)).toBe(false)
    })
  })

  describe('isFreelance', () => {
    test('should return true for embauche with freelance contract', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'embauche', contractType: 'freelance' }
      expect(isFreelance(candidate)).toBe(true)
    })

    test('should return false for cdi contract', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'embauche', contractType: 'cdi' }
      expect(isFreelance(candidate)).toBe(false)
    })
  })

  describe('getCandidateRole', () => {
    test('should return candidat for non-hired candidates', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'entretien' }
      expect(getCandidateRole(candidate)).toBe('candidat')
    })

    test('should return consultant_cdi for hired CDI', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'embauche', contractType: 'cdi' }
      expect(getCandidateRole(candidate)).toBe('consultant_cdi')
    })

    test('should return freelance for hired freelance', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'embauche', contractType: 'freelance' }
      expect(getCandidateRole(candidate)).toBe('freelance')
    })
  })

  describe('getFullName', () => {
    test('should return full name', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'a_qualifier' }
      expect(getFullName(candidate)).toBe('Jean Dupont')
    })
  })

  describe('getInitials', () => {
    test('should return initials', () => {
      const candidate: Candidate = { ...baseCandidateProps, status: 'a_qualifier' }
      expect(getInitials(candidate)).toBe('JD')
    })
  })
})

describe('Demo Data Generation', () => {
  test('should generate the requested number of candidates', () => {
    const candidates = generateDemoCandidates(10)
    expect(candidates).toHaveLength(10)
  })

  test('should generate candidates with all required fields', () => {
    const candidates = generateDemoCandidates(5)
    candidates.forEach(candidate => {
      expect(candidate.id).toBeTruthy()
      expect(candidate.firstName).toBeTruthy()
      expect(candidate.lastName).toBeTruthy()
      expect(candidate.email).toBeTruthy()
      expect(candidate.status).toBeTruthy()
      expect(candidate.experience).toBeDefined()
      expect(candidate.availability).toBeDefined()
      expect(candidate.location).toBeDefined()
    })
  })

  test('hired candidates should have contract type and hire date', () => {
    const candidates = generateDemoCandidates(50, 42)
    const hired = candidates.filter(c => c.status === 'embauche')

    // Ensure we have at least some hired candidates to test
    expect(hired.length).toBeGreaterThan(0)

    hired.forEach(candidate => {
      // Contract type should be defined for hired candidates
      expect(candidate.contractType).toBeDefined()
      expect(['cdi', 'freelance']).toContain(candidate.contractType)
      // Hire date should be set
      expect(candidate.hireDate).toBeTruthy()
    })
  })

  test('should be deterministic with same seed', () => {
    const candidates1 = generateDemoCandidates(10, 42)
    const candidates2 = generateDemoCandidates(10, 42)

    expect(candidates1).toEqual(candidates2)
  })

  test('should generate different data with different seeds', () => {
    const candidates1 = generateDemoCandidates(10, 42)
    const candidates2 = generateDemoCandidates(10, 99)

    expect(candidates1).not.toEqual(candidates2)
  })
})

describe('Candidate Statistics', () => {
  test('getCandidateCountsByStatus should count correctly', () => {
    const candidates = generateDemoCandidates(30)
    const counts = getCandidateCountsByStatus(candidates)

    // Sum should equal total candidates
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    expect(total).toBe(30)
  })

  test('getAverageTJM should calculate average', () => {
    const candidates = generateDemoCandidates(20)
    const avg = getAverageTJM(candidates)

    // Average should be a reasonable number
    expect(avg).toBeGreaterThan(0)
    expect(avg).toBeLessThan(2000)
  })

  test('getAverageTJM should return 0 for empty array', () => {
    expect(getAverageTJM([])).toBe(0)
  })
})
