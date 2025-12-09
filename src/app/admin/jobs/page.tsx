'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
  Filter,
  XCircle
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null)
  const [saving, setSaving] = useState(false)
  const [commerciaux, setCommerciaux] = useState<User[]>([])

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAssigned, setFilterAssigned] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchJobs()
    fetchCommerciaux()
  }, [])

  const fetchCommerciaux = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        // Filter only commercial users
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
      const res = await fetch('/api/admin/jobs', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingJob) return
    setSaving(true)

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

      if (res.ok) {
        fetchJobs()
        setEditingJob(null)
      }
    } catch (error) {
      console.error('Error saving job:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return

    try {
      await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE', credentials: 'include' })
      fetchJobs()
    } catch (error) {
      console.error('Error deleting job:', error)
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

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      job.title.toLowerCase().includes(searchLower) ||
      job.titleEn?.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.descriptionEn?.toLowerCase().includes(searchLower)

    // Category filter
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory

    // Status filter
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && job.active) ||
      (filterStatus === 'inactive' && !job.active)

    // Type filter
    const matchesType = filterType === 'all' || job.type === filterType

    // Assigned filter
    const matchesAssigned = filterAssigned === 'all' ||
      (filterAssigned === 'unassigned' && !job.assignedTo) ||
      (filterAssigned !== 'unassigned' && job.assignedTo === filterAssigned)

    return matchesSearch && matchesCategory && matchesStatus && matchesType && matchesAssigned
  })

  const clearFilters = () => {
    setSearchTerm('')
    setFilterCategory('all')
    setFilterStatus('all')
    setFilterType('all')
    setFilterAssigned('all')
  }

  const hasActiveFilters = searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterType !== 'all' || filterAssigned !== 'all'

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offres d&apos;emploi</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Gérez les offres d&apos;emploi publiées</p>
        </div>
        <button
          onClick={() => setEditingJob(emptyJob)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nouvelle offre
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, description, localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition text-gray-900 dark:text-white"
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
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition ${
              showFilters || hasActiveFilters
                ? 'bg-ebmc-turquoise text-white border-ebmc-turquoise'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-ebmc-turquoise'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filtres
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-white rounded-full"></span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-ebmc-turquoise/20"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="tech">Tech</option>
                  <option value="consulting">Consulting</option>
                  <option value="management">Management</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-ebmc-turquoise/20"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actives</option>
                  <option value="inactive">Inactives</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de contrat
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-ebmc-turquoise/20"
                >
                  <option value="all">Tous</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              {/* Assigned Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commercial assigné
                </label>
                <select
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-ebmc-turquoise/20"
                >
                  <option value="all">Tous</option>
                  <option value="unassigned">Non assignées</option>
                  {commerciaux.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-ebmc-turquoise hover:underline flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Results count */}
        {(searchTerm || hasActiveFilters) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredJobs.length} résultat{filteredJobs.length !== 1 ? 's' : ''} trouvé{filteredJobs.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Jobs List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            {hasActiveFilters ? 'Aucune offre ne correspond aux critères' : 'Aucune offre d\'emploi'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">{job.title}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        job.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {job.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {job.category}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                      {job.assignedTo && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <UserCheck className="w-4 h-4" />
                          {job.assignedToName || 'Assigné'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingJob(job)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingJob._id ? 'Modifier l\'offre' : 'Nouvelle offre'}
              </h2>
              <button onClick={() => setEditingJob(null)}>
                <X className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre (FR)</label>
                  <input
                    type="text"
                    value={editingJob.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    value={editingJob.titleEn || ''}
                    onChange={(e) => updateField('titleEn', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={editingJob.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Paris / Remote"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select
                    value={editingJob.category || 'tech'}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tech">Tech</option>
                    <option value="consulting">Consulting</option>
                    <option value="management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={editingJob.type || 'CDI'}
                    onChange={(e) => {
                      updateField('type', e.target.value)
                      updateField('typeEn', e.target.value === 'CDI' ? 'Full-time' : 'Contract')
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4 text-purple-500" />
                      Commercial assigné
                    </span>
                  </label>
                  <select
                    value={editingJob.assignedTo || ''}
                    onChange={(e) => {
                      const selectedUser = commerciaux.find(u => u._id === e.target.value)
                      updateField('assignedTo', e.target.value)
                      updateField('assignedToName', selectedUser?.name || selectedUser?.email || '')
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expérience (FR)</label>
                  <input
                    type="text"
                    value={editingJob.experience || ''}
                    onChange={(e) => updateField('experience', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="3+ ans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (EN)</label>
                  <input
                    type="text"
                    value={editingJob.experienceEn || ''}
                    onChange={(e) => updateField('experienceEn', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="3+ years"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (FR)</label>
                  <textarea
                    value={editingJob.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (EN)</label>
                  <textarea
                    value={editingJob.descriptionEn || ''}
                    onChange={(e) => updateField('descriptionEn', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeArrayItem('missions', i)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('missions')}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Ajouter une mission
                </button>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={editingJob.active !== false}
                  onChange={(e) => updateField('active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">Offre active (visible sur le site)</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <button
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
