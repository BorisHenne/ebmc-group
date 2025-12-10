'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  MapPin,
  Clock,
  Save,
  UserCheck,
  Search,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface User {
  _id: string
  email: string
  name: string
  role: string
}

interface Job {
  _id: string
  title: string
  titleEn: string
  location: string
  type: string
  typeEn: string
  category: string
  experience: string
  experienceEn: string
  description: string
  descriptionEn: string
  missions: string[]
  missionsEn: string[]
  requirements: string[]
  requirementsEn: string[]
  active: boolean
  assignedTo?: string
  assignedToName?: string
  createdAt: string
}

const emptyJob: Omit<Job, '_id' | 'createdAt'> = {
  title: '',
  titleEn: '',
  location: '',
  type: 'CDI',
  typeEn: 'Full-time',
  category: 'tech',
  experience: '',
  experienceEn: '',
  description: '',
  descriptionEn: '',
  missions: [''],
  missionsEn: [''],
  requirements: [''],
  requirementsEn: [''],
  active: true,
  assignedTo: ''
}

const CATEGORY_COLORS: Record<string, string> = {
  tech: 'from-blue-500 to-indigo-500',
  consulting: 'from-purple-500 to-violet-500',
  management: 'from-amber-500 to-orange-500'
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: 'Tech',
  consulting: 'Consulting',
  management: 'Management'
}

