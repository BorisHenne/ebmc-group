// Role-based access control configuration

export type RoleType = 'admin' | 'sourceur' | 'commercial' | 'freelance' | 'user'

export interface RolePermissions {
  // Dashboard access
  dashboard: boolean
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
  // Data access
  canAssignJobs: boolean
  canAssignConsultants: boolean
  viewAllData: boolean
  viewAssignedOnly: boolean
}

export const ROLE_PERMISSIONS: Record<RoleType, RolePermissions> = {
  admin: {
    dashboard: true,
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
    canAssignJobs: true,
    canAssignConsultants: true,
    viewAllData: true,
    viewAssignedOnly: false,
  },
  sourceur: {
    dashboard: true,
    jobs: false,
    consultants: true, // Access to candidates/consultants
    messages: true, // Access to leads/messages
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: true,
    settings: false,
    freelancePortal: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    viewAllData: true,
    viewAssignedOnly: false,
  },
  commercial: {
    dashboard: true,
    jobs: true, // Access to assigned jobs
    consultants: true, // Access to assigned consultants
    messages: false,
    users: false,
    roles: false,
    webhooks: false,
    apiTokens: false,
    demoData: false,
    docs: true,
    settings: false,
    freelancePortal: false,
    canAssignJobs: false,
    canAssignConsultants: false,
    viewAllData: false,
    viewAssignedOnly: true, // Only see assigned data
  },
  freelance: {
    dashboard: false,
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
    freelancePortal: true, // Only access to freelance portal
    canAssignJobs: false,
    canAssignConsultants: false,
    viewAllData: false,
    viewAssignedOnly: false,
  },
  user: {
    dashboard: true,
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
