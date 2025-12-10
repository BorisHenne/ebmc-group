'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
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
  Briefcase,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Calendar,
  Globe,
  Award,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react'

interface Consultant {
  _id: string
  boondManagerId?: number
  name: string
  title?: string
  titleEn?: string
  location?: string
  experience?: string
  experienceEn?: string
  category?: string
  available?: boolean
  published?: boolean
  skills?: string[]
  certifications?: string[]
  email?: string
  phone?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

const emptyConsultant: Omit<Consultant, '_id' | 'createdAt'> = {
  name: '',
  title: '',
  titleEn: '',
  location: '',
  experience: '',
  experienceEn: '',
  category: 'tech',
  available: true,
  published: false,
  skills: [],
  certifications: [],
  email: '',
  phone: '',
  notes: ''
}

const CATEGORY_COLORS: Record<string, string> = {
  tech: 'from-blue-500 to-indigo-500',
  consulting: 'from-purple-500 to-violet-500',
  management: 'from-amber-500 to-orange-500',
  sap: 'from-cyan-500 to-blue-500'
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: 'Tech',
  consulting: 'Consulting',
  management: 'Management',
  sap: 'SAP'
}

export default function RessourcesPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingConsultant, setEditingConsultant] = useState<Partial<Consultant> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterAvailability, setFilterAvailability] = useState<string>('all')
  const [filterPublished, setFilterPublished] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  // Expanded rows for mobile
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/consultants', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setConsultants(data.consultants || [])
      }
    } catch (error) {
      console.error('Error fetching consultants:', error)
      setError('Erreur lors du chargement des ressources')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingConsultant({ ...emptyConsultant })
    setError('')
    setShowModal(true)
  }

  const openEditModal = (consultant: Consultant) => {
    setEditingConsultant({ ...consultant })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingConsultant(null)
    setError('')
  }

  const handleSave = async () => {
    if (!editingConsultant) return
    setSaving(true)
    setError('')

    try {
      const method = editingConsultant._id ? 'PUT' : 'POST'
      const url = editingConsultant._id
        ? `/api/admin/consultants/${editingConsultant._id}`
        : '/api/admin/consultants'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingConsultant)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setSaving(false)
        return
      }

      closeModal()
      fetchConsultants()
    } catch (error) {
      console.error('Error saving consultant:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (consultant: Consultant) => {
    if (!confirm(`Etes-vous sur de vouloir supprimer "${consultant.name}" ?`)) return

    try {
      const res = await fetch(`/api/admin/consultants/${consultant._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la suppression')
        return
      }

      fetchConsultants()
    } catch (error) {
      console.error('Error deleting consultant:', error)
      alert('Erreur de connexion au serveur')
    }
  }

  const togglePublished = async (consultant: Consultant) => {
    try {
      const res = await fetch(`/api/admin/consultants/${consultant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...consultant, published: !consultant.published })
      })

      if (res.ok) {
        fetchConsultants()
      }
    } catch (error) {
      console.error('Error toggling published:', error)
    }
  }

  const updateField = (field: string, value: string | boolean | string[]) => {
    setEditingConsultant(prev => prev ? { ...prev, [field]: value } : null)
  }

  // Filter consultants
  const filteredConsultants = useMemo(() => {
    return consultants.filter(consultant => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        consultant.name?.toLowerCase().includes(searchLower) ||
        consultant.title?.toLowerCase().includes(searchLower) ||
        consultant.location?.toLowerCase().includes(searchLower) ||
        consultant.skills?.some(s => s.toLowerCase().includes(searchLower)) ||
        consultant.email?.toLowerCase().includes(searchLower)

      const matchesCategory = filterCategory === 'all' || consultant.category === filterCategory
      const matchesAvailability = filterAvailability === 'all' ||
        (filterAvailability === 'available' && consultant.available) ||
        (filterAvailability === 'unavailable' && !consultant.available)
      const matchesPublished = filterPublished === 'all' ||
        (filterPublished === 'published' && consultant.published) ||
        (filterPublished === 'unpublished' && !consultant.published)

      return matchesSearch && matchesCategory && matchesAvailability && matchesPublished
    })
  }, [consultants, searchTerm, filterCategory, filterAvailability, filterPublished])

  // Paginated consultants
  const paginatedConsultants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredConsultants.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredConsultants, currentPage])

  const totalPages = Math.ceil(filteredConsultants.length / itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory, filterAvailability, filterPublished])

  const getCategoryBadgeClass = (category?: string) => {
    const colors = CATEGORY_COLORS[category || ''] || 'from-slate-500 to-slate-600'
    return `bg-gradient-to-r ${colors} text-white`
  }

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Stats
  const stats = useMemo(() => ({
    total: consultants.length,
    published: consultants.filter(c => c.published).length,
    available: consultants.filter(c => c.available).length
  }), [consultants])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Ressources</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {stats.total} ressource{stats.total > 1 ? 's' : ''} • {stats.published} publiee{stats.published > 1 ? 's' : ''} • {stats.available} disponible{stats.available > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouvelle ressource
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par nom, titre, competences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition ${
                showFilters || filterCategory !== 'all' || filterAvailability !== 'all' || filterPublished !== 'all'
                  ? 'border-ebmc-turquoise bg-ebmc-turquoise/10 text-ebmc-turquoise'
                  : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtres
              {(filterCategory !== 'all' || filterAvailability !== 'all' || filterPublished !== 'all') && (
                <span className="px-2 py-0.5 bg-ebmc-turquoise text-white text-xs rounded-full">
                  {[filterCategory !== 'all', filterAvailability !== 'all', filterPublished !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Advanced filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categorie</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">Toutes categories</option>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Disponibilite</label>
                    <select
                      value={filterAvailability}
                      onChange={(e) => setFilterAvailability(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">Tous statuts</option>
                      <option value="available">Disponibles</option>
                      <option value="unavailable">En mission</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Publication</label>
                    <select
                      value={filterPublished}
                      onChange={(e) => setFilterPublished(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">Toutes</option>
                      <option value="published">Publiees</option>
                      <option value="unpublished">Non publiees</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Consultants Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterCategory !== 'all' || filterAvailability !== 'all' || filterPublished !== 'all'
                ? 'Aucune ressource ne correspond aux criteres'
                : 'Aucune ressource'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ressource</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Localisation</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Competences</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Disponibilite</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Publie</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {paginatedConsultants.map((consultant, index) => (
                    <motion.tr
                      key={consultant._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => openEditModal(consultant)}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[consultant.category || ''] || 'from-slate-500 to-slate-600'} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-bold text-sm">
                              {consultant.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-900 dark:text-white block truncate">{consultant.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate block">{consultant.title || '-'}</span>
                            {consultant.boondManagerId && (
                              <span className="text-xs text-purple-500 dark:text-purple-400">
                                BM #{consultant.boondManagerId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <span className="truncate">{consultant.location || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {consultant.skills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded truncate max-w-[100px]">
                              {skill}
                            </span>
                          ))}
                          {(consultant.skills?.length || 0) > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500">+{consultant.skills!.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          consultant.available
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        }`}>
                          {consultant.available ? 'Disponible' : 'En mission'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePublished(consultant); }}
                          className={`p-2 rounded-lg transition ${
                            consultant.published
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                          title={consultant.published ? 'Publie - Cliquer pour depublier' : 'Non publie - Cliquer pour publier'}
                        >
                          {consultant.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(consultant); }}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Affichage {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredConsultants.length)} sur {filteredConsultants.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    Precedent
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && editingConsultant && (
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
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${editingConsultant._id ? 'from-blue-500 to-indigo-500' : 'from-ebmc-turquoise to-cyan-500'}`}>
                    {editingConsultant._id ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingConsultant._id ? 'Modifier la ressource' : 'Nouvelle ressource'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={editingConsultant.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Jean Dupont"
                  />
                </div>

                {/* Titles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre (FR)</label>
                    <input
                      type="text"
                      value={editingConsultant.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Consultant SAP FI/CO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (EN)</label>
                    <input
                      type="text"
                      value={editingConsultant.titleEn || ''}
                      onChange={(e) => updateField('titleEn', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="SAP FI/CO Consultant"
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
                      value={editingConsultant.email || ''}
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
                      value={editingConsultant.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                {/* Location, Category */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />Localisation
                    </label>
                    <input
                      type="text"
                      value={editingConsultant.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Paris, France"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categorie</label>
                    <select
                      value={editingConsultant.category || 'tech'}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (FR)</label>
                    <input
                      type="text"
                      value={editingConsultant.experience || ''}
                      onChange={(e) => updateField('experience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="5+ ans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (EN)</label>
                    <input
                      type="text"
                      value={editingConsultant.experienceEn || ''}
                      onChange={(e) => updateField('experienceEn', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="5+ years"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />Competences (separees par virgule)
                  </label>
                  <input
                    type="text"
                    value={(editingConsultant.skills || []).join(', ')}
                    onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="SAP FI, SAP CO, S/4HANA, ABAP"
                  />
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />Certifications (separees par virgule)
                  </label>
                  <input
                    type="text"
                    value={(editingConsultant.certifications || []).join(', ')}
                    onChange={(e) => updateField('certifications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="SAP Certified, PMP"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />Notes internes
                  </label>
                  <textarea
                    value={editingConsultant.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Notes internes..."
                  />
                </div>

                {/* Status toggles */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl flex-1">
                    <input
                      type="checkbox"
                      id="available"
                      checked={editingConsultant.available !== false}
                      onChange={(e) => updateField('available', e.target.checked)}
                      className="w-5 h-5 text-ebmc-turquoise rounded border-gray-300 focus:ring-ebmc-turquoise"
                    />
                    <label htmlFor="available" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Disponible
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl flex-1">
                    <input
                      type="checkbox"
                      id="published"
                      checked={editingConsultant.published === true}
                      onChange={(e) => updateField('published', e.target.checked)}
                      className="w-5 h-5 text-ebmc-turquoise rounded border-gray-300 focus:ring-ebmc-turquoise"
                    />
                    <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Publie sur le site
                    </label>
                  </div>
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
                      {editingConsultant._id ? 'Mise a jour...' : 'Creation...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingConsultant._id ? 'Mettre a jour' : 'Creer'}
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
