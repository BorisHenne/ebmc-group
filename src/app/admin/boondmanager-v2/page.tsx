'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Briefcase, Target, Building2, UserCircle, FolderKanban, Zap,
  Search, Plus, Edit, Trash2, X, Check, Loader2, AlertCircle, RefreshCw,
  Phone, Mail, Calendar, ExternalLink, Eye, ToggleLeft, ToggleRight,
  Shield, ShieldOff, ChevronDown, ChevronRight, Globe, MapPin
} from 'lucide-react'

// Types
type BoondEnvironment = 'production' | 'sandbox'
type TabType = 'dashboard' | 'candidates' | 'resources' | 'opportunities' | 'companies' | 'contacts' | 'projects'

interface BaseEntity {
  id: number
  attributes: Record<string, unknown>
  relationships?: Record<string, unknown>
}

interface DashboardStats {
  candidates: { total: number; byState: Record<number, number> }
  resources: { total: number; byState: Record<number, number> }
  opportunities: { total: number; byState: Record<number, number> }
  companies: { total: number; byState: Record<number, number> }
  projects: { total: number; byState: Record<number, number> }
  stateLabels: {
    candidates: Record<number, string>
    resources: Record<number, string>
    opportunities: Record<number, string>
    companies: Record<number, string>
    projects: Record<number, string>
  }
}

// State labels (fallback)
const STATE_LABELS = {
  candidates: { 0: 'Nouveau', 1: 'A qualifier', 2: 'Qualifie', 3: 'En cours', 4: 'Entretien', 5: 'Proposition', 6: 'Embauche', 7: 'Refuse', 8: 'Archive' },
  resources: { 0: 'Non defini', 1: 'Disponible', 2: 'En mission', 3: 'Intercontrat', 4: 'Indisponible', 5: 'Sorti' },
  opportunities: { 0: 'En cours', 1: 'Gagnee', 2: 'Perdue', 3: 'Abandonnee' },
  companies: { 0: 'Prospect', 1: 'Client', 2: 'Ancien client', 3: 'Fournisseur', 4: 'Archive' },
  projects: { 0: 'En preparation', 1: 'En cours', 2: 'Termine', 3: 'Annule' },
}

// State colors
const STATE_COLORS = {
  candidates: {
    0: 'bg-gray-100 text-gray-700', 1: 'bg-slate-100 text-slate-700', 2: 'bg-cyan-100 text-cyan-700',
    3: 'bg-purple-100 text-purple-700', 4: 'bg-amber-100 text-amber-700', 5: 'bg-blue-100 text-blue-700',
    6: 'bg-green-100 text-green-700', 7: 'bg-red-100 text-red-700', 8: 'bg-gray-100 text-gray-700'
  },
  resources: {
    0: 'bg-gray-100 text-gray-700', 1: 'bg-green-100 text-green-700', 2: 'bg-blue-100 text-blue-700',
    3: 'bg-amber-100 text-amber-700', 4: 'bg-red-100 text-red-700', 5: 'bg-gray-100 text-gray-700'
  },
  opportunities: {
    0: 'bg-blue-100 text-blue-700', 1: 'bg-green-100 text-green-700',
    2: 'bg-red-100 text-red-700', 3: 'bg-gray-100 text-gray-700'
  },
  companies: {
    0: 'bg-amber-100 text-amber-700', 1: 'bg-green-100 text-green-700',
    2: 'bg-slate-100 text-slate-700', 3: 'bg-purple-100 text-purple-700', 4: 'bg-gray-100 text-gray-700'
  },
  projects: {
    0: 'bg-amber-100 text-amber-700', 1: 'bg-blue-100 text-blue-700',
    2: 'bg-green-100 text-green-700', 3: 'bg-red-100 text-red-700'
  },
}

