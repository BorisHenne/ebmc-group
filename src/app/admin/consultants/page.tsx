'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  MapPin,
  Save,
  Search,
  XCircle,
  Briefcase,
  AlertCircle,
  Euro,
  Calendar,
  Globe2,
  Award,
  Home,
  Users,
  User,
  Mail,
  Phone,
  FileText,
  Shield,
  ChevronRight
} from 'lucide-react'
import {
  Candidate,
  CandidateStatus,
  SAP_MODULES,
  SAP_SUB_MODULES,
  JOB_FAMILIES,
  LANGUAGES,
  STATUS_LABELS,
  STATUS_COLORS,
  generateDemoCandidates,
  getFullName,
  getInitials
} from '@/types/candidate'

interface UserAccount {
  _id: string
  email: string
  name: string
  role: string
}

// Mobility options
const MOBILITY_OPTIONS = ['IDF', 'France', 'Luxembourg', 'Locale', 'Nationale', 'Internationale'] as const

// Seniority levels
const SENIORITY_LEVELS = ['Junior', 'Confirmé', 'Senior', 'Expert'] as const

// Modal tabs
type ModalTab = 'identity' | 'skills' | 'experience' | 'availability' | 'financial' | 'notes'

const MODAL_TABS: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
  { id: 'identity', label: 'Identité', icon: <User className="w-4 h-4" /> },
  { id: 'skills', label: 'Compétences', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'experience', label: 'Expérience', icon: <Award className="w-4 h-4" /> },
  { id: 'availability', label: 'Disponibilité', icon: <Calendar className="w-4 h-4" /> },
  { id: 'financial', label: 'Rémunération', icon: <Euro className="w-4 h-4" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
]

