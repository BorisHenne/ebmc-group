// Role-based access control configuration

export type RoleType = 'admin' | 'sourceur' | 'commercial' | 'freelance' | 'user'

export interface RolePermissions {
  // Dashboard access
  dashboard: boolean
  // Role-specific dashboards
  sourceurDashboard: boolean
  commercialDashboard: boolean
  // Admin modules
  jobs: boolean
  consultants: boolean
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
  // Data access
  canAssignJobs: boolean
  canAssignConsultants: boolean
  viewAllData: boolean
  viewAssignedOnly: boolean
}

export const ROLE_PERMISSIONS: Record<RoleType, RolePermissions> = {
  admin: {
    dashboard: true,
    sourceurDashboard: true,
    commercialDashboard: true,
    jobs: true,
    consultants: true,
    messages: true,
    users: true,
    roles: true,
    webhooks: true,
    apiTokens: true,
    demoData: true,
    docs: true,
    settings: true,
    freelancePortal: false,
    scraper: true,
    canAssignJobs: true,
    canAssignConsultants: true,
    viewAllData: true,
    viewAssignedOnly: false,
  },
  sourceur: {
    dashboard: false, // Sourceur uses their specific dashboard
    sourceurDashboard: true,
    commercialDashboard: false,
    jobs: true, // Access to job offers management
    consultants: true,
    messages: true,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: true,
    settings: false,
    freelancePortal: false,
    scraper: true,
    canAssignJobs: false,
    canAssignConsultants: false,
    viewAllData: false,
    viewAssignedOnly: true,
  },
  commercial: {
    dashboard: false, // Commercial uses their specific dashboard
    sourceurDashboard: false,
    commercialDashboard: true,
    jobs: true,
    consultants: true,
    messages: false,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: true,
    settings: false,
    freelancePortal: false,
    scraper: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    viewAllData: false,
    viewAssignedOnly: true,
  },
  freelance: {
    dashboard: false,
    sourceurDashboard: false,
    commercialDashboard: false,
    jobs: false,
    consultants: false,
    messages: false,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: false,
    settings: false,
    freelancePortal: true,
    scraper: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    viewAllData: false,
    viewAssignedOnly: false,
  },
  user: {
    dashboard: true,
    sourceurDashboard: false,
    commercialDashboard: false,
    jobs: true,
    consultants: true,
    messages: true,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: true,
    settings: false,
    freelancePortal: false,
    scraper: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    viewAllData: true,
    viewAssignedOnly: false,
  },
}

export const ROLE_LABELS: Record<RoleType, string> = {
  admin: 'Administrateur',
  sourceur: 'Sourceur',
  commercial: 'Commercial',
  freelance: 'Freelance',
  user: 'Utilisateur',
}

export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  admin: 'Accès complet à toutes les fonctionnalités',
  sourceur: 'Accès aux consultants/candidats et aux leads',
  commercial: 'Accès aux offres et consultants qui lui sont assignés',
  freelance: 'Accès au portail freelance (timesheets et absences)',
  user: 'Accès lecture aux données principales',
}

export const ROLE_COLORS: Record<RoleType, string> = {
  admin: 'from-red-500 to-rose-500',
  sourceur: 'from-purple-500 to-pink-500',
  commercial: 'from-blue-500 to-indigo-500',
  freelance: 'from-green-500 to-emerald-500',
  user: 'from-slate-500 to-slate-600',
}

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
