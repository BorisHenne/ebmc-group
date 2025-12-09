/**
 * Tests for the role-based access control system
 *
 * Role Categories:
 * - Bureau: admin, commercial, sourceur, rh (internal staff)
 * - Terrain: consultant_cdi, freelance, candidat (consultants and candidates)
 */

import {
  ROLES,
  ROLE_CATEGORIES,
  ROLE_TO_CATEGORY,
  ROLE_PERMISSIONS,
  ROLE_LABELS,
  ROLE_COLORS,
  RoleType,
  RoleCategory,
  BureauRole,
  TerrainRole,
  hasPermission,
  getRolePermissions,
  getRoleDefinition,
  getRoleCategory,
  getRolesByCategory,
  getBureauRoles,
  getTerrainRoles,
  isBureauRole,
  isTerrainRole,
  canTransitionToConsultant,
  getConsultantRoleForContract
} from '@/lib/roles'

describe('Role Categories', () => {
  test('should have two role categories', () => {
    expect(Object.keys(ROLE_CATEGORIES)).toHaveLength(2)
    expect(ROLE_CATEGORIES.bureau).toBeDefined()
    expect(ROLE_CATEGORIES.terrain).toBeDefined()
  })

  test('bureau category should have correct properties', () => {
    expect(ROLE_CATEGORIES.bureau.id).toBe('bureau')
    expect(ROLE_CATEGORIES.bureau.label).toBe('Bureau')
    expect(ROLE_CATEGORIES.bureau.description).toBeTruthy()
  })

  test('terrain category should have correct properties', () => {
    expect(ROLE_CATEGORIES.terrain.id).toBe('terrain')
    expect(ROLE_CATEGORIES.terrain.label).toBe('Terrain')
    expect(ROLE_CATEGORIES.terrain.description).toBeTruthy()
  })
})

describe('Bureau Roles', () => {
  const bureauRoles: BureauRole[] = ['admin', 'commercial', 'sourceur', 'rh']

  test.each(bureauRoles)('%s should be categorized as bureau', (role) => {
    expect(ROLE_TO_CATEGORY[role]).toBe('bureau')
    expect(isBureauRole(role)).toBe(true)
    expect(isTerrainRole(role)).toBe(false)
  })

  test('getBureauRoles should return all bureau roles', () => {
    const roles = getBureauRoles()
    expect(roles).toHaveLength(4)
    roles.forEach(role => {
      expect(role.category).toBe('bureau')
    })
  })

  test('admin should have full permissions', () => {
    const adminPerms = ROLE_PERMISSIONS.admin
    expect(adminPerms.dashboard).toBe(true)
    expect(adminPerms.users).toBe(true)
    expect(adminPerms.roles).toBe(true)
    expect(adminPerms.settings).toBe(true)
    expect(adminPerms.viewAllData).toBe(true)
    expect(adminPerms.canManageContracts).toBe(true)
  })

  test('commercial should have commercial dashboard access', () => {
    const perms = ROLE_PERMISSIONS.commercial
    expect(perms.commercialDashboard).toBe(true)
    expect(perms.sourceurDashboard).toBe(false)
    expect(perms.rhDashboard).toBe(false)
    expect(perms.jobs).toBe(true)
    expect(perms.consultants).toBe(true)
  })

  test('sourceur should have sourceur dashboard and scraper access', () => {
    const perms = ROLE_PERMISSIONS.sourceur
    expect(perms.sourceurDashboard).toBe(true)
    expect(perms.scraper).toBe(true)
    expect(perms.recruitment).toBe(true)
    expect(perms.candidates).toBe(true)
  })

  test('rh should have HR specific permissions', () => {
    const perms = ROLE_PERMISSIONS.rh
    expect(perms.rhDashboard).toBe(true)
    expect(perms.users).toBe(true)
    expect(perms.canManageContracts).toBe(true)
    expect(perms.viewAllData).toBe(true)
  })
})

describe('Terrain Roles', () => {
  const terrainRoles: TerrainRole[] = ['consultant_cdi', 'freelance', 'candidat']

  test.each(terrainRoles)('%s should be categorized as terrain', (role) => {
    expect(ROLE_TO_CATEGORY[role]).toBe('terrain')
    expect(isTerrainRole(role)).toBe(true)
    expect(isBureauRole(role)).toBe(false)
  })

  test('getTerrainRoles should return all terrain roles', () => {
    const roles = getTerrainRoles()
    expect(roles).toHaveLength(3)
    roles.forEach(role => {
      expect(role.category).toBe('terrain')
    })
  })

  test('consultant_cdi should have consultant portal access', () => {
    const perms = ROLE_PERMISSIONS.consultant_cdi
    expect(perms.consultantPortal).toBe(true)
    expect(perms.dashboard).toBe(false)
    expect(perms.users).toBe(false)
  })

  test('freelance should have consultant portal access', () => {
    const perms = ROLE_PERMISSIONS.freelance
    expect(perms.consultantPortal).toBe(true)
    expect(perms.dashboard).toBe(false)
    expect(perms.users).toBe(false)
  })

  test('candidat should NOT have consultant portal access', () => {
    const perms = ROLE_PERMISSIONS.candidat
    expect(perms.consultantPortal).toBe(false)
    expect(perms.dashboard).toBe(false)
    // Candidates have minimal permissions until hired
  })
})

