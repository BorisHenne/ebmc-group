'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  MapPin,
  Save,
  Search,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  RotateCcw,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText
} from 'lucide-react'

interface Candidate {
  _id: string
  firstName: string
  lastName: string
  name?: string
  email: string
  phone?: string
  position?: string
  location?: string
  status: string
  source?: string
  skills?: string[]
  experience?: string
  notes?: string
  cvUrl?: string
  createdAt: string
  updatedAt?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const emptyCandidate: Omit<Candidate, '_id' | 'createdAt'> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  location: '',
  status: 'new',
  source: 'website',
  skills: [],
  experience: '',
  notes: ''
}

const STATUS_COLORS: Record<string, string> = {
  new: 'from-blue-500 to-indigo-500',
  contacted: 'from-purple-500 to-violet-500',
  interview: 'from-amber-500 to-orange-500',
  offer: 'from-cyan-500 to-teal-500',
  hired: 'from-green-500 to-emerald-500',
  rejected: 'from-red-500 to-rose-500',
  withdrawn: 'from-slate-500 to-gray-500'
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacte',
  interview: 'Entretien',
  offer: 'Offre',
  hired: 'Embauche',
  rejected: 'Refuse',
  withdrawn: 'Retire'
}

const SOURCE_LABELS: Record<string, string> = {
  website: 'Site web',
  linkedin: 'LinkedIn',
  referral: 'Cooptation',
  jobboard: 'Jobboard',
  direct: 'Candidature directe',
  other: 'Autre'
}

