// Role-based access control configuration
// Two main categories: Bureau (internal staff) and Terrain (consultants/candidates)

// ============================================================================
// ROLE CATEGORIES
// ============================================================================

export type RoleCategory = 'bureau' | 'terrain'

export const ROLE_CATEGORIES = {
  bureau: {
    id: 'bureau',
    label: 'Bureau',
    description: 'Équipe interne EBMC',
    icon: 'Building2',
    color: 'from-blue-500 to-indigo-500'
  },
  terrain: {
    id: 'terrain',
    label: 'Terrain',
    description: 'Consultants et candidats',
    icon: 'Users',
    color: 'from-green-500 to-emerald-500'
  }
} as const

// ============================================================================
// ROLE TYPES
// ============================================================================

// Bureau roles (internal staff)
export type BureauRole = 'admin' | 'commercial' | 'sourceur' | 'rh'

// Terrain roles (consultants and candidates)
export type TerrainRole = 'consultant_cdi' | 'freelance' | 'candidat'

// All roles
export type RoleType = BureauRole | TerrainRole

// Role to category mapping
export const ROLE_TO_CATEGORY: Record<RoleType, RoleCategory> = {
  // Bureau
  admin: 'bureau',
  commercial: 'bureau',
  sourceur: 'bureau',
  rh: 'bureau',
  // Terrain
  consultant_cdi: 'terrain',
  freelance: 'terrain',
  candidat: 'terrain'
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export interface RoleDefinition {
  id: RoleType
  label: string
  description: string
  category: RoleCategory
  color: string
  icon: string
}

export const ROLES: Record<RoleType, RoleDefinition> = {
  // Bureau roles
  admin: {
    id: 'admin',
    label: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    category: 'bureau',
    color: 'from-red-500 to-rose-500',
    icon: 'Shield'
  },
  commercial: {
    id: 'commercial',
    label: 'Commercial',
    description: 'Gestion des offres et relation client',
    category: 'bureau',
    color: 'from-blue-500 to-indigo-500',
    icon: 'Briefcase'
  },
  sourceur: {
    id: 'sourceur',
    label: 'Sourceur',
    description: 'Recrutement et sourcing de candidats',
    category: 'bureau',
    color: 'from-purple-500 to-pink-500',
    icon: 'Search'
  },
  rh: {
    id: 'rh',
    label: 'Ressources Humaines',
    description: 'Gestion administrative des collaborateurs',
    category: 'bureau',
    color: 'from-amber-500 to-orange-500',
    icon: 'UserCog'
  },
  // Terrain roles
  consultant_cdi: {
    id: 'consultant_cdi',
    label: 'Consultant CDI',
    description: 'Consultant interne en CDI',
    category: 'terrain',
    color: 'from-teal-500 to-cyan-500',
    icon: 'UserCheck'
  },
  freelance: {
    id: 'freelance',
    label: 'Freelance',
    description: 'Consultant externe indépendant',
    category: 'terrain',
    color: 'from-green-500 to-emerald-500',
    icon: 'Zap'
  },
  candidat: {
    id: 'candidat',
    label: 'Candidat',
    description: 'Candidat en cours de recrutement',
    category: 'terrain',
    color: 'from-slate-500 to-gray-500',
    icon: 'UserPlus'
  }
}

// ============================================================================
// PERMISSIONS
// ============================================================================

export interface RolePermissions {
  // Dashboard access
  dashboard: boolean
  sourceurDashboard: boolean
  commercialDashboard: boolean
  rhDashboard: boolean

  // Recruitment module
  recruitment: boolean

  // Admin modules
  jobs: boolean
  consultants: boolean
  candidates: boolean
  messages: boolean
  users: boolean
  roles: boolean
  webhooks: boolean
  apiTokens: boolean
  demoData: boolean
  docs: boolean
  settings: boolean

  // Special modules
  freelancePortal: boolean
  scraper: boolean // CV scraper for sourcing
  boondManager: boolean // BoondManager CRUD
  boondManagerAdmin: boolean // BoondManager Admin (Prod/Sandbox)
  // Data access
  canAssignJobs: boolean
  canAssignConsultants: boolean
  canManageContracts: boolean
  viewAllData: boolean
  viewAssignedOnly: boolean
}

export const ROLE_PERMISSIONS: Record<RoleType, RolePermissions> = {
  admin: {
    dashboard: true,
    sourceurDashboard: false,
    commercialDashboard: false,
    rhDashboard: false,
    recruitment: true,
    jobs: true,
    consultants: true,
    candidates: true,
    messages: true,
    users: true,
    roles: true,
    webhooks: true,
    apiTokens: true,
    demoData: true,
    docs: true,
    settings: true,
    consultantPortal: false,
    scraper: true,
    boondManager: true,
    boondManagerAdmin: true,
    canAssignJobs: true,
    canAssignConsultants: true,
    canManageContracts: true,
    viewAllData: true,
    viewAssignedOnly: false,
  },
  commercial: {
    dashboard: false,
    sourceurDashboard: false,
    commercialDashboard: true,
    rhDashboard: false,
    recruitment: true,
    jobs: true,
    consultants: true,
    candidates: false,
    messages: false,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: true,
    settings: false,
    consultantPortal: false,
    scraper: false,
    boondManager: true,
    canAssignJobs: false,
    canAssignConsultants: false,
    canManageContracts: false,
    viewAllData: false,
    viewAssignedOnly: true,
  },
  sourceur: {
    dashboard: false,
    sourceurDashboard: true,
    commercialDashboard: false,
    rhDashboard: false,
    recruitment: true,
    jobs: true,
    consultants: true,
    candidates: true,
    messages: true,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: true,
    settings: false,
    consultantPortal: false,
    scraper: true,
    boondManager: true,
    boondManagerAdmin: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    canManageContracts: false,
    viewAllData: false,
    viewAssignedOnly: true,
  },
  rh: {
    dashboard: false,
    sourceurDashboard: false,
    commercialDashboard: false,
    rhDashboard: true,
    recruitment: true,
    jobs: false,
    consultants: true,
    candidates: true,
    messages: true,
    users: true,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: true,
    settings: false,
    consultantPortal: false,
    scraper: false,
    boondManager: true,
    boondManagerAdmin: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    canManageContracts: true,
    viewAllData: true,
    viewAssignedOnly: false,
  },
  consultant_cdi: {
    dashboard: false,
    sourceurDashboard: false,
    commercialDashboard: false,
    rhDashboard: false,
    recruitment: false,
    jobs: false,
    consultants: false,
    candidates: false,
    messages: false,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: false,
    settings: false,
    consultantPortal: true,
    scraper: false,
    boondManager: false,
    boondManagerAdmin: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    canManageContracts: false,
    viewAllData: false,
    viewAssignedOnly: false,
  },
  freelance: {
    dashboard: false,
    sourceurDashboard: false,
    commercialDashboard: false,
    rhDashboard: false,
    recruitment: false,
    jobs: false,
    consultants: false,
    candidates: false,
    messages: false,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: false,
    settings: false,
    consultantPortal: true,
    scraper: false,
    boondManager: false,
    boondManagerAdmin: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    canManageContracts: false,
    viewAllData: false,
    viewAssignedOnly: false,
  },
  candidat: {
    dashboard: false,
    sourceurDashboard: false,
    commercialDashboard: false,
    rhDashboard: false,
    recruitment: false,
    jobs: false,
    consultants: false,
    candidates: false,
    messages: false,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: false,
    settings: false,
    consultantPortal: false, // Candidates don't have portal access until hired
    scraper: false,
    boondManager: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    canManageContracts: false,
    viewAllData: false,
    viewAssignedOnly: false,
  },
}

// ============================================================================
// BACKWARD COMPATIBILITY - Keep old exports
// ============================================================================

export const ROLE_LABELS: Record<RoleType, string> = Object.fromEntries(
  Object.entries(ROLES).map(([key, role]) => [key, role.label])
) as Record<RoleType, string>

export const ROLE_DESCRIPTIONS: Record<RoleType, string> = Object.fromEntries(
  Object.entries(ROLES).map(([key, role]) => [key, role.description])
) as Record<RoleType, string>

export const ROLE_COLORS: Record<RoleType, string> = Object.fromEntries(
  Object.entries(ROLES).map(([key, role]) => [key, role.color])
) as Record<RoleType, string>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function hasPermission(role: string, permission: keyof RolePermissions): boolean {
  const roleKey = role as RoleType
  if (!ROLE_PERMISSIONS[roleKey]) {
    return false
  }
  return ROLE_PERMISSIONS[roleKey][permission]
}

export function getRolePermissions(role: string): RolePermissions | null {
  const roleKey = role as RoleType
  return ROLE_PERMISSIONS[roleKey] || null
}

export function getRoleDefinition(role: string): RoleDefinition | null {
  const roleKey = role as RoleType
  return ROLES[roleKey] || null
}

export function getRoleCategory(role: string): RoleCategory | null {
  const roleKey = role as RoleType
  return ROLE_TO_CATEGORY[roleKey] || null
}

export function getRolesByCategory(category: RoleCategory): RoleDefinition[] {
  return Object.values(ROLES).filter(role => role.category === category)
}

export function getBureauRoles(): RoleDefinition[] {
  return getRolesByCategory('bureau')
}

export function getTerrainRoles(): RoleDefinition[] {
  return getRolesByCategory('terrain')
}

export function isBureauRole(role: string): boolean {
  return getRoleCategory(role) === 'bureau'
}

export function isTerrainRole(role: string): boolean {
  return getRoleCategory(role) === 'terrain'
}

// Candidate to consultant transition helpers
export function canTransitionToConsultant(candidateStatus: string): boolean {
  return candidateStatus === 'embauche'
}

export function getConsultantRoleForContract(contractType: 'cdi' | 'freelance'): TerrainRole {
  return contractType === 'cdi' ? 'consultant_cdi' : 'freelance'
}
