'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Building2,
  Users,
  UserCheck,
  Briefcase,
  Search,
  UserCog,
  Zap,
  UserPlus,
  Check,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import {
  ROLES,
  ROLE_CATEGORIES,
  ROLE_PERMISSIONS,
  RoleType,
  RoleCategory,
  RolePermissions,
  getRolesByCategory
} from '@/lib/roles'

// Permission groups for display
const PERMISSION_GROUPS = [
  {
    id: 'dashboards',
    label: 'Tableaux de bord',
    permissions: ['dashboard', 'sourceurDashboard', 'commercialDashboard', 'rhDashboard']
  },
  {
    id: 'recruitment',
    label: 'Recrutement',
    permissions: ['recruitment', 'candidates', 'consultants']
  },
  {
    id: 'admin',
    label: 'Administration',
    permissions: ['users', 'roles', 'database', 'settings', 'jobs', 'messages']
  },
  {
    id: 'integration',
    label: 'Intégrations',
    permissions: ['webhooks', 'apiTokens', 'boondManager', 'boondManagerAdmin', 'scraper', 'demoData', 'docs']
  },
  {
    id: 'portal',
    label: 'Portail Consultant',
    permissions: ['freelancePortal', 'consultantPortal']
  },
  {
    id: 'data_access',
    label: 'Accès aux données',
    permissions: ['viewAllData', 'viewAssignedOnly', 'canAssignJobs', 'canAssignConsultants', 'canManageContracts']
  }
]

// Permission labels in French
const PERMISSION_LABELS: Record<keyof RolePermissions, string> = {
  dashboard: 'Dashboard général',
  sourceurDashboard: 'Dashboard Sourceur',
  commercialDashboard: 'Dashboard Commercial',
  rhDashboard: 'Dashboard RH',
  recruitment: 'Module Recrutement',
  jobs: 'Gestion des offres',
  consultants: 'Gestion des consultants',
  candidates: 'Gestion des candidats',
  candidateStates: 'États candidats (Kanban)',
  messages: 'Messagerie',
  users: 'Gestion des utilisateurs',
  roles: 'Gestion des rôles',
  database: 'Base de données MongoDB',
  webhooks: 'Configuration Webhooks',
  apiTokens: 'Tokens API',
  demoData: 'Données de démo',
  docs: 'Documentation',
  settings: 'Paramètres',
  freelancePortal: 'Portail Freelance',
  consultantPortal: 'Portail Consultant/Freelance',
  scraper: 'Scraper CV',
  boondManager: 'BoondManager',
  boondManagerAdmin: 'BoondManager Admin (Prod/Sandbox)',
  canAssignJobs: 'Assigner des offres',
  canAssignConsultants: 'Assigner des consultants',
  canManageContracts: 'Gérer les contrats',
  viewAllData: 'Voir toutes les données',
  viewAssignedOnly: 'Voir données assignées'
}

// Role icons mapping
const ROLE_ICONS: Record<RoleType, React.ReactNode> = {
  admin: <Shield className="w-5 h-5" />,
  commercial: <Briefcase className="w-5 h-5" />,
  sourceur: <Search className="w-5 h-5" />,
  rh: <UserCog className="w-5 h-5" />,
  consultant_cdi: <UserCheck className="w-5 h-5" />,
  freelance: <Zap className="w-5 h-5" />,
  candidat: <UserPlus className="w-5 h-5" />
}