const ITEMS_PER_PAGE = 50

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default function CandidatsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Partial<Candidate> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Pagination
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Search and filters (server-side)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Debounced search term (300ms delay)
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Ref to track if data has loaded (for timeout)
  const loadedRef = useRef(false)
  const initialLoadRef = useRef(true)

  // Fetch candidates with filters
  const fetchCandidates = useCallback(async (page: number = 1) => {
    try {
      setError('')
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString()
      })

      if (debouncedSearch) params.set('search', debouncedSearch)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterSource !== 'all') params.set('source', filterSource)

      const res = await fetch(`/api/admin/candidates?${params}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCandidates(data.candidates || [])

        // Update pagination state
        if (data.pagination) {
          setPagination(data.pagination)
          setCurrentPage(data.pagination.page)
        }
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Erreur lors du chargement des candidats')
      }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
      loadedRef.current = true
    }
  }, [debouncedSearch, filterStatus, filterSource])

  // Initial load
  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!loadedRef.current) {
        setLoading(false)
        setError('Le chargement prend trop de temps. Verifiez la connexion au serveur.')
      }
    }, 30000)

    return () => clearTimeout(timeout)
  }, [])

  // Fetch when filters change (reset to page 1)
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false
      fetchCandidates(1)
    } else {
      setCurrentPage(1)
      fetchCandidates(1)
    }
  }, [debouncedSearch, filterStatus, filterSource, fetchCandidates])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
      fetchCandidates(page)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterSource('all')
  }

  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterSource !== 'all'

  const openCreateModal = () => {
    setEditingCandidate(emptyCandidate)
    setError('')
    setShowModal(true)
  }

  const openEditModal = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCandidate(null)
    setError('')
  }

  const handleSave = async () => {
    if (!editingCandidate) return
    setSaving(true)
    setError('')

    try {
      const method = editingCandidate._id ? 'PUT' : 'POST'
      const url = editingCandidate._id
        ? `/api/admin/candidates/${editingCandidate._id}`
        : '/api/admin/candidates'

      // Build full name from firstName and lastName
      const dataToSave = {
        ...editingCandidate,
        name: `${editingCandidate.firstName || ''} ${editingCandidate.lastName || ''}`.trim()
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSave)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setSaving(false)
        return
      }

      closeModal()
      fetchCandidates(currentPage)
    } catch (error) {
      console.error('Error saving candidate:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (candidate: Candidate) => {
    const displayName = candidate.name || `${candidate.firstName} ${candidate.lastName}`.trim() || candidate.email
    if (!confirm(`Etes-vous sur de vouloir supprimer "${displayName}" ?`)) return

    try {
      const res = await fetch(`/api/admin/candidates/${candidate._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la suppression')
        return
      }

      fetchCandidates(currentPage)
    } catch (error) {
      console.error('Error deleting candidate:', error)
      alert('Erreur de connexion au serveur')
    }
  }

  const updateField = (field: string, value: string | boolean | string[]) => {
    setEditingCandidate(prev => prev ? { ...prev, [field]: value } : null)
  }

  const getStatusBadgeClass = (status: string) => {
    const colors = STATUS_COLORS[status] || 'from-slate-500 to-slate-600'
    return `bg-gradient-to-r ${colors} text-white`
  }

  const getDisplayName = (candidate: Candidate) => {
    if (candidate.name) return candidate.name
    return `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Sans nom'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Candidats</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{pagination.total} candidat{pagination.total > 1 ? 's' : ''} au total</p>
            </div>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouveau candidat
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${
                filterStatus !== 'all' ? 'border-ebmc-turquoise' : 'border-gray-200 dark:border-slate-700'
              }`}
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className={`px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${
                filterSource !== 'all' ? 'border-ebmc-turquoise' : 'border-gray-200 dark:border-slate-700'
              }`}
            >
              <option value="all">Toutes les sources</option>
              {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Filter className="w-4 h-4" />
                <span>{pagination.total} resultat{pagination.total > 1 ? 's' : ''} trouve{pagination.total > 1 ? 's' : ''}</span>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-ebmc-turquoise" />}
              </div>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-ebmc-turquoise transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reinitialiser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && !showModal && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => { setError(''); fetchCandidates(currentPage); }}
            className="ml-auto px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition"
          >
            Reessayer
          </button>
        </div>
      )}

      {/* Candidates Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? 'Aucun candidat ne correspond aux criteres'
                : 'Aucun candidat'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 text-ebmc-turquoise hover:underline"
              >
                <RotateCcw className="w-4 h-4" />
                Reinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidat</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Poste</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {candidates.map((candidate, index) => (
                  <motion.tr
                    key={candidate._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => openEditModal(candidate)}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${STATUS_COLORS[candidate.status] || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {(candidate.firstName?.charAt(0) || candidate.name?.charAt(0) || '?').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white block">{getDisplayName(candidate)}</span>
                          {candidate.location && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {candidate.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          {candidate.email || '-'}
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            {candidate.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {candidate.position || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(candidate.status)}`}>
                        {STATUS_LABELS[candidate.status] || candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {SOURCE_LABELS[candidate.source || ''] || candidate.source || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(candidate); }}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-ebmc-turquoise" />}
            <span>
              Page {currentPage} sur {pagination.totalPages} ({pagination.total} candidats)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Premiere page"
            >
              <ChevronsLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Page precedente"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-1">
              {/* Generate page numbers */}
              {(() => {
                const pages: (number | string)[] = []
                const current = currentPage
                const total = pagination.totalPages

                if (total <= 7) {
                  for (let i = 1; i <= total; i++) pages.push(i)
                } else {
                  pages.push(1)
                  if (current > 3) pages.push('...')
                  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                    pages.push(i)
                  }
                  if (current < total - 2) pages.push('...')
                  pages.push(total)
                }

                return pages.map((p, idx) => (
                  typeof p === 'number' ? (
                    <button
                      key={idx}
                      onClick={() => goToPage(p)}
                      disabled={loading}
                      className={`min-w-[40px] h-10 rounded-lg font-medium transition ${
                        p === current
                          ? 'bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white'
                          : 'border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 disabled:opacity-50'
                      }`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={idx} className="px-2 text-gray-400">...</span>
                  )
                ))
              })()}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || loading}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Page suivante"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => goToPage(pagination.totalPages)}
              disabled={currentPage === pagination.totalPages || loading}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Derniere page"
            >
              <ChevronsRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && editingCandidate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${editingCandidate._id ? 'from-blue-500 to-indigo-500' : 'from-ebmc-turquoise to-cyan-500'}`}>
                    {editingCandidate._id ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingCandidate._id ? 'Modifier le candidat' : 'Nouveau candidat'}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Name */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prenom</label>
                    <input
                      type="text"
                      value={editingCandidate.firstName || ''}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                    <input
                      type="text"
                      value={editingCandidate.lastName || ''}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />Email
                    </label>
                    <input
                      type="email"
                      value={editingCandidate.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="jean.dupont@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />Telephone
                    </label>
                    <input
                      type="tel"
                      value={editingCandidate.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                {/* Position and Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />Poste recherche
                    </label>
                    <input
                      type="text"
                      value={editingCandidate.position || ''}
                      onChange={(e) => updateField('position', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Consultant SAP FI/CO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />Localisation
                    </label>
                    <input
                      type="text"
                      value={editingCandidate.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Paris, France"
                    />
                  </div>
                </div>

                {/* Status and Source */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
                    <select
                      value={editingCandidate.status || 'new'}
                      onChange={(e) => updateField('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                    <select
                      value={editingCandidate.source || 'website'}
                      onChange={(e) => updateField('source', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />Experience
                  </label>
                  <input
                    type="text"
                    value={editingCandidate.experience || ''}
                    onChange={(e) => updateField('experience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="5 ans"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Competences (separees par virgule)
                  </label>
                  <input
                    type="text"
                    value={(editingCandidate.skills || []).join(', ')}
                    onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="SAP FI, SAP CO, S/4HANA"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />Notes
                  </label>
                  <textarea
                    value={editingCandidate.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Notes sur le candidat..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition disabled:opacity-50 font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {editingCandidate._id ? 'Mise a jour...' : 'Creation...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingCandidate._id ? 'Mettre a jour' : 'Creer'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
