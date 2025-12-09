'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  MapPin,
  Award,
  Save,
  Search,
  Filter,
  XCircle,
  Briefcase,
  AlertCircle
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

const CATEGORY_COLORS: Record<string, string> = {
  sap: 'from-blue-500 to-indigo-500',
  security: 'from-red-500 to-rose-500',
  dev: 'from-green-500 to-emerald-500',
  data: 'from-purple-500 to-violet-500'
}

const CATEGORY_LABELS: Record<string, string> = {
  sap: 'SAP',
  security: 'Sécurité',
  dev: 'Développement',
  data: 'Data'
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingConsultant, setEditingConsultant] = useState<Partial<Consultant> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [commerciaux, setCommerciaux] = useState<UserAccount[]>([])

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterAvailability, setFilterAvailability] = useState<string>('all')

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

  const openCreateModal = () => {
    setEditingConsultant(emptyConsultant)
    setError('')
    setShowModal(true)
  }

  const openEditModal = (consultant: Consultant) => {
    setEditingConsultant(consultant)
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
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le consultant "${consultant.name}" ?`)) return

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
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      consultant.name.toLowerCase().includes(searchLower) ||
      consultant.title.toLowerCase().includes(searchLower) ||
      consultant.titleEn?.toLowerCase().includes(searchLower) ||
      consultant.location.toLowerCase().includes(searchLower) ||
      consultant.skills?.some(s => s.toLowerCase().includes(searchLower)) ||
      consultant.certifications?.some(c => c.toLowerCase().includes(searchLower))

    const matchesCategory = filterCategory === 'all' || consultant.category === filterCategory

    const matchesAvailability = filterAvailability === 'all' ||
      (filterAvailability === 'available' && consultant.available) ||
      (filterAvailability === 'mission' && !consultant.available)

    return matchesSearch && matchesCategory && matchesAvailability
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
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Consultants</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{consultants.length} consultant{consultants.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouveau consultant
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, titre, compétences..."
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
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="all">Tous statuts</option>
            <option value="available">Disponibles</option>
            <option value="mission">En mission</option>
          </select>
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
            <UserCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterCategory !== 'all' || filterAvailability !== 'all'
                ? 'Aucun consultant ne correspond aux critères'
                : 'Aucun consultant trouvé'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consultant</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localisation</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catégorie</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Compétences</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredConsultants.map((consultant, index) => (
                  <motion.tr
                    key={consultant._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[consultant.category] || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {consultant.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white block">{consultant.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{consultant.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {consultant.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeClass(consultant.category)}`}>
                        <Briefcase className="w-3 h-3" />
                        {CATEGORY_LABELS[consultant.category] || consultant.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        consultant.available
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}>
                        {consultant.available ? 'Disponible' : 'En mission'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {consultant.skills?.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {(consultant.skills?.length || 0) > 3 && (
                          <span className="px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500">+{consultant.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(consultant)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(consultant)}
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
        {showModal && editingConsultant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${editingConsultant._id ? 'from-blue-500 to-indigo-500' : 'from-ebmc-turquoise to-cyan-500'}`}>
                    {editingConsultant._id ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingConsultant._id ? 'Modifier le consultant' : 'Nouveau consultant'}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet
                  </label>
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
                      placeholder="Consultant SAP Senior"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (EN)</label>
                    <input
                      type="text"
                      value={editingConsultant.titleEn || ''}
                      onChange={(e) => updateField('titleEn', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Senior SAP Consultant"
                    />
                  </div>
                </div>

                {/* Location, Category, Assigned */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Localisation</label>
                    <input
                      type="text"
                      value={editingConsultant.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
                    <select
                      value={editingConsultant.category || 'sap'}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Commercial assigné
                    </label>
                    <select
                      value={editingConsultant.assignedTo || ''}
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
                      value={editingConsultant.experience || ''}
                      onChange={(e) => updateField('experience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="10 ans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (EN)</label>
                    <input
                      type="text"
                      value={editingConsultant.experienceEn || ''}
                      onChange={(e) => updateField('experienceEn', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
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
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="SAP S/4HANA, React, Python..."
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skills', i)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('skills')}
                    className="text-ebmc-turquoise text-sm font-medium hover:underline"
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
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="AWS Solutions Architect, PMP..."
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('certifications', i)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('certifications')}
                    className="text-ebmc-turquoise text-sm font-medium hover:underline"
                  >
                    + Ajouter une certification
                  </button>
                </div>

                {/* Available toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editingConsultant.available !== false}
                    onChange={(e) => updateField('available', e.target.checked)}
                    className="w-5 h-5 text-ebmc-turquoise rounded border-gray-300 focus:ring-ebmc-turquoise"
                  />
                  <label htmlFor="available" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Disponible pour mission
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
                      {editingConsultant._id ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingConsultant._id ? 'Mettre à jour' : 'Créer'}
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