const TYPE_COLORS: Record<string, string> = {
  CDI: 'from-green-500 to-emerald-500',
  CDD: 'from-blue-500 to-cyan-500',
  Freelance: 'from-purple-500 to-pink-500'
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [commerciaux, setCommerciaux] = useState<User[]>([])

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Ref to track if data has loaded (for timeout)
  const loadedRef = useRef(false)

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!loadedRef.current) {
        setLoading(false)
        setError('Le chargement prend trop de temps. Vérifiez la connexion au serveur.')
      }
    }, 30000) // 30 seconds timeout

    const loadData = async () => {
      try {
        await Promise.all([fetchJobs(), fetchCommerciaux()])
      } finally {
        loadedRef.current = true
      }
    }
    loadData()

    return () => clearTimeout(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCommerciaux = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const commercialUsers = (data.users || []).filter(
          (u: User) => u.role === 'commercial' || u.role === 'admin'
        )
        setCommerciaux(commercialUsers)
      }
    } catch (error) {
      console.error('Error fetching commerciaux:', error)
    }
  }

  const fetchJobs = async () => {
    try {
      setError('')
      const res = await fetch('/api/admin/jobs', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        // Sanitize jobs data on the client side as a safety measure
        const sanitizedJobs = (data.jobs || []).map((job: Record<string, unknown>) => {
          const sanitizeField = (value: unknown): string => {
            if (value === null || value === undefined) return ''
            if (typeof value === 'string') return value
            if (typeof value === 'object' && value !== null) {
              const obj = value as Record<string, unknown>
              if ('detail' in obj && typeof obj.detail === 'string') return obj.detail
              if ('value' in obj && typeof obj.value === 'string') return obj.value
              if ('label' in obj && typeof obj.label === 'string') return obj.label
              return JSON.stringify(value)
            }
            return String(value)
          }

          const sanitizeArray = (arr: unknown): string[] => {
            if (!Array.isArray(arr)) return ['']
            return arr.map(item => sanitizeField(item))
          }

          return {
            ...job,
            _id: String(job._id || ''),
            title: sanitizeField(job.title),
            titleEn: sanitizeField(job.titleEn),
            location: sanitizeField(job.location),
            type: sanitizeField(job.type),
            typeEn: sanitizeField(job.typeEn),
            category: sanitizeField(job.category),
            experience: sanitizeField(job.experience),
            experienceEn: sanitizeField(job.experienceEn),
            description: sanitizeField(job.description),
            descriptionEn: sanitizeField(job.descriptionEn),
            missions: sanitizeArray(job.missions),
            missionsEn: sanitizeArray(job.missionsEn),
            requirements: sanitizeArray(job.requirements),
            requirementsEn: sanitizeArray(job.requirementsEn),
            active: Boolean(job.active),
            assignedTo: sanitizeField(job.assignedTo),
            assignedToName: sanitizeField(job.assignedToName),
            createdAt: sanitizeField(job.createdAt)
          } as Job
        })
        setJobs(sanitizedJobs)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Erreur lors du chargement des offres')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingJob(emptyJob)
    setError('')
    setShowModal(true)
  }

  const openEditModal = (job: Job) => {
    setEditingJob(job)
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingJob(null)
    setError('')
  }

  const handleSave = async () => {
    if (!editingJob) return
    setSaving(true)
    setError('')

    try {
      const method = editingJob._id ? 'PUT' : 'POST'
      const url = editingJob._id
        ? `/api/admin/jobs/${editingJob._id}`
        : '/api/admin/jobs'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingJob)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setSaving(false)
        return
      }

      closeModal()
      fetchJobs()
    } catch (error) {
      console.error('Error saving job:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (job: Job) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${job.title}" ?`)) return

    try {
      const res = await fetch(`/api/admin/jobs/${job._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la suppression')
        return
      }

      fetchJobs()
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Erreur de connexion au serveur')
    }
  }

  const updateField = (field: string, value: string | boolean | string[]) => {
    setEditingJob(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateArrayField = (field: string, index: number, value: string) => {
    if (!editingJob) return
    const arr = [...((editingJob[field as keyof typeof editingJob] as string[]) || [])]
    arr[index] = value
    updateField(field, arr)
  }

  const addArrayItem = (field: string) => {
    if (!editingJob) return
    const arr = [...((editingJob[field as keyof typeof editingJob] as string[]) || []), '']
    updateField(field, arr)
  }

  const removeArrayItem = (field: string, index: number) => {
    if (!editingJob) return
    const arr = ((editingJob[field as keyof typeof editingJob] as string[]) || []).filter((_, i) => i !== index)
    updateField(field, arr)
  }

  // Helper to safely get string value (handles objects and nulls)
  const safeString = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      // Handle potential BoondManager objects or MongoDB objects
      const obj = value as Record<string, unknown>
      if ('detail' in obj && typeof obj.detail === 'string') return obj.detail
      if ('value' in obj && typeof obj.value === 'string') return obj.value
      if ('label' in obj && typeof obj.label === 'string') return obj.label
      return JSON.stringify(value)
    }
    return String(value)
  }

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase()
    const titleStr = safeString(job.title)
    const titleEnStr = safeString(job.titleEn)
    const locationStr = safeString(job.location)
    const descriptionStr = safeString(job.description)

    const matchesSearch = !searchTerm ||
      titleStr.toLowerCase().includes(searchLower) ||
      titleEnStr.toLowerCase().includes(searchLower) ||
      locationStr.toLowerCase().includes(searchLower) ||
      descriptionStr.toLowerCase().includes(searchLower)

    const matchesCategory = filterCategory === 'all' || job.category === filterCategory
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && job.active) ||
      (filterStatus === 'inactive' && !job.active)
    const matchesType = filterType === 'all' || job.type === filterType

    return matchesSearch && matchesCategory && matchesStatus && matchesType
  })

  const getCategoryBadgeClass = (category: string) => {
    const colors = CATEGORY_COLORS[category] || 'from-slate-500 to-slate-600'
    return `bg-gradient-to-r ${colors} text-white`
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Offres d&apos;emploi</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{jobs.length} offre{jobs.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouvelle offre
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par titre, localisation..."
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
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="all">Toutes catégories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="all">Tous types</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Freelance">Freelance</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && !showModal && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => { setError(''); fetchJobs(); }}
            className="ml-auto px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Jobs Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterCategory !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                ? 'Aucune offre ne correspond aux critères'
                : 'Aucune offre d\'emploi'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offre</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localisation</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catégorie</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredJobs.map((job, index) => (
                  <motion.tr
                    key={job._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => openEditModal(job)}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[safeString(job.category)] || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white block">{safeString(job.title) || 'Sans titre'}</span>
                          {job.assignedTo && (
                            <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                              <UserCheck className="w-3 h-3" />
                              {safeString(job.assignedToName) || 'Assigné'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {safeString(job.location) || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${TYPE_COLORS[safeString(job.type)] || 'from-slate-500 to-slate-600'} text-white`}>
                        <Clock className="w-3 h-3" />
                        {safeString(job.type) || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeClass(safeString(job.category))}`}>
                        {CATEGORY_LABELS[safeString(job.category)] || safeString(job.category) || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        job.active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {job.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(job); }}
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

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && editingJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${editingJob._id ? 'from-blue-500 to-indigo-500' : 'from-ebmc-turquoise to-cyan-500'}`}>
                    {editingJob._id ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingJob._id ? 'Modifier l\'offre' : 'Nouvelle offre'}
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

                {/* Titles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre (FR)</label>
                    <input
                      type="text"
                      value={editingJob.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Consultant SAP FI/CO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (EN)</label>
                    <input
                      type="text"
                      value={editingJob.titleEn || ''}
                      onChange={(e) => updateField('titleEn', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="SAP FI/CO Consultant"
                    />
                  </div>
                </div>

                {/* Location, Category, Type, Assigned */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Localisation</label>
                    <input
                      type="text"
                      value={editingJob.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Paris / Remote"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
                    <select
                      value={editingJob.category || 'tech'}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                    <select
                      value={editingJob.type || 'CDI'}
                      onChange={(e) => {
                        updateField('type', e.target.value)
                        updateField('typeEn', e.target.value === 'CDI' ? 'Full-time' : 'Contract')
                      }}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Commercial assigné
                    </label>
                    <select
                      value={editingJob.assignedTo || ''}
                      onChange={(e) => {
                        const selectedUser = commerciaux.find(u => u._id === e.target.value)
                        updateField('assignedTo', e.target.value)
                        updateField('assignedToName', selectedUser?.name || selectedUser?.email || '')
                      }}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Non assigné</option>
                      {commerciaux.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expérience (FR)</label>
                    <input
                      type="text"
                      value={editingJob.experience || ''}
                      onChange={(e) => updateField('experience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="3+ ans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (EN)</label>
                    <input
                      type="text"
                      value={editingJob.experienceEn || ''}
                      onChange={(e) => updateField('experienceEn', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="3+ years"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (FR)</label>
                    <textarea
                      value={editingJob.description || ''}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (EN)</label>
                    <textarea
                      value={editingJob.descriptionEn || ''}
                      onChange={(e) => updateField('descriptionEn', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>

                {/* Missions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Missions (FR)</label>
                  {(editingJob.missions || ['']).map((m, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => updateArrayField('missions', i, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('missions', i)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('missions')}
                    className="text-ebmc-turquoise text-sm font-medium hover:underline"
                  >
                    + Ajouter une mission
                  </button>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="active"
                    checked={editingJob.active !== false}
                    onChange={(e) => updateField('active', e.target.checked)}
                    className="w-5 h-5 text-ebmc-turquoise rounded border-gray-300 focus:ring-ebmc-turquoise"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Offre active (visible sur le site)
                  </label>
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
                      {editingJob._id ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingJob._id ? 'Mettre à jour' : 'Créer'}
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
