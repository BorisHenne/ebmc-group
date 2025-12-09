'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  MapPin,
  Award,
  Save,
  UserCheck,
  Search,
  Filter,
  XCircle
} from 'lucide-react'

interface UserAccount {
  _id: string
  email: string
  name: string
  role: string
}

interface Consultant {
  _id: string
  name: string
  title: string
  titleEn: string
  location: string
  experience: string
  experienceEn: string
  category: string
  available: boolean
  skills: string[]
  certifications: string[]
  assignedTo?: string
  assignedToName?: string
  createdAt: string
}

const emptyConsultant: Omit<Consultant, '_id' | 'createdAt'> = {
  name: '',
  title: '',
  titleEn: '',
  location: '',
  experience: '',
  experienceEn: '',
  category: 'sap',
  available: true,
  skills: [''],
  certifications: [''],
  assignedTo: ''
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingConsultant, setEditingConsultant] = useState<Partial<Consultant> | null>(null)
  const [saving, setSaving] = useState(false)
  const [commerciaux, setCommerciaux] = useState<UserAccount[]>([])

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterAvailability, setFilterAvailability] = useState<string>('all')
  const [filterAssigned, setFilterAssigned] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchConsultants()
    fetchCommerciaux()
  }, [])

  const fetchCommerciaux = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const commercialUsers = (data.users || []).filter(
          (u: UserAccount) => u.role === 'commercial' || u.role === 'admin'
        )
        setCommerciaux(commercialUsers)
      }
    } catch (error) {
      console.error('Error fetching commerciaux:', error)
    }
  }

  const fetchConsultants = async () => {
    try {
      const res = await fetch('/api/admin/consultants', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setConsultants(data.consultants || [])
      }
    } catch (error) {
      console.error('Error fetching consultants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingConsultant) return
    setSaving(true)

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

      if (res.ok) {
        fetchConsultants()
        setEditingConsultant(null)
      }
    } catch (error) {
      console.error('Error saving consultant:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce consultant ?')) return

    try {
      await fetch(`/api/admin/consultants/${id}`, { method: 'DELETE', credentials: 'include' })
      fetchConsultants()
    } catch (error) {
      console.error('Error deleting consultant:', error)
    }
  }

  const updateField = (field: string, value: string | boolean | string[]) => {
    setEditingConsultant(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateArrayField = (field: string, index: number, value: string) => {
    if (!editingConsultant) return
    const arr = [...((editingConsultant[field as keyof typeof editingConsultant] as string[]) || [])]
    arr[index] = value
    updateField(field, arr)
  }

  const addArrayItem = (field: string) => {
    if (!editingConsultant) return
    const arr = [...((editingConsultant[field as keyof typeof editingConsultant] as string[]) || []), '']
    updateField(field, arr)
  }

  const removeArrayItem = (field: string, index: number) => {
    if (!editingConsultant) return
    const arr = ((editingConsultant[field as keyof typeof editingConsultant] as string[]) || []).filter((_, i) => i !== index)
    updateField(field, arr)
  }

  // Filter consultants
  const filteredConsultants = consultants.filter(consultant => {
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      consultant.name.toLowerCase().includes(searchLower) ||
      consultant.title.toLowerCase().includes(searchLower) ||
      consultant.titleEn?.toLowerCase().includes(searchLower) ||
      consultant.location.toLowerCase().includes(searchLower) ||
      consultant.skills?.some(s => s.toLowerCase().includes(searchLower)) ||
      consultant.certifications?.some(c => c.toLowerCase().includes(searchLower))

    // Category filter
    const matchesCategory = filterCategory === 'all' || consultant.category === filterCategory

    // Availability filter
    const matchesAvailability = filterAvailability === 'all' ||
      (filterAvailability === 'available' && consultant.available) ||
      (filterAvailability === 'mission' && !consultant.available)

    // Assigned filter
    const matchesAssigned = filterAssigned === 'all' ||
      (filterAssigned === 'unassigned' && !consultant.assignedTo) ||
      (filterAssigned !== 'unassigned' && consultant.assignedTo === filterAssigned)

    return matchesSearch && matchesCategory && matchesAvailability && matchesAssigned
  })

  const clearFilters = () => {
    setSearchTerm('')
    setFilterCategory('all')
    setFilterAvailability('all')
    setFilterAssigned('all')
  }

  const hasActiveFilters = searchTerm || filterCategory !== 'all' || filterAvailability !== 'all' || filterAssigned !== 'all'

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consultants</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Gérez les consultants disponibles</p>
        </div>
        <button
          onClick={() => setEditingConsultant(emptyConsultant)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nouveau consultant
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
              placeholder="Rechercher par nom, titre, compétences, certifications..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option value="sap">SAP</option>
                  <option value="security">Sécurité</option>
                  <option value="dev">Développement</option>
                  <option value="data">Data</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disponibilité
                </label>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-ebmc-turquoise/20"
                >
                  <option value="all">Tous</option>
                  <option value="available">Disponibles</option>
                  <option value="mission">En mission</option>
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
                  <option value="unassigned">Non assignés</option>
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
            {filteredConsultants.length} résultat{filteredConsultants.length !== 1 ? 's' : ''} trouvé{filteredConsultants.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Consultants List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            {hasActiveFilters ? 'Aucun consultant ne correspond aux critères' : 'Aucun consultant'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {filteredConsultants.map((consultant) => (
              <motion.div
                key={consultant._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">{consultant.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          consultant.available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {consultant.available ? 'Disponible' : 'En mission'}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {consultant.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{consultant.title}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {consultant.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {consultant.certifications?.length || 0} certifications
                        </span>
                        {consultant.assignedTo && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <UserCheck className="w-4 h-4" />
                            {consultant.assignedToName || 'Assigné'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {consultant.skills?.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {(consultant.skills?.length || 0) > 4 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">+{consultant.skills.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingConsultant(consultant)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(consultant._id)}
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
      {editingConsultant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingConsultant._id ? 'Modifier le consultant' : 'Nouveau consultant'}
              </h2>
              <button onClick={() => setEditingConsultant(null)}>
                <X className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <input
                  type="text"
                  value={editingConsultant.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre (FR)</label>
                  <input
                    type="text"
                    value={editingConsultant.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Consultant SAP Senior"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    value={editingConsultant.titleEn || ''}
                    onChange={(e) => updateField('titleEn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Senior SAP Consultant"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={editingConsultant.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select
                    value={editingConsultant.category || 'sap'}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sap">SAP</option>
                    <option value="security">Sécurité</option>
                    <option value="dev">Développement</option>
                    <option value="data">Data</option>
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
                    value={editingConsultant.assignedTo || ''}
                    onChange={(e) => {
                      const selectedUser = commerciaux.find(u => u._id === e.target.value)
                      updateField('assignedTo', e.target.value)
                      updateField('assignedToName', selectedUser?.name || selectedUser?.email || '')
                    }}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    value={editingConsultant.experience || ''}
                    onChange={(e) => updateField('experience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10 ans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (EN)</label>
                  <input
                    type="text"
                    value={editingConsultant.experienceEn || ''}
                    onChange={(e) => updateField('experienceEn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10 years"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compétences</label>
                {(editingConsultant.skills || ['']).map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => updateArrayField('skills', i, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="SAP S/4HANA, React, Python..."
                    />
                    <button
                      onClick={() => removeArrayItem('skills', i)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('skills')}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Ajouter une compétence
                </button>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Certifications</label>
                {(editingConsultant.certifications || ['']).map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => updateArrayField('certifications', i, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="AWS Solutions Architect, PMP..."
                    />
                    <button
                      onClick={() => removeArrayItem('certifications', i)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('certifications')}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Ajouter une certification
                </button>
              </div>

              {/* Available toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={editingConsultant.available !== false}
                  onChange={(e) => updateField('available', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="available" className="text-sm text-gray-700 dark:text-gray-300">Disponible pour mission</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <button
                onClick={() => setEditingConsultant(null)}
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
