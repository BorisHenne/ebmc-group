'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  RefreshCw,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  UserCheck,
  MessageSquare,
  Users,
  Download,
  RotateCcw,
  Edit,
  X,
  Save,
  MapPin,
  Clock
} from 'lucide-react'

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
}

interface DemoDataStatus {
  counts: {
    jobs: number
    consultants: number
    messages: number
    users: number
  }
  defaultDataAvailable: {
    jobs: number
    consultants: number
  }
}

const emptyJob: Omit<Job, '_id'> = {
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
}

const emptyConsultant: Omit<Consultant, '_id'> = {
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
}

type TabType = 'overview' | 'jobs' | 'consultants'

export default function DemoDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [status, setStatus] = useState<DemoDataStatus | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit modals
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null)
  const [editingConsultant, setEditingConsultant] = useState<Partial<Consultant> | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchStatus(), fetchJobs(), fetchConsultants()])
    setLoading(false)
  }

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/demo-data', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching status:', error)
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
    }
  }

  const performAction = async (action: string, options: Record<string, unknown> = {}) => {
    setActionLoading(action)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, ...options }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: getSuccessMessage(action) })
        await fetchAll()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'opération' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setActionLoading(null)
    }
  }

  const getSuccessMessage = (action: string) => {
    switch (action) {
      case 'seed': return 'Données de démo ajoutées avec succès'
      case 'reset': return 'Données réinitialisées aux valeurs par défaut'
      case 'clear': return 'Données supprimées avec succès'
      default: return 'Opération effectuée'
    }
  }

  // Job CRUD
  const handleSaveJob = async () => {
    if (!editingJob) return
    setSaving(true)

    try {
      const method = editingJob._id ? 'PUT' : 'POST'
      const url = editingJob._id ? `/api/admin/jobs/${editingJob._id}` : '/api/admin/jobs'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingJob),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: editingJob._id ? 'Offre mise à jour' : 'Offre créée' })
        setEditingJob(null)
        await fetchJobs()
        await fetchStatus()
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Supprimer cette offre ?')) return

    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Offre supprimée' })
        await fetchJobs()
        await fetchStatus()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Consultant CRUD
  const handleSaveConsultant = async () => {
    if (!editingConsultant) return
    setSaving(true)

    try {
      const method = editingConsultant._id ? 'PUT' : 'POST'
      const url = editingConsultant._id ? `/api/admin/consultants/${editingConsultant._id}` : '/api/admin/consultants'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingConsultant),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: editingConsultant._id ? 'Consultant mis à jour' : 'Consultant créé' })
        setEditingConsultant(null)
        await fetchConsultants()
        await fetchStatus()
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConsultant = async (id: string) => {
    if (!confirm('Supprimer ce consultant ?')) return

    try {
      const res = await fetch(`/api/admin/consultants/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Consultant supprimé' })
        await fetchConsultants()
        await fetchStatus()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Array field helpers
  const updateJobArrayField = (field: keyof Job, index: number, value: string) => {
    if (!editingJob) return
    const arr = [...((editingJob[field] as string[]) || [])]
    arr[index] = value
    setEditingJob({ ...editingJob, [field]: arr })
  }

  const addJobArrayItem = (field: keyof Job) => {
    if (!editingJob) return
    const arr = [...((editingJob[field] as string[]) || []), '']
    setEditingJob({ ...editingJob, [field]: arr })
  }

  const removeJobArrayItem = (field: keyof Job, index: number) => {
    if (!editingJob) return
    const arr = ((editingJob[field] as string[]) || []).filter((_, i) => i !== index)
    setEditingJob({ ...editingJob, [field]: arr })
  }

  const updateConsultantArrayField = (field: keyof Consultant, index: number, value: string) => {
    if (!editingConsultant) return
    const arr = [...((editingConsultant[field] as string[]) || [])]
    arr[index] = value
    setEditingConsultant({ ...editingConsultant, [field]: arr })
  }

  const addConsultantArrayItem = (field: keyof Consultant) => {
    if (!editingConsultant) return
    const arr = [...((editingConsultant[field] as string[]) || []), '']
    setEditingConsultant({ ...editingConsultant, [field]: arr })
  }

  const removeConsultantArrayItem = (field: keyof Consultant, index: number) => {
    if (!editingConsultant) return
    const arr = ((editingConsultant[field] as string[]) || []).filter((_, i) => i !== index)
    setEditingConsultant({ ...editingConsultant, [field]: arr })
  }

  const stats = [
    { label: 'Offres d\'emploi', value: status?.counts.jobs || 0, icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
    { label: 'Consultants', value: status?.counts.consultants || 0, icon: UserCheck, color: 'from-purple-500 to-pink-500' },
    { label: 'Messages', value: status?.counts.messages || 0, icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
    { label: 'Utilisateurs', value: status?.counts.users || 0, icon: Users, color: 'from-orange-500 to-amber-500' },
  ]

  const tabs = [
    { id: 'overview' as TabType, label: 'Vue d\'ensemble', icon: Database },
    { id: 'jobs' as TabType, label: `Offres (${jobs.length})`, icon: Briefcase },
    { id: 'consultants' as TabType, label: `Consultants (${consultants.length})`, icon: UserCheck },
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Données de démonstration</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gérez les données de démo pour le site vitrine</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-ebmc-turquoise text-ebmc-turquoise'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm"
              >
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-r ${stat.color} mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Bulk Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Download className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Ajouter données démo</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Seed si collections vides</p>
              <button
                onClick={() => performAction('seed')}
                disabled={actionLoading !== null}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'seed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Seed
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Réinitialiser</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Reset aux valeurs par défaut</p>
              <button
                onClick={() => confirm('Réinitialiser toutes les données ?') && performAction('reset')}
                disabled={actionLoading !== null}
                className="w-full py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'reset' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Reset
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Vider tout</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Supprimer toutes les données</p>
              <button
                onClick={() => confirm('⚠️ Supprimer toutes les données ?') && performAction('clear', { collection: 'all' })}
                disabled={actionLoading !== null}
                className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'clear' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Vider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Offres d&apos;emploi</h2>
            <button
              onClick={() => setEditingJob(emptyJob)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Nouvelle offre
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune offre d&apos;emploi</p>
              </div>
            ) : (
              <div className="divide-y">
                {jobs.map((job) => (
                  <div key={job._id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between">
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
                      <div className="flex gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingJob(job)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consultants Tab */}
      {activeTab === 'consultants' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Consultants</h2>
            <button
              onClick={() => setEditingConsultant(emptyConsultant)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4" />
              Nouveau consultant
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            {consultants.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun consultant</p>
              </div>
            ) : (
              <div className="divide-y">
                {consultants.map((consultant) => (
                  <div key={consultant._id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">{consultant.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          consultant.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {consultant.available ? 'Disponible' : 'En mission'}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {consultant.category}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{consultant.title}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {consultant.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingConsultant(consultant)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConsultant(consultant._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingJob._id ? 'Modifier l\'offre' : 'Nouvelle offre'}
              </h2>
              <button onClick={() => setEditingJob(null)}>
                <X className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre (FR)</label>
                  <input
                    type="text"
                    value={editingJob.title || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    value={editingJob.titleEn || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, titleEn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={editingJob.location || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select
                    value={editingJob.category || 'tech'}
                    onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value })}
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
                      const typeEn = e.target.value === 'CDI' ? 'Full-time' : e.target.value === 'CDD' ? 'Contract' : 'Freelance'
                      setEditingJob({ ...editingJob, type: e.target.value, typeEn })
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expérience (FR)</label>
                  <input
                    type="text"
                    value={editingJob.experience || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    placeholder="3+ ans"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (EN)</label>
                  <input
                    type="text"
                    value={editingJob.experienceEn || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, experienceEn: e.target.value })}
                    placeholder="3+ years"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (FR)</label>
                  <textarea
                    value={editingJob.description || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (EN)</label>
                  <textarea
                    value={editingJob.descriptionEn || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, descriptionEn: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Missions FR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Missions (FR)</label>
                {(editingJob.missions || ['']).map((m, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => updateJobArrayField('missions', i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => removeJobArrayItem('missions', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addJobArrayItem('missions')} className="text-blue-600 text-sm hover:underline">
                  + Ajouter une mission
                </button>
              </div>

              {/* Requirements FR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prérequis (FR)</label>
                {(editingJob.requirements || ['']).map((r, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={r}
                      onChange={(e) => updateJobArrayField('requirements', i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => removeJobArrayItem('requirements', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addJobArrayItem('requirements')} className="text-blue-600 text-sm hover:underline">
                  + Ajouter un prérequis
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="jobActive"
                  checked={editingJob.active !== false}
                  onChange={(e) => setEditingJob({ ...editingJob, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="jobActive" className="text-sm text-gray-700 dark:text-gray-300">Offre active (visible sur le site)</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <button onClick={() => setEditingJob(null)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg">
                Annuler
              </button>
              <button
                onClick={handleSaveJob}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Consultant Edit Modal */}
      {editingConsultant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingConsultant._id ? 'Modifier le consultant' : 'Nouveau consultant'}
              </h2>
              <button onClick={() => setEditingConsultant(null)}>
                <X className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <input
                  type="text"
                  value={editingConsultant.name || ''}
                  onChange={(e) => setEditingConsultant({ ...editingConsultant, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre (FR)</label>
                  <input
                    type="text"
                    value={editingConsultant.title || ''}
                    onChange={(e) => setEditingConsultant({ ...editingConsultant, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    value={editingConsultant.titleEn || ''}
                    onChange={(e) => setEditingConsultant({ ...editingConsultant, titleEn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={editingConsultant.location || ''}
                    onChange={(e) => setEditingConsultant({ ...editingConsultant, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select
                    value={editingConsultant.category || 'sap'}
                    onChange={(e) => setEditingConsultant({ ...editingConsultant, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="sap">SAP</option>
                    <option value="security">Sécurité</option>
                    <option value="dev">Développement</option>
                    <option value="data">Data</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expérience (FR)</label>
                  <input
                    type="text"
                    value={editingConsultant.experience || ''}
                    onChange={(e) => setEditingConsultant({ ...editingConsultant, experience: e.target.value })}
                    placeholder="10 ans"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (EN)</label>
                  <input
                    type="text"
                    value={editingConsultant.experienceEn || ''}
                    onChange={(e) => setEditingConsultant({ ...editingConsultant, experienceEn: e.target.value })}
                    placeholder="10 years"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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
                      onChange={(e) => updateConsultantArrayField('skills', i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <button onClick={() => removeConsultantArrayItem('skills', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addConsultantArrayItem('skills')} className="text-purple-600 text-sm hover:underline">
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
                      onChange={(e) => updateConsultantArrayField('certifications', i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <button onClick={() => removeConsultantArrayItem('certifications', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addConsultantArrayItem('certifications')} className="text-purple-600 text-sm hover:underline">
                  + Ajouter une certification
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consultantAvailable"
                  checked={editingConsultant.available !== false}
                  onChange={(e) => setEditingConsultant({ ...editingConsultant, available: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="consultantAvailable" className="text-sm text-gray-700 dark:text-gray-300">Disponible pour mission</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <button onClick={() => setEditingConsultant(null)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg">
                Annuler
              </button>
              <button
                onClick={handleSaveConsultant}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
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
