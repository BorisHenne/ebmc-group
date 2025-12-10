'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  X,
  MapPin,
  Save,
  Search,
  Briefcase,
  AlertCircle,
  Euro,
  Calendar,
  Globe2,
  Award,
  Home,
  User,
  Mail,
  Phone,
  FileText,
  Shield,
  ChevronRight,
  Building2,
  BadgeCheck,
  Clock,
  Filter
} from 'lucide-react'
import { ROLES, ROLE_COLORS, ROLE_LABELS, isTerrainRole, TerrainRole } from '@/lib/roles'
import {
  Candidate,
  generateDemoCandidates,
  getFullName,
  getInitials,
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  ContractType
} from '@/types/candidate'

interface User {
  _id: string
  email: string
  name: string
  role: TerrainRole
  active: boolean
  createdAt: string
  updatedAt?: string
  isDemo?: boolean
}

// Extended resource type combining user and linked candidate data
interface Resource extends User {
  linkedCandidate?: Candidate
}

type FilterRole = 'all' | 'consultant_cdi' | 'freelance'

export default function RessourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<FilterRole>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users', { credentials: 'include' })
      let users: User[] = []
      if (usersRes.ok) {
        const data = await usersRes.json()
        users = (data.users || []).filter((u: User) =>
          u.role === 'consultant_cdi' || u.role === 'freelance'
        )
      }

      // Generate demo candidates to link with users
      const demoCandidates = generateDemoCandidates(30, 42)
      const hiredCandidates = demoCandidates.filter(c => c.status === 'embauche')
      setCandidates(hiredCandidates)

      // Combine users with any linked candidate data
      const resourcesWithLinks: Resource[] = users.map(user => {
        // Try to find a linked candidate by userId or email match
        const linkedCandidate = hiredCandidates.find(c =>
          c.userId === user._id || c.email === user.email
        )
        return { ...user, linkedCandidate }
      })

      setResources(resourcesWithLinks)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (resource: Resource) => {
    setEditingResource({ ...resource })
    setError('')
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingResource({
      name: '',
      email: '',
      role: 'consultant_cdi',
      active: true
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingResource(null)
    setError('')
  }

  const handleSave = async () => {
    if (!editingResource) return
    if (!editingResource.name || !editingResource.email) {
      setError('Nom et email requis')
      return
    }

    setSaving(true)
    setError('')

    try {
      const isNew = !editingResource._id
      const url = isNew ? '/api/admin/users' : `/api/admin/users/${editingResource._id}`
      const method = isNew ? 'POST' : 'PUT'

      const body: Record<string, unknown> = {
        name: editingResource.name,
        email: editingResource.email,
        role: editingResource.role,
        active: editingResource.active
      }

      // For new users, require a password
      if (isNew) {
        body.password = 'temp123' // Default password, user should change it
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la sauvegarde')
        return
      }

      await fetchData()
      closeModal()
    } catch (error) {
      console.error('Error saving:', error)
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${resource.name} ?`)) return

    try {
      const res = await fetch(`/api/admin/users/${resource._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      resource.name.toLowerCase().includes(searchLower) ||
      resource.email.toLowerCase().includes(searchLower) ||
      resource.linkedCandidate?.title?.toLowerCase().includes(searchLower)

    const matchesRole = filterRole === 'all' || resource.role === filterRole
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && resource.active) ||
      (filterStatus === 'inactive' && !resource.active)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Stats
  const cdiCount = resources.filter(r => r.role === 'consultant_cdi').length
  const freelanceCount = resources.filter(r => r.role === 'freelance').length
  const activeCount = resources.filter(r => r.active).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Ressources</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {resources.length} ressource{resources.length > 1 ? 's' : ''} terrain
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/recrutement"
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition font-medium"
          >
            <Users className="w-5 h-5" />
            Recrutement
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition shadow-lg shadow-green-500/20 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouvelle ressource
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{cdiCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">CDI</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-l-4 border-purple-500"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{freelanceCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Freelance</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-l-4 border-emerald-500"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Actifs</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border-0 rounded-xl focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as FilterRole)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border-0 rounded-xl focus:ring-2 focus:ring-green-500/20"
          >
            <option value="all">Tous les types</option>
            <option value="consultant_cdi">Consultant CDI</option>
            <option value="freelance">Freelance</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border-0 rounded-xl focus:ring-2 focus:ring-green-500/20"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucune ressource trouvée</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-green-600 hover:underline text-sm"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ressource</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Poste</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredResources.map((resource, index) => (
                  <motion.tr
                    key={resource._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => openEditModal(resource)}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                          resource.role === 'consultant_cdi'
                            ? 'from-blue-500 to-cyan-500'
                            : 'from-purple-500 to-pink-500'
                        } flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {resource.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white block">{resource.name}</span>
                          {resource.isDemo && (
                            <span className="text-xs text-amber-600 dark:text-amber-400">Démo</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {resource.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        resource.role === 'consultant_cdi'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      }`}>
                        {resource.role === 'consultant_cdi' ? (
                          <><BadgeCheck className="w-3 h-3" /> CDI</>
                        ) : (
                          <><Briefcase className="w-3 h-3" /> Freelance</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {resource.linkedCandidate?.title ? (
                        <span className="text-gray-700 dark:text-gray-300">
                          {resource.linkedCandidate.title}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">Non renseigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        resource.active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {resource.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(resource); }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {showModal && editingResource && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${
                    editingResource.role === 'consultant_cdi'
                      ? 'from-blue-500 to-cyan-500'
                      : 'from-purple-500 to-pink-500'
                  }`}>
                    {editingResource._id ? <User className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingResource._id ? 'Modifier la ressource' : 'Nouvelle ressource'}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={editingResource.name || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border-0 rounded-xl focus:ring-2 focus:ring-green-500/20"
                    placeholder="Prénom Nom"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editingResource.email || ''}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border-0 rounded-xl focus:ring-2 focus:ring-green-500/20"
                    placeholder="email@exemple.com"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de contrat
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingResource(prev => prev ? { ...prev, role: 'consultant_cdi' } : null)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition ${
                        editingResource.role === 'consultant_cdi'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-slate-600 hover:border-blue-300'
                      }`}
                    >
                      <BadgeCheck className="w-5 h-5" />
                      CDI
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingResource(prev => prev ? { ...prev, role: 'freelance' } : null)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition ${
                        editingResource.role === 'freelance'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-200 dark:border-slate-600 hover:border-purple-300'
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                      Freelance
                    </button>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={editingResource.active !== false}
                    onChange={(e) => setEditingResource(prev => prev ? { ...prev, active: e.target.checked } : null)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
                    Ressource active
                  </label>
                </div>

                {/* Info for new users */}
                {!editingResource._id && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm">
                    <p>Un mot de passe temporaire sera généré. L&apos;utilisateur devra le changer à la première connexion.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingResource._id ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