describe('Role Helper Functions', () => {
  test('hasPermission should return correct values', () => {
    expect(hasPermission('admin', 'dashboard')).toBe(true)
    expect(hasPermission('commercial', 'users')).toBe(false)
    expect(hasPermission('sourceur', 'scraper')).toBe(true)
    expect(hasPermission('freelance', 'consultantPortal')).toBe(true)
    expect(hasPermission('candidat', 'consultantPortal')).toBe(false)
  })

  test('hasPermission should return false for unknown roles', () => {
    expect(hasPermission('unknown_role', 'dashboard')).toBe(false)
  })

  test('getRolePermissions should return permissions or null', () => {
    expect(getRolePermissions('admin')).not.toBeNull()
    expect(getRolePermissions('unknown')).toBeNull()
  })

  test('getRoleDefinition should return role definition or null', () => {
    const adminDef = getRoleDefinition('admin')
    expect(adminDef).not.toBeNull()
    expect(adminDef?.id).toBe('admin')
    expect(adminDef?.label).toBe('Administrateur')
    expect(adminDef?.category).toBe('bureau')

    expect(getRoleDefinition('unknown')).toBeNull()
  })

  test('getRoleCategory should return correct category', () => {
    expect(getRoleCategory('admin')).toBe('bureau')
    expect(getRoleCategory('commercial')).toBe('bureau')
    expect(getRoleCategory('consultant_cdi')).toBe('terrain')
    expect(getRoleCategory('freelance')).toBe('terrain')
    expect(getRoleCategory('unknown')).toBeNull()
  })

  test('getRolesByCategory should return roles for a category', () => {
    const bureau = getRolesByCategory('bureau')
    const terrain = getRolesByCategory('terrain')

    expect(bureau.length).toBe(4)
    expect(terrain.length).toBe(3)

    bureau.forEach(r => expect(r.category).toBe('bureau'))
    terrain.forEach(r => expect(r.category).toBe('terrain'))
  })
})

describe('Candidate Transition Helpers', () => {
  test('canTransitionToConsultant should check embauche status', () => {
    expect(canTransitionToConsultant('embauche')).toBe(true)
    expect(canTransitionToConsultant('entretien')).toBe(false)
    expect(canTransitionToConsultant('a_qualifier')).toBe(false)
  })

  test('getConsultantRoleForContract should return correct role', () => {
    expect(getConsultantRoleForContract('cdi')).toBe('consultant_cdi')
    expect(getConsultantRoleForContract('freelance')).toBe('freelance')
  })
})

describe('Role Labels and Colors', () => {
  const allRoles: RoleType[] = [
    'admin', 'commercial', 'sourceur', 'rh',
    'consultant_cdi', 'freelance', 'candidat'
  ]

  test.each(allRoles)('%s should have a label', (role) => {
    expect(ROLE_LABELS[role]).toBeTruthy()
    expect(typeof ROLE_LABELS[role]).toBe('string')
  })

  test.each(allRoles)('%s should have a color', (role) => {
    expect(ROLE_COLORS[role]).toBeTruthy()
    expect(ROLE_COLORS[role]).toContain('from-')
    expect(ROLE_COLORS[role]).toContain('to-')
  })

  test.each(allRoles)('%s should have a complete definition', (role) => {
    const def = ROLES[role]
    expect(def.id).toBe(role)
    expect(def.label).toBeTruthy()
    expect(def.description).toBeTruthy()
    expect(def.category).toBeTruthy()
    expect(def.color).toBeTruthy()
    expect(def.icon).toBeTruthy()
  })
})