export default function BoondManagerV2Page() {
  // State
  const [environment, setEnvironment] = useState<BoondEnvironment>('sandbox')
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Data
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [items, setItems] = useState<BaseEntity[]>([])

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedItem, setSelectedItem] = useState<BaseEntity | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  // Tabs configuration
  const tabs: { id: TabType; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Zap, color: 'from-amber-500 to-orange-500' },
    { id: 'candidates', label: 'Candidats', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'resources', label: 'Ressources', icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
    { id: 'opportunities', label: 'Opportunites', icon: Target, color: 'from-green-500 to-emerald-500' },
    { id: 'companies', label: 'Societes', icon: Building2, color: 'from-cyan-500 to-teal-500' },
    { id: 'contacts', label: 'Contacts', icon: UserCircle, color: 'from-rose-500 to-pink-500' },
    { id: 'projects', label: 'Projets', icon: FolderKanban, color: 'from-violet-500 to-purple-500' },
  ]

  // Check if write operations are allowed
  const canWrite = environment === 'sandbox'

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (activeTab === 'dashboard') {
        const res = await fetch(`/api/boondmanager/v2?env=${environment}&type=stats`, { credentials: 'include' })
        if (!res.ok) throw new Error('Erreur de chargement des statistiques')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        } else {
          throw new Error(data.error || 'Erreur inconnue')
        }
      } else {
        const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
        const res = await fetch(`/api/boondmanager/v2/${activeTab}?env=${environment}${searchParam}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Erreur de chargement')
        const data = await res.json()
        if (data.success) {
          setItems(data.data || [])
        } else {
          throw new Error(data.error || 'Erreur inconnue')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [activeTab, environment, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handlers
  const handleCreate = () => {
    if (!canWrite) {
      alert('Creation non autorisee en production')
      return
    }
    setModalMode('create')
    setSelectedItem(null)
    setFormData({})
    setShowModal(true)
  }

  const handleEdit = (item: BaseEntity) => {
    if (!canWrite) {
      alert('Modification non autorisee en production')
      return
    }
    setModalMode('edit')
    setSelectedItem(item)
    setFormData({ ...item.attributes })
    setShowModal(true)
  }

  const handleView = (item: BaseEntity) => {
    setModalMode('view')
    setSelectedItem(item)
    setFormData({ ...item.attributes })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!canWrite) {
      alert('Suppression non autorisee en production')
      return
    }
    if (!confirm('Etes-vous sur de vouloir supprimer cet element ?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/boondmanager/v2/${activeTab}?env=${environment}&id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur de suppression')
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = modalMode === 'create' ? 'POST' : 'PATCH'
      const body = modalMode === 'edit' && selectedItem
        ? { id: selectedItem.id, ...formData }
        : formData

      const res = await fetch(`/api/boondmanager/v2/${activeTab}?env=${environment}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const getStateColor = (state: number, type: string): string => {
    const colors = STATE_COLORS[type as keyof typeof STATE_COLORS]
    return colors?.[state as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const getStateLabel = (state: number, type: string): string => {
    const labels = stats?.stateLabels?.[type as keyof typeof STATE_LABELS] || STATE_LABELS[type as keyof typeof STATE_LABELS]
    return labels?.[state as keyof typeof labels] || `Etat ${state}`
  }

  // Render dashboard
  const renderDashboard = () => {
    if (!stats) return null

    const statCards = [
      { key: 'candidates', label: 'Candidats', icon: Users, color: 'from-purple-500 to-pink-500' },
      { key: 'resources', label: 'Ressources', icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
      { key: 'opportunities', label: 'Opportunites', icon: Target, color: 'from-green-500 to-emerald-500' },
      { key: 'companies', label: 'Societes', icon: Building2, color: 'from-cyan-500 to-teal-500' },
      { key: 'projects', label: 'Projets', icon: FolderKanban, color: 'from-violet-500 to-purple-500' },
    ]

    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => {
            const data = stats[card.key as keyof typeof stats] as { total: number; byState: Record<number, number> }
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{data?.total || 0}</p>
                  </div>
                </div>
                {/* State breakdown */}
                <div className="space-y-1">
                  {Object.entries(data?.byState || {}).slice(0, 4).map(([state, count]) => (
                    <div key={state} className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${getStateColor(parseInt(state), card.key)}`}>
                        {getStateLabel(parseInt(state), card.key)}
                      </span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">{count as number}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Environment Info */}
        <div className="glass-card p-4">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Informations environnement</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Environnement</p>
              <p className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                {environment === 'production' ? (
                  <><Shield className="w-4 h-4 text-green-500" /> Production (Lecture seule)</>
                ) : (
                  <><ShieldOff className="w-4 h-4 text-amber-500" /> Sandbox (CRUD complet)</>
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">API URL</p>
              <p className="font-medium text-slate-800 dark:text-white">ui.boondmanager.com/api</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Operations GET</p>
              <p className="font-medium text-green-600">Autorisees</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Operations PUT/DELETE</p>
              <p className={`font-medium ${canWrite ? 'text-green-600' : 'text-red-600'}`}>
                {canWrite ? 'Autorisees' : 'Bloquees'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render list item based on type
  const renderListItem = (item: BaseEntity) => {
    const attrs = item.attributes

    if (activeTab === 'candidates' || activeTab === 'resources') {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${activeTab === 'candidates' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-indigo-500'} flex items-center justify-center text-white font-bold`}>
                {String(attrs.firstName || '').charAt(0)}{String(attrs.lastName || '').charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  {String(attrs.firstName || '')} {String(attrs.lastName || '')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{String(attrs.title || 'Sans titre')}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {!!attrs.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {String(attrs.email)}
                    </span>
                  )}
                  {!!attrs.phone1 && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {String(attrs.phone1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(attrs.state as number, activeTab)}`}>
                {getStateLabel(attrs.state as number, activeTab)}
              </span>
              <button onClick={() => handleView(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <Eye className="w-4 h-4" />
              </button>
              {canWrite && (
                <>
                  <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )
    }

    if (activeTab === 'opportunities') {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{String(attrs.title || '')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{String(attrs.reference || 'Sans reference')}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {!!attrs.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {String(attrs.startDate)}
                    </span>
                  )}
                  {!!attrs.averageDailyPriceExcludingTax && (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {String(attrs.averageDailyPriceExcludingTax)} EUR/j
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(attrs.state as number, 'opportunities')}`}>
                {getStateLabel(attrs.state as number, 'opportunities')}
              </span>
              <button onClick={() => handleView(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <Eye className="w-4 h-4" />
              </button>
              {canWrite && (
                <>
                  <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )
    }

    if (activeTab === 'companies') {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{String(attrs.name || '')}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {!!attrs.town && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {String(attrs.town)}
                    </span>
                  )}
                  {!!attrs.website && (
                    <a href={String(attrs.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-600 hover:underline">
                      <Globe className="w-3 h-3" />
                      Site web
                    </a>
                  )}
                  {!!attrs.staff && (
                    <span>{String(attrs.staff)} employes</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(attrs.state as number, 'companies')}`}>
                {getStateLabel(attrs.state as number, 'companies')}
              </span>
              <button onClick={() => handleView(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <Eye className="w-4 h-4" />
              </button>
              {canWrite && (
                <>
                  <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )
    }

    if (activeTab === 'contacts') {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {String(attrs.firstName || '').charAt(0)}{String(attrs.lastName || '').charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  {String(attrs.firstName || '')} {String(attrs.lastName || '')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{String(attrs.position || 'Sans poste')}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {!!attrs.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {String(attrs.email)}
                    </span>
                  )}
                  {!!attrs.phone1 && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {String(attrs.phone1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleView(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <Eye className="w-4 h-4" />
              </button>
              {canWrite && (
                <>
                  <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )
    }

    if (activeTab === 'projects') {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{String(attrs.title || '')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{String(attrs.reference || 'Sans reference')}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {!!attrs.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {String(attrs.startDate)} - {String(attrs.endDate || '...')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(attrs.state as number, 'projects')}`}>
                {getStateLabel(attrs.state as number, 'projects')}
              </span>
              <button onClick={() => handleView(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )
    }

    return null
  }

  // Render form fields based on active tab
  const renderFormFields = () => {
    const isView = modalMode === 'view'

    if (activeTab === 'candidates' || activeTab === 'resources') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prenom</label>
              <input
                type="text"
                value={(formData.firstName as string) || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
              <input
                type="text"
                value={(formData.lastName as string) || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={(formData.email as string) || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre / Poste</label>
            <input
              type="text"
              value={(formData.title as string) || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
            <input
              type="tel"
              value={(formData.phone1 as string) || ''}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          {activeTab === 'candidates' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source</label>
              <select
                value={(formData.origin as string) || ''}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              >
                <option value="">Selectionner...</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Indeed">Indeed</option>
                <option value="Site Web">Site Web</option>
                <option value="Cooptation">Cooptation</option>
                <option value="CVtheque">CVtheque</option>
                <option value="API">API</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          )}
          {modalMode !== 'create' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
              <select
                value={(formData.state as number) || 0}
                onChange={(e) => setFormData({ ...formData, state: parseInt(e.target.value) })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              >
                {Object.entries(STATE_LABELS[activeTab as keyof typeof STATE_LABELS]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </>
      )
    }

    if (activeTab === 'opportunities') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre</label>
            <input
              type="text"
              value={(formData.title as string) || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference</label>
            <input
              type="text"
              value={(formData.reference as string) || ''}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={(formData.description as string) || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isView}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise resize-none disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de debut</label>
              <input
                type="date"
                value={(formData.startDate as string) || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TJM (EUR)</label>
              <input
                type="number"
                value={(formData.averageDailyPriceExcludingTax as number) || ''}
                onChange={(e) => setFormData({ ...formData, averageDailyPriceExcludingTax: parseInt(e.target.value) })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
          </div>
          {modalMode !== 'create' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
              <select
                value={(formData.state as number) || 0}
                onChange={(e) => setFormData({ ...formData, state: parseInt(e.target.value) })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              >
                {Object.entries(STATE_LABELS.opportunities).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </>
      )
    }

    if (activeTab === 'companies') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
            <input
              type="text"
              value={(formData.name as string) || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
              <input
                type="tel"
                value={(formData.phone1 as string) || ''}
                onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={(formData.email as string) || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site web</label>
            <input
              type="url"
              value={(formData.website as string) || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ville</label>
              <input
                type="text"
                value={(formData.town as string) || ''}
                onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Effectif</label>
              <input
                type="number"
                value={(formData.staff as number) || ''}
                onChange={(e) => setFormData({ ...formData, staff: parseInt(e.target.value) })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
          </div>
        </>
      )
    }

    if (activeTab === 'contacts') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prenom</label>
              <input
                type="text"
                value={(formData.firstName as string) || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
              <input
                type="text"
                value={(formData.lastName as string) || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={(formData.email as string) || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
            <input
              type="tel"
              value={(formData.phone1 as string) || ''}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Poste</label>
            <input
              type="text"
              value={(formData.position as string) || ''}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
        </>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-ebmc-turquoise to-cyan-500">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">BoondManager</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Integration complete API Boond Manager</p>
        </div>

        {/* Environment Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className={`text-sm font-medium ${environment === 'production' ? 'text-green-600' : 'text-slate-400'}`}>
              Production
            </span>
            <button
              onClick={() => setEnvironment(environment === 'production' ? 'sandbox' : 'production')}
              className="relative"
            >
              {environment === 'sandbox' ? (
                <ToggleRight className="w-10 h-6 text-amber-500" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-green-500" />
              )}
            </button>
            <span className={`text-sm font-medium ${environment === 'sandbox' ? 'text-amber-600' : 'text-slate-400'}`}>
              Sandbox
            </span>
          </div>

          {activeTab !== 'dashboard' && activeTab !== 'projects' && canWrite && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white rounded-lg hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Nouveau
            </button>
          )}
        </div>
      </div>

      {/* Environment Badge */}
      <div className={`px-4 py-2 rounded-lg ${environment === 'production' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
        <div className="flex items-center gap-2">
          {environment === 'production' ? (
            <>
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-medium">Mode Production - Lecture seule (GET uniquement)</span>
            </>
          ) : (
            <>
              <ShieldOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-700 dark:text-amber-300 font-medium">Mode Sandbox - CRUD complet (GET, POST, PUT, DELETE)</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setSearch('')
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search (for list tabs) */}
      {activeTab !== 'dashboard' && (
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
            />
          </div>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
        </div>
      ) : activeTab === 'dashboard' ? (
        renderDashboard()
      ) : (
        <div className="grid gap-4">
          {items.map((item) => renderListItem(item))}
          {items.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              Aucun element trouve
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {modalMode === 'create' ? 'Nouveau' : modalMode === 'edit' ? 'Modifier' : 'Details'} - {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              <div className="space-y-4">
                {renderFormFields()}
              </div>

              {modalMode !== 'view' && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {modalMode === 'create' ? 'Creer' : 'Enregistrer'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