export default function RolesPage() {
  const [expandedRole, setExpandedRole] = useState<RoleType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory | 'all'>('all')

  const bureauRoles = getRolesByCategory('bureau')
  const terrainRoles = getRolesByCategory('terrain')

  const filteredRoles = selectedCategory === 'all'
    ? Object.values(ROLES)
    : getRolesByCategory(selectedCategory)

  const toggleRole = (roleId: RoleType) => {
    setExpandedRole(expandedRole === roleId ? null : roleId)
  }

  const getPermissionCount = (roleId: RoleType) => {
    const perms = ROLE_PERMISSIONS[roleId]
    return Object.values(perms).filter(v => v === true).length
  }

  const renderPermissionBadge = (value: boolean) => {
    return value ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
        <Check className="w-3 h-3" />
        Oui
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
        <X className="w-3 h-3" />
        Non
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Rôles & Permissions</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configuration des rôles du système</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium text-gray-900 dark:text-white mb-1">Système de rôles à deux niveaux</p>
          <p>
            <strong className="text-blue-600 dark:text-blue-400">Bureau</strong>: Équipe interne (Admin, Commercial, Sourceur, RH) |
            <strong className="text-green-600 dark:text-green-400 ml-2">Terrain</strong>: Consultants et candidats (CDI, Freelance, Candidat)
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          Tous ({Object.keys(ROLES).length})
        </button>
        <button
          onClick={() => setSelectedCategory('bureau')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
            selectedCategory === 'bureau'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Bureau ({bureauRoles.length})
        </button>
        <button
          onClick={() => setSelectedCategory('terrain')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
            selectedCategory === 'terrain'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          Terrain ({terrainRoles.length})
        </button>
      </div>

      {/* Category Sections */}
      {selectedCategory === 'all' ? (
        <div className="space-y-8">
          {/* Bureau Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bureau</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">- {ROLE_CATEGORIES.bureau.description}</span>
            </div>
            <div className="space-y-3">
              {bureauRoles.map(role => renderRoleCard(role.id as RoleType, expandedRole, toggleRole, getPermissionCount, renderPermissionBadge))}
            </div>
          </div>

          {/* Terrain Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Terrain</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">- {ROLE_CATEGORIES.terrain.description}</span>
            </div>
            <div className="space-y-3">
              {terrainRoles.map(role => renderRoleCard(role.id as RoleType, expandedRole, toggleRole, getPermissionCount, renderPermissionBadge))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRoles.map(role => renderRoleCard(role.id as RoleType, expandedRole, toggleRole, getPermissionCount, renderPermissionBadge))}
        </div>
      )}
    </div>
  )
}

function renderRoleCard(
  roleId: RoleType,
  expandedRole: RoleType | null,
  toggleRole: (id: RoleType) => void,
  getPermissionCount: (id: RoleType) => number,
  renderPermissionBadge: (value: boolean) => React.ReactNode
) {
  const role = ROLES[roleId]
  const perms = ROLE_PERMISSIONS[roleId]
  const isExpanded = expandedRole === roleId

  const ROLE_ICONS: Record<RoleType, React.ReactNode> = {
    admin: <Shield className="w-5 h-5" />,
    commercial: <Briefcase className="w-5 h-5" />,
    sourceur: <Search className="w-5 h-5" />,
    rh: <UserCog className="w-5 h-5" />,
    consultant_cdi: <UserCheck className="w-5 h-5" />,
    freelance: <Zap className="w-5 h-5" />,
    candidat: <UserPlus className="w-5 h-5" />
  }

  return (
    <motion.div
      key={roleId}
      className="glass-card overflow-hidden"
      initial={false}
      animate={{ height: 'auto' }}
    >
      {/* Role Header */}
      <button
        onClick={() => toggleRole(roleId)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-r ${role.color} rounded-xl text-white`}>
            {ROLE_ICONS[roleId]}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">{role.label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
            {getPermissionCount(roleId)} permissions
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Permissions Detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 dark:border-slate-700"
          >
            <div className="p-4 space-y-4">
              {PERMISSION_GROUPS.map(group => {
                const groupPerms = group.permissions.filter(p => p in perms)
                if (groupPerms.length === 0) return null

                const hasAnyEnabled = groupPerms.some(p => perms[p as keyof RolePermissions])

                return (
                  <div key={group.id} className={`rounded-lg p-3 ${hasAnyEnabled ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {groupPerms.map(permKey => (
                        <div key={permKey} className="flex items-center justify-between py-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {PERMISSION_LABELS[permKey as keyof RolePermissions] || permKey}
                          </span>
                          {renderPermissionBadge(perms[permKey as keyof RolePermissions])}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