describe('Portal Permissions', () => {
  describe('consultantPortal permission', () => {
    test('consultant_cdi should have consultantPortal access', () => {
      expect(hasPermission('consultant_cdi', 'consultantPortal')).toBe(true)
    })

    test('freelance should have consultantPortal access', () => {
      expect(hasPermission('freelance', 'consultantPortal')).toBe(true)
    })

    test('candidat should NOT have consultantPortal access', () => {
      expect(hasPermission('candidat', 'consultantPortal')).toBe(false)
    })

    test('admin should NOT have consultantPortal access (admin uses main dashboard)', () => {
      expect(hasPermission('admin', 'consultantPortal')).toBe(false)
    })

    test('bureau roles should NOT have consultantPortal access', () => {
      expect(hasPermission('commercial', 'consultantPortal')).toBe(false)
      expect(hasPermission('sourceur', 'consultantPortal')).toBe(false)
      expect(hasPermission('rh', 'consultantPortal')).toBe(false)
    })
  })

  describe('freelancePortal permission', () => {
    test('consultant_cdi should have freelancePortal access', () => {
      expect(hasPermission('consultant_cdi', 'freelancePortal')).toBe(true)
    })

    test('freelance should have freelancePortal access', () => {
      expect(hasPermission('freelance', 'freelancePortal')).toBe(true)
    })

    test('candidat should NOT have freelancePortal access', () => {
      expect(hasPermission('candidat', 'freelancePortal')).toBe(false)
    })

    test('bureau roles should NOT have freelancePortal access', () => {
      expect(hasPermission('admin', 'freelancePortal')).toBe(false)
      expect(hasPermission('commercial', 'freelancePortal')).toBe(false)
      expect(hasPermission('sourceur', 'freelancePortal')).toBe(false)
      expect(hasPermission('rh', 'freelancePortal')).toBe(false)
    })
  })

  describe('consultantPortal and freelancePortal should be equivalent for terrain roles', () => {
    test('consultant_cdi should have same access for both portals', () => {
      expect(hasPermission('consultant_cdi', 'consultantPortal')).toBe(
        hasPermission('consultant_cdi', 'freelancePortal')
      )
    })

    test('freelance should have same access for both portals', () => {
      expect(hasPermission('freelance', 'consultantPortal')).toBe(
        hasPermission('freelance', 'freelancePortal')
      )
    })
  })
})

describe('BoondManager Permissions', () => {
  describe('boondManager permission', () => {
    test('admin should have boondManager access', () => {
      expect(hasPermission('admin', 'boondManager')).toBe(true)
    })

    test('commercial should have boondManager access', () => {
      expect(hasPermission('commercial', 'boondManager')).toBe(true)
    })

    test('sourceur should have boondManager access', () => {
      expect(hasPermission('sourceur', 'boondManager')).toBe(true)
    })

    test('rh should have boondManager access', () => {
      expect(hasPermission('rh', 'boondManager')).toBe(true)
    })

    test('terrain roles should NOT have boondManager access', () => {
      expect(hasPermission('consultant_cdi', 'boondManager')).toBe(false)
      expect(hasPermission('freelance', 'boondManager')).toBe(false)
      expect(hasPermission('candidat', 'boondManager')).toBe(false)
    })
  })

  describe('boondManagerAdmin permission', () => {
    test('only admin should have boondManagerAdmin access', () => {
      expect(hasPermission('admin', 'boondManagerAdmin')).toBe(true)
    })

    test('commercial should NOT have boondManagerAdmin access', () => {
      expect(hasPermission('commercial', 'boondManagerAdmin')).toBe(false)
    })

    test('sourceur should NOT have boondManagerAdmin access', () => {
      expect(hasPermission('sourceur', 'boondManagerAdmin')).toBe(false)
    })

    test('rh should NOT have boondManagerAdmin access', () => {
      expect(hasPermission('rh', 'boondManagerAdmin')).toBe(false)
    })

    test('terrain roles should NOT have boondManagerAdmin access', () => {
      expect(hasPermission('consultant_cdi', 'boondManagerAdmin')).toBe(false)
      expect(hasPermission('freelance', 'boondManagerAdmin')).toBe(false)
      expect(hasPermission('candidat', 'boondManagerAdmin')).toBe(false)
    })
  })
})

describe('Scraper Permissions', () => {
  test('admin should have scraper access', () => {
    expect(hasPermission('admin', 'scraper')).toBe(true)
  })

  test('sourceur should have scraper access', () => {
    expect(hasPermission('sourceur', 'scraper')).toBe(true)
  })

  test('commercial should NOT have scraper access', () => {
    expect(hasPermission('commercial', 'scraper')).toBe(false)
  })

  test('rh should NOT have scraper access', () => {
    expect(hasPermission('rh', 'scraper')).toBe(false)
  })

  test('terrain roles should NOT have scraper access', () => {
    expect(hasPermission('consultant_cdi', 'scraper')).toBe(false)
    expect(hasPermission('freelance', 'scraper')).toBe(false)
    expect(hasPermission('candidat', 'scraper')).toBe(false)
  })
})

describe('All Permissions Exist in RolePermissions', () => {
  const allPermissions = [
    'dashboard',
    'sourceurDashboard',
    'commercialDashboard',
    'rhDashboard',
    'recruitment',
    'jobs',
    'consultants',
    'candidates',
    'messages',
    'users',
    'roles',
    'webhooks',
    'apiTokens',
    'demoData',
    'docs',
    'settings',
    'freelancePortal',
    'consultantPortal',
    'scraper',
    'boondManager',
    'boondManagerAdmin',
    'canAssignJobs',
    'canAssignConsultants',
    'canManageContracts',
    'viewAllData',
    'viewAssignedOnly',
  ] as const

  test.each(allPermissions)('%s permission should exist in admin permissions', (permission) => {
    const adminPerms = ROLE_PERMISSIONS.admin
    expect(permission in adminPerms).toBe(true)
  })

  test('all permissions should be defined as boolean', () => {
    const adminPerms = ROLE_PERMISSIONS.admin
    allPermissions.forEach(permission => {
      expect(typeof adminPerms[permission]).toBe('boolean')
    })
  })
})