const emptyCandidate: Partial<Candidate> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  nationality: '',
  modules: [],
  subModules: [],
  jobFamily: undefined,
  experience: { years: 0, seniority: 'Confirmé' },
  certifications: [],
  availability: { isAvailable: true, availableIn: 'Immédiat' },
  location: { city: '', country: 'France' },
  mobility: [],
  remoteWork: false,
  dailyRate: { min: 0, max: 0, currency: 'EUR' },
  languages: ['Français'],
  securityClearance: '',
  status: 'embauche', // Consultants are hired candidates
  notes: '',
  commercialId: ''
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Candidate[]>([])
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingConsultant, setEditingConsultant] = useState<Partial<Candidate> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [commerciaux, setCommerciaux] = useState<UserAccount[]>([])
  const [activeTab, setActiveTab] = useState<ModalTab>('identity')

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [filterAvailability, setFilterAvailability] = useState<string>('all')

  useEffect(() => {
    initializeData()
    fetchCommerciaux()
  }, [])

  const initializeData = () => {
    // Generate demo candidates using shared function
    const candidates = generateDemoCandidates(30)
    setAllCandidates(candidates)

    // Filter only hired candidates (consultants)
    const hired = candidates.filter(c => c.status === 'embauche')
    setConsultants(hired)
    setLoading(false)
  }

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

  const openCreateModal = () => {
    setEditingConsultant({ ...emptyCandidate, id: `consultant-${Date.now()}` })
    setActiveTab('identity')
    setError('')
    setShowModal(true)
  }

  const openEditModal = (consultant: Candidate) => {
    setEditingConsultant({ ...consultant })
    setActiveTab('identity')
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

    // Simulate save (in real app, call API)
    setTimeout(() => {
      if (editingConsultant.id && consultants.find(c => c.id === editingConsultant.id)) {
        // Update existing
        setConsultants(prev => prev.map(c =>
          c.id === editingConsultant.id ? { ...c, ...editingConsultant } as Candidate : c
        ))
      } else {
        // Add new
        const newConsultant: Candidate = {
          ...emptyCandidate,
          ...editingConsultant,
          id: editingConsultant.id || `consultant-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'embauche'
        } as Candidate
        setConsultants(prev => [newConsultant, ...prev])
      }
      closeModal()
      setSaving(false)
    }, 500)
  }

  const handleDelete = async (consultant: Candidate) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${getFullName(consultant)} ?`)) return
    setConsultants(prev => prev.filter(c => c.id !== consultant.id))
  }

  const updateField = (field: string, value: unknown) => {
    setEditingConsultant(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateNestedField = (parent: string, field: string, value: unknown) => {
    setEditingConsultant(prev => {
      if (!prev) return null
      const currentValue = prev[parent as keyof typeof prev]
      const parentObj = (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue))
        ? (currentValue as unknown as Record<string, unknown>)
        : {}
      return { ...prev, [parent]: { ...parentObj, [field]: value } }
    })
  }

  const toggleArrayItem = (field: keyof Candidate, value: string) => {
    setEditingConsultant(prev => {
      if (!prev) return null
      const arr = (prev[field] as string[]) || []
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) }
      } else {
        return { ...prev, [field]: [...arr, value] }
      }
    })
  }

  // Filter consultants
  const filteredConsultants = consultants.filter(consultant => {
    const searchLower = searchTerm.toLowerCase()
    const fullName = getFullName(consultant).toLowerCase()
    const matchesSearch = !searchTerm ||
      fullName.includes(searchLower) ||
      consultant.title?.toLowerCase().includes(searchLower) ||
      consultant.location?.city?.toLowerCase().includes(searchLower) ||
      consultant.modules?.some(m => m.toLowerCase().includes(searchLower)) ||
      consultant.certifications?.some(c => c.toLowerCase().includes(searchLower))

    const matchesModule = filterModule === 'all' || consultant.modules?.includes(filterModule as typeof SAP_MODULES[number])

    const matchesAvailability = filterAvailability === 'all' ||
      (filterAvailability === 'available' && consultant.availability?.isAvailable) ||
      (filterAvailability === 'mission' && !consultant.availability?.isAvailable)

    return matchesSearch && matchesModule && matchesAvailability
  })

  const getSeniorityColor = (seniority?: string) => {
    switch (seniority) {
      case 'Junior': return 'from-green-500 to-emerald-500'
      case 'Confirmé': return 'from-blue-500 to-cyan-500'
      case 'Senior': return 'from-purple-500 to-violet-500'
      case 'Expert': return 'from-amber-500 to-orange-500'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  // Count candidates in recruitment pipeline
  const recruitmentCount = allCandidates.filter(c => c.status !== 'embauche').length

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
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{consultants.length} consultant{consultants.length > 1 ? 's' : ''} embauchés</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Link to recruitment */}
          <Link
            href="/admin/recrutement"
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition font-medium"
          >
            <Users className="w-5 h-5" />
            Recrutement
            <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">{recruitmentCount}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Nouveau consultant
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, titre, modules..."
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
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="all">Tous modules</option>
            {SAP_MODULES.map(mod => (
              <option key={mod} value={mod}>{mod}</option>
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
              {searchTerm || filterModule !== 'all' || filterAvailability !== 'all'
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
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modules SAP</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">TJM</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredConsultants.map((consultant, index) => (
                  <motion.tr
                    key={consultant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getSeniorityColor(consultant.experience?.seniority)} flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {getInitials(consultant)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white block">{getFullName(consultant)}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{consultant.title}</span>
                          {consultant.experience?.seniority && (
                            <span className="ml-2 text-xs text-gray-400">• {consultant.experience.seniority} ({consultant.experience.years} ans)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {consultant.location?.city || '-'}, {consultant.location?.country || '-'}
                      </div>
                      {consultant.remoteWork && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                          <Home className="w-3 h-3" /> Télétravail OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {consultant.modules?.slice(0, 3).map((mod, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                            {mod}
                          </span>
                        ))}
                        {(consultant.modules?.length || 0) > 3 && (
                          <span className="px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500">+{consultant.modules!.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {consultant.dailyRate?.min || consultant.dailyRate?.max ? (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {consultant.dailyRate.min}€ - {consultant.dailyRate.max}€
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        consultant.availability?.isAvailable
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}>
                        {consultant.availability?.isAvailable ? 'Disponible' : 'En mission'}
                      </span>
                      {consultant.availability?.isAvailable && consultant.availability?.availableIn && (
                        <p className="text-xs text-gray-400 mt-1">{consultant.availability.availableIn}</p>
                      )}
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

      {/* Create/Edit Modal with Tabs */}
      <AnimatePresence>
        {showModal && editingConsultant && (
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
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${editingConsultant.id && consultants.find(c => c.id === editingConsultant.id) ? 'from-blue-500 to-indigo-500' : 'from-ebmc-turquoise to-cyan-500'}`}>
                    {editingConsultant.id && consultants.find(c => c.id === editingConsultant.id) ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingConsultant.id && consultants.find(c => c.id === editingConsultant.id) ? 'Modifier le consultant' : 'Nouveau consultant'}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 overflow-x-auto">
                {MODAL_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-ebmc-turquoise text-ebmc-turquoise bg-white dark:bg-slate-700'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 mb-6"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Tab: Identity */}
                {activeTab === 'identity' && (
                  <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prénom</label>
                        <input
                          type="text"
                          value={editingConsultant.firstName || ''}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Jean"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                        <input
                          type="text"
                          value={editingConsultant.lastName || ''}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Dupont"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />Email
                        </label>
                        <input
                          type="email"
                          value={editingConsultant.email || ''}
                          onChange={(e) => updateField('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="jean.dupont@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Phone className="w-4 h-4 inline mr-1" />Téléphone
                        </label>
                        <input
                          type="tel"
                          value={editingConsultant.phone || ''}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre du poste</label>
                      <input
                        type="text"
                        value={editingConsultant.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Consultant SAP FI CO Senior"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />Ville
                        </label>
                        <input
                          type="text"
                          value={editingConsultant.location?.city || ''}
                          onChange={(e) => updateNestedField('location', 'city', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Paris"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pays</label>
                        <input
                          type="text"
                          value={editingConsultant.location?.country || ''}
                          onChange={(e) => updateNestedField('location', 'country', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="France"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nationalité</label>
                        <input
                          type="text"
                          value={editingConsultant.nationality || ''}
                          onChange={(e) => updateField('nationality', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Française"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commercial assigné</label>
                      <select
                        value={editingConsultant.commercialId || ''}
                        onChange={(e) => updateField('commercialId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
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
                )}

                {/* Tab: Skills */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Famille métier</label>
                      <div className="flex flex-wrap gap-2">
                        {JOB_FAMILIES.map(jf => (
                          <button
                            key={jf}
                            type="button"
                            onClick={() => updateField('jobFamily', editingConsultant.jobFamily === jf ? undefined : jf)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                              editingConsultant.jobFamily === jf
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {jf}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Modules SAP
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SAP_MODULES.map(mod => (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => toggleArrayItem('modules', mod)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                              editingConsultant.modules?.includes(mod)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {mod}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sous-modules SAP
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SAP_SUB_MODULES.map(sub => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleArrayItem('subModules', sub)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                              editingConsultant.subModules?.includes(sub)
                                ? 'bg-cyan-500 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Langues</label>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleArrayItem('languages', lang)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                              editingConsultant.languages?.includes(lang)
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Experience */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Années d&apos;expérience
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingConsultant.experience?.years || 0}
                          onChange={(e) => updateNestedField('experience', 'years', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Séniorité</label>
                        <select
                          value={editingConsultant.experience?.seniority || 'Confirmé'}
                          onChange={(e) => updateNestedField('experience', 'seniority', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                          {SENIORITY_LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Award className="w-4 h-4 inline mr-1" />Certifications
                      </label>
                      <div className="space-y-2">
                        {(editingConsultant.certifications || []).map((cert, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={cert}
                              onChange={(e) => {
                                const certs = [...(editingConsultant.certifications || [])]
                                certs[i] = e.target.value
                                updateField('certifications', certs)
                              }}
                              className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              placeholder="SAP S/4HANA Finance"
                            />
                            <button
                              type="button"
                              onClick={() => updateField('certifications', (editingConsultant.certifications || []).filter((_, idx) => idx !== i))}
                              className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateField('certifications', [...(editingConsultant.certifications || []), ''])}
                          className="text-ebmc-turquoise text-sm font-medium hover:underline"
                        >
                          + Ajouter une certification
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Shield className="w-4 h-4 inline mr-1" />Habilitation sécurité
                      </label>
                      <input
                        type="text"
                        value={editingConsultant.securityClearance || ''}
                        onChange={(e) => updateField('securityClearance', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Habilitation défense, Secret..."
                      />
                    </div>
                  </div>
                )}

                {/* Tab: Availability */}
                {activeTab === 'availability' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Statut</label>
                          <select
                            value={editingConsultant.availability?.isAvailable ? 'true' : 'false'}
                            onChange={(e) => updateNestedField('availability', 'isAvailable', e.target.value === 'true')}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          >
                            <option value="true">Disponible</option>
                            <option value="false">En mission</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date de disponibilité</label>
                          <input
                            type="date"
                            value={editingConsultant.availability?.availableFrom || ''}
                            onChange={(e) => updateNestedField('availability', 'availableFrom', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Disponible sous</label>
                          <select
                            value={editingConsultant.availability?.availableIn || 'Immédiat'}
                            onChange={(e) => updateNestedField('availability', 'availableIn', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          >
                            <option value="Immédiat">Immédiat</option>
                            <option value="1 mois">1 mois</option>
                            <option value="2 mois">2 mois</option>
                            <option value="3 mois">3 mois</option>
                            <option value="A définir">À définir</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Globe2 className="w-4 h-4 inline mr-1" />Mobilité
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MOBILITY_OPTIONS.map(mob => (
                          <button
                            key={mob}
                            type="button"
                            onClick={() => toggleArrayItem('mobility', mob)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                              editingConsultant.mobility?.includes(mob as typeof MOBILITY_OPTIONS[number])
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {mob}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <input
                        type="checkbox"
                        id="remoteWork"
                        checked={editingConsultant.remoteWork || false}
                        onChange={(e) => updateField('remoteWork', e.target.checked)}
                        className="w-5 h-5 text-ebmc-turquoise rounded border-gray-300 focus:ring-ebmc-turquoise"
                      />
                      <label htmlFor="remoteWork" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Télétravail possible
                      </label>
                    </div>
                  </div>
                )}

                {/* Tab: Financial */}
                {activeTab === 'financial' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Euro className="w-4 h-4 inline mr-1" />Taux journalier (TJM)
                      </label>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
                          <input
                            type="number"
                            min="0"
                            value={editingConsultant.dailyRate?.min || ''}
                            onChange={(e) => updateNestedField('dailyRate', 'min', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
                          <input
                            type="number"
                            min="0"
                            value={editingConsultant.dailyRate?.max || ''}
                            onChange={(e) => updateNestedField('dailyRate', 'max', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Cible</label>
                          <input
                            type="number"
                            min="0"
                            value={editingConsultant.dailyRate?.target || ''}
                            onChange={(e) => updateNestedField('dailyRate', 'target', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="750"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Devise</label>
                          <select
                            value={editingConsultant.dailyRate?.currency || 'EUR'}
                            onChange={(e) => updateNestedField('dailyRate', 'currency', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          >
                            <option value="EUR">EUR (€)</option>
                            <option value="CHF">CHF</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="USD">USD ($)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Notes */}
                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />Notes internes
                      </label>
                      <textarea
                        rows={6}
                        value={editingConsultant.notes || ''}
                        onChange={(e) => updateField('notes', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                        placeholder="Ajouter des notes sur le consultant..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                      <input
                        type="text"
                        value={editingConsultant.source || ''}
                        onChange={(e) => updateField('source', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="LinkedIn, Cooptation, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL du CV</label>
                      <input
                        type="url"
                        value={editingConsultant.cvUrl || ''}
                        onChange={(e) => updateField('cvUrl', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise outline-none transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
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
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Enregistrer
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
