'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Briefcase, Target, Building2, UserCircle, FolderKanban, Zap,
  Search, Plus, Edit, Trash2, X, Check, Loader2, AlertCircle, RefreshCw,
  Phone, Mail, Calendar, Eye, ToggleLeft, ToggleRight,
  Shield, ShieldOff, Download, Upload, Sparkles, AlertTriangle, Info,
  Copy, CheckCircle, XCircle, FileJson, FileSpreadsheet, Trash, ArrowRight,
  BarChart3, Globe, MapPin, Book, ChevronDown, ChevronUp
} from 'lucide-react'

// Types
type BoondEnvironment = 'production' | 'sandbox'
type TabType = 'dashboard' | 'dictionary' | 'sync' | 'quality' | 'export' | 'candidates' | 'resources' | 'opportunities' | 'companies' | 'contacts' | 'projects'

interface DictionaryItem {
  id: number | string
  value: string
  color?: string
  isDefault?: boolean
  isActive?: boolean
  order?: number
}

interface DictionaryData {
  [key: string]: DictionaryItem[] | unknown
}

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
}

interface DataQualityIssue {
  entityType: string
  entityId: number
  field: string
  issue: string
  severity: 'error' | 'warning' | 'info'
  currentValue: unknown
  suggestedValue?: unknown
}

interface DuplicateGroup {
  entityType: string
  field: string
  value: string
  items: Array<{ id: number; attributes: Record<string, unknown> }>
}

interface QualityAnalysis {
  issues: DataQualityIssue[]
  duplicates: DuplicateGroup[]
  summary: {
    totalIssues: number
    errors: number
    warnings: number
    info: number
    duplicateGroups: number
  }
}

interface SyncResult {
  startedAt: string
  completedAt: string
  entities: Record<string, {
    entity: string
    total: number
    processed: number
    success: number
    failed: number
    errors: string[]
  }>
  totalRecords: number
  successRecords: number
  failedRecords: number
}

// State labels
const STATE_LABELS = {
  candidates: { 0: 'Nouveau', 1: 'A qualifier', 2: 'Qualifie', 3: 'En cours', 4: 'Entretien', 5: 'Proposition', 6: 'Embauche', 7: 'Refuse', 8: 'Archive' },
  resources: { 0: 'Non defini', 1: 'Disponible', 2: 'En mission', 3: 'Intercontrat', 4: 'Indisponible', 5: 'Sorti' },
  opportunities: { 0: 'En cours', 1: 'Gagnee', 2: 'Perdue', 3: 'Abandonnee' },
  companies: { 0: 'Prospect', 1: 'Client', 2: 'Ancien client', 3: 'Fournisseur', 4: 'Archive' },
  projects: { 0: 'En preparation', 1: 'En cours', 2: 'Termine', 3: 'Annule' },
}

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
  const [qualityAnalysis, setQualityAnalysis] = useState<QualityAnalysis | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [dictionary, setDictionary] = useState<DictionaryData | null>(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Operations
  const [syncing, setSyncing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedItem, setSelectedItem] = useState<BaseEntity | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  // Tabs configuration
  const tabs: { id: TabType; label: string; icon: React.ElementType; color: string; section?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Zap, color: 'from-amber-500 to-orange-500', section: 'overview' },
    { id: 'dictionary', label: 'Dictionnaire', icon: Book, color: 'from-indigo-500 to-violet-500', section: 'tools' },
    { id: 'sync', label: 'Synchronisation', icon: RefreshCw, color: 'from-cyan-500 to-blue-500', section: 'tools' },
    { id: 'quality', label: 'Qualite donnees', icon: Sparkles, color: 'from-purple-500 to-pink-500', section: 'tools' },
    { id: 'export', label: 'Export', icon: Download, color: 'from-green-500 to-emerald-500', section: 'tools' },
    { id: 'candidates', label: 'Candidats', icon: Users, color: 'from-purple-500 to-pink-500', section: 'data' },
    { id: 'resources', label: 'Ressources', icon: Briefcase, color: 'from-blue-500 to-indigo-500', section: 'data' },
    { id: 'opportunities', label: 'Opportunites', icon: Target, color: 'from-green-500 to-emerald-500', section: 'data' },
    { id: 'companies', label: 'Societes', icon: Building2, color: 'from-cyan-500 to-teal-500', section: 'data' },
    { id: 'contacts', label: 'Contacts', icon: UserCircle, color: 'from-rose-500 to-pink-500', section: 'data' },
    { id: 'projects', label: 'Projets', icon: FolderKanban, color: 'from-violet-500 to-purple-500', section: 'data' },
  ]

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
      } else if (activeTab === 'dictionary') {
        // Dictionary tab - load dictionary data
        await fetchDictionary()
        setLoading(false)
        return
      } else if (activeTab === 'sync' || activeTab === 'quality' || activeTab === 'export') {
        // These tabs don't auto-load data
        setLoading(false)
        return
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

  // Sync Production to Sandbox
  const handleSync = async () => {
    if (!confirm('Cette operation va copier TOUTES les donnees de la Production vers la Sandbox. Continuer ?')) return

    setSyncing(true)
    setError(null)
    setSyncResult(null)

    try {
      const res = await fetch('/api/boondmanager/v2/sync', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()

      if (data.success) {
        setSyncResult(data.result)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  // Analyze data quality
  const handleAnalyzeQuality = async () => {
    setAnalyzing(true)
    setError(null)
    setQualityAnalysis(null)

    try {
      const res = await fetch(`/api/boondmanager/v2/quality?env=${environment}`, { credentials: 'include' })
      const data = await res.json()

      if (data.success) {
        setQualityAnalysis(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'analyse')
    } finally {
      setAnalyzing(false)
    }
  }

  // Export data
  const handleExport = async (format: 'json' | 'csv', entity?: string, clean = false) => {
    setExporting(true)

    try {
      let url = `/api/boondmanager/v2/export?env=${environment}&format=${format}&clean=${clean}`
      if (entity) url += `&entity=${entity}`

      const res = await fetch(url, { credentials: 'include' })

      if (!res.ok) throw new Error('Erreur d\'export')

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = entity
        ? `${entity}_${environment}_${new Date().toISOString().split('T')[0]}.${format}`
        : `boondmanager_${environment}_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      a.remove()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'export')
    } finally {
      setExporting(false)
    }
  }

  // Fetch dictionary
  const fetchDictionary = async (refresh = false) => {
    setDictionaryLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/boondmanager/v2/dictionary?env=${environment}${refresh ? '&refresh=true' : ''}`, { credentials: 'include' })
      const data = await res.json()

      if (data.success) {
        setDictionary(data.data?.data?.attributes || null)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement du dictionnaire')
    } finally {
      setDictionaryLoading(false)
    }
  }

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  // CRUD handlers
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
    const labels = STATE_LABELS[type as keyof typeof STATE_LABELS]
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => {
            const data = stats[card.key as keyof typeof stats] as { total: number; byState: Record<number, number> }
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab(card.key as TabType)}
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

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('sync')}
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition"
            >
              <RefreshCw className="w-8 h-8 text-cyan-500" />
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-white">Synchroniser</p>
                <p className="text-sm text-slate-500">Prod → Sandbox</p>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition"
            >
              <Sparkles className="w-8 h-8 text-purple-500" />
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-white">Analyser</p>
                <p className="text-sm text-slate-500">Qualite des donnees</p>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition"
            >
              <Download className="w-8 h-8 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-white">Exporter</p>
                <p className="text-sm text-slate-500">JSON / CSV</p>
              </div>
            </button>
          </div>
        </div>

        {/* Environment Info */}
        <div className="glass-card p-4">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Informations environnement</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Environnement</p>
              <p className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                {environment === 'production' ? (
                  <><Shield className="w-4 h-4 text-green-500" /> Production (GET)</>
                ) : (
                  <><ShieldOff className="w-4 h-4 text-amber-500" /> Sandbox (CRUD)</>
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

  // Render sync tab
  const renderSyncTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Synchronisation Production → Sandbox</h2>
            <p className="text-slate-500 dark:text-slate-400">Copier toutes les donnees de production vers la sandbox pour nettoyage</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Attention</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Cette operation va creer de nouveaux enregistrements dans la Sandbox. Les IDs seront differents de la Production.
                Utilisez cette fonction pour avoir une copie de travail pour le nettoyage des donnees.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 py-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-medium text-slate-800 dark:text-white">Production</p>
            <p className="text-sm text-slate-500">Source (lecture)</p>
          </div>
          <ArrowRight className="w-8 h-8 text-slate-400" />
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
              <ShieldOff className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="font-medium text-slate-800 dark:text-white">Sandbox</p>
            <p className="text-sm text-slate-500">Destination (ecriture)</p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 text-lg font-medium"
          >
            {syncing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Synchronisation en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-6 h-6" />
                Lancer la synchronisation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Resultat de la synchronisation
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{syncResult.totalRecords}</p>
              <p className="text-sm text-slate-500">Total traites</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <p className="text-3xl font-bold text-green-600">{syncResult.successRecords}</p>
              <p className="text-sm text-green-600">Succes</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <p className="text-3xl font-bold text-red-600">{syncResult.failedRecords}</p>
              <p className="text-sm text-red-600">Echecs</p>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(syncResult.entities).map(([key, entity]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{key}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">{entity.success} OK</span>
                  {entity.failed > 0 && <span className="text-red-600">{entity.failed} echecs</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )

  // Render quality tab
  const renderQualityTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analyse qualite des donnees</h2>
              <p className="text-slate-500 dark:text-slate-400">Detecter les problemes et les doublons dans {environment === 'production' ? 'Production' : 'Sandbox'}</p>
            </div>
          </div>
          <button
            onClick={handleAnalyzeQuality}
            disabled={analyzing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyse...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyser
              </>
            )}
          </button>
        </div>

        {qualityAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{qualityAnalysis.summary.totalIssues}</p>
                <p className="text-sm text-slate-500">Total problemes</p>
              </div>
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                <p className="text-2xl font-bold text-red-600">{qualityAnalysis.summary.errors}</p>
                <p className="text-sm text-red-600">Erreurs</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                <p className="text-2xl font-bold text-amber-600">{qualityAnalysis.summary.warnings}</p>
                <p className="text-sm text-amber-600">Avertissements</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-2xl font-bold text-blue-600">{qualityAnalysis.summary.info}</p>
                <p className="text-sm text-blue-600">Suggestions</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center">
                <p className="text-2xl font-bold text-purple-600">{qualityAnalysis.summary.duplicateGroups}</p>
                <p className="text-sm text-purple-600">Doublons</p>
              </div>
            </div>

            {/* Issues list */}
            {qualityAnalysis.issues.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Problemes detectes</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {qualityAnalysis.issues.slice(0, 50).map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg flex items-start gap-3 ${
                        issue.severity === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                        issue.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
                        'bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      {issue.severity === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      ) : issue.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {issue.entityType} #{issue.entityId}
                          </span>
                          <span className="text-xs text-slate-500">{issue.field}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{issue.issue}</p>
                        {issue.suggestedValue !== undefined && (
                          <p className="text-xs text-slate-500 mt-1">
                            Suggestion: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{typeof issue.suggestedValue === 'object' ? JSON.stringify(issue.suggestedValue) : String(issue.suggestedValue)}</code>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {qualityAnalysis.issues.length > 50 && (
                    <p className="text-sm text-slate-500 text-center py-2">
                      ... et {qualityAnalysis.issues.length - 50} autres problemes
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Duplicates */}
            {qualityAnalysis.duplicates.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Doublons detectes</h4>
                <div className="space-y-3">
                  {qualityAnalysis.duplicates.slice(0, 20).map((group, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Copy className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-purple-700 dark:text-purple-300">
                          {group.items.length} {group.entityType}s avec meme {group.field}
                        </span>
                        <code className="text-xs bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded">
                          {group.value}
                        </code>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map(item => (
                          <span key={item.id} className="text-xs px-2 py-1 bg-white dark:bg-slate-800 rounded">
                            #{item.id} - {String(item.attributes.firstName || item.attributes.name || '')} {String(item.attributes.lastName || '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )

  // Render dictionary tab
  const renderDictionaryTab = () => {
    // Group dictionary items by category
    const dictionaryCategories: { name: string; icon: React.ElementType; color: string; keys: string[] }[] = [
      { name: 'Etats des entites', icon: CheckCircle, color: 'from-green-500 to-emerald-500', keys: ['candidateStates', 'resourceStates', 'opportunityStates', 'projectStates', 'companyStates', 'contactStates', 'positioningStates', 'actionStates'] },
      { name: 'Types des entites', icon: Target, color: 'from-blue-500 to-indigo-500', keys: ['candidateTypes', 'resourceTypes', 'opportunityTypes', 'projectTypes', 'companyTypes', 'actionTypes'] },
      { name: 'Modes', icon: Zap, color: 'from-amber-500 to-orange-500', keys: ['opportunityModes', 'projectModes'] },
      { name: 'References', icon: Book, color: 'from-purple-500 to-pink-500', keys: ['civilities', 'countries', 'currencies', 'languages', 'durationUnits'] },
      { name: 'Organisation', icon: Building2, color: 'from-cyan-500 to-teal-500', keys: ['agencies', 'poles'] },
      { name: 'Competences', icon: Briefcase, color: 'from-violet-500 to-purple-500', keys: ['expertises', 'expertiseLevels'] },
      { name: 'Sources & Origines', icon: Globe, color: 'from-rose-500 to-pink-500', keys: ['origins', 'sources'] },
    ]

    const formatKey = (key: string): string => {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace('States', '(Etats)')
        .replace('Types', '(Types)')
        .replace('Modes', '(Modes)')
    }

    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Dictionnaire BoondManager</h2>
                <p className="text-slate-500 dark:text-slate-400">Configuration et labels de {environment === 'production' ? 'Production' : 'Sandbox'}</p>
              </div>
            </div>
            <button
              onClick={() => fetchDictionary(true)}
              disabled={dictionaryLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {dictionaryLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Rafraichir
                </>
              )}
            </button>
          </div>

          {!dictionary && !dictionaryLoading && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Book className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Cliquez sur Rafraichir pour charger le dictionnaire</p>
            </div>
          )}

          {dictionary && (
            <div className="space-y-4">
              {dictionaryCategories.map((category) => {
                const hasData = category.keys.some(key => dictionary[key] && Array.isArray(dictionary[key]) && (dictionary[key] as DictionaryItem[]).length > 0)
                if (!hasData) return null

                const isExpanded = expandedSections.has(category.name)

                return (
                  <div key={category.name} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(category.name)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white">{category.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {category.keys.filter(key => dictionary[key] && Array.isArray(dictionary[key])).length} sections
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {category.keys.map(key => {
                          const items = dictionary[key]
                          if (!items || !Array.isArray(items) || items.length === 0) return null

                          return (
                            <div key={key} className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">{formatKey(key)}</h4>
                              <div className="flex flex-wrap gap-2">
                                {(items as DictionaryItem[]).map((item, index) => (
                                  <div
                                    key={`${item.id}-${index}`}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                  >
                                    {item.color && (
                                      <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                      />
                                    )}
                                    <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                                      {item.id}
                                    </span>
                                    <span className="text-slate-800 dark:text-white">
                                      {item.value}
                                    </span>
                                    {item.isDefault && (
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        defaut
                                      </span>
                                    )}
                                    {item.isActive === false && (
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                        inactif
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Show other uncategorized keys */}
              {Object.keys(dictionary).filter(key =>
                !dictionaryCategories.some(cat => cat.keys.includes(key)) &&
                Array.isArray(dictionary[key]) &&
                (dictionary[key] as DictionaryItem[]).length > 0
              ).length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection('other')}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-slate-500 to-gray-500">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-white">Autres</span>
                    </div>
                    {expandedSections.has('other') ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {expandedSections.has('other') && (
                    <div className="p-4 space-y-4">
                      {Object.keys(dictionary)
                        .filter(key =>
                          !dictionaryCategories.some(cat => cat.keys.includes(key)) &&
                          Array.isArray(dictionary[key]) &&
                          (dictionary[key] as DictionaryItem[]).length > 0
                        )
                        .map(key => {
                          const items = dictionary[key] as DictionaryItem[]
                          return (
                            <div key={key} className="space-y-2">
                              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">{formatKey(key)}</h4>
                              <div className="flex flex-wrap gap-2">
                                {items.map((item, index) => (
                                  <div
                                    key={`${item.id}-${index}`}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                                  >
                                    <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                                      {item.id}
                                    </span>
                                    <span className="text-slate-800 dark:text-white">
                                      {item.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render export tab
  const renderExportTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
            <Download className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Export des donnees</h2>
            <p className="text-slate-500 dark:text-slate-400">Exporter les donnees de {environment === 'production' ? 'Production' : 'Sandbox'} pour import manuel</p>
          </div>
        </div>

        {/* Export all */}
        <div className="mb-8">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Export complet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleExport('json', undefined, false)}
              disabled={exporting}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-500 transition group"
            >
              <FileJson className="w-10 h-10 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-white">JSON brut</p>
                <p className="text-sm text-slate-500">Toutes les donnees sans modification</p>
              </div>
            </button>
            <button
              onClick={() => handleExport('json', undefined, true)}
              disabled={exporting}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-500 transition group"
            >
              <div className="relative">
                <FileJson className="w-10 h-10 text-purple-500" />
                <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-white">JSON nettoye</p>
                <p className="text-sm text-slate-500">Donnees normalisees (noms, tel, emails)</p>
              </div>
            </button>
          </div>
        </div>

        {/* Export by entity */}
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Export par entite (CSV)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {['candidates', 'resources', 'opportunities', 'companies', 'contacts', 'projects'].map(entity => (
              <button
                key={entity}
                onClick={() => handleExport('csv', entity, true)}
                disabled={exporting}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition text-center"
              >
                <FileSpreadsheet className="w-6 h-6 mx-auto mb-1 text-slate-600 dark:text-slate-400" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{entity}</p>
              </button>
            ))}
          </div>
        </div>

        {exporting && (
          <div className="mt-6 flex items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generation de l&apos;export en cours...</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Instructions pour import en Production</h3>
        <ol className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-bold">1</span>
            <span>Synchronisez les donnees de Production vers la Sandbox</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">2</span>
            <span>Analysez la qualite des donnees et corrigez les problemes dans la Sandbox</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold">3</span>
            <span>Exportez les donnees nettoyees en JSON</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold">4</span>
            <span>Importez manuellement le fichier JSON dans BoondManager Production via l&apos;interface admin Boond</span>
          </li>
        </ol>
      </div>
    </div>
  )

  // Render list item
  const renderListItem = (item: BaseEntity) => {
    const attrs = item.attributes

    if (activeTab === 'candidates' || activeTab === 'resources' || activeTab === 'contacts') {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${
                activeTab === 'candidates' ? 'from-purple-500 to-pink-500' :
                activeTab === 'resources' ? 'from-blue-500 to-indigo-500' :
                'from-rose-500 to-pink-500'
              } flex items-center justify-center text-white font-bold`}>
                {String(attrs.firstName || '').charAt(0)}{String(attrs.lastName || '').charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  {String(attrs.firstName || '')} {String(attrs.lastName || '')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{String(attrs.title || attrs.position || 'Sans titre')}</p>
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
              {activeTab !== 'contacts' && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(attrs.state as number, activeTab)}`}>
                  {getStateLabel(attrs.state as number, activeTab)}
                </span>
              )}
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

    if (activeTab === 'opportunities' || activeTab === 'projects') {
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                activeTab === 'opportunities' ? 'from-green-500 to-emerald-500' : 'from-violet-500 to-purple-500'
              } flex items-center justify-center text-white`}>
                {activeTab === 'opportunities' ? <Target className="w-6 h-6" /> : <FolderKanban className="w-6 h-6" />}
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
                    <span className="font-medium text-emerald-600">
                      {String(attrs.averageDailyPriceExcludingTax)} EUR/j
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
              {canWrite && activeTab === 'opportunities' && (
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

    return null
  }

  // Render form fields
  const renderFormFields = () => {
    const isView = modalMode === 'view'

    if (activeTab === 'candidates' || activeTab === 'resources' || activeTab === 'contacts') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prenom</label>
              <input
                type="text"
                value={String(formData.firstName || '')}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
              <input
                type="text"
                value={String(formData.lastName || '')}
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
              value={String(formData.email || '')}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
            <input
              type="tel"
              value={String(formData.phone1 || '')}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {activeTab === 'contacts' ? 'Poste' : 'Titre'}
            </label>
            <input
              type="text"
              value={String(formData.title || formData.position || '')}
              onChange={(e) => setFormData({ ...formData, [activeTab === 'contacts' ? 'position' : 'title']: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
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
              value={String(formData.title || '')}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={String(formData.description || '')}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isView}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise resize-none disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date debut</label>
              <input
                type="date"
                value={String(formData.startDate || '')}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TJM (EUR)</label>
              <input
                type="number"
                value={String(formData.averageDailyPriceExcludingTax || '')}
                onChange={(e) => setFormData({ ...formData, averageDailyPriceExcludingTax: parseInt(e.target.value) })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
          </div>
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
              value={String(formData.name || '')}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isView}
              className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={String(formData.email || '')}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
              <input
                type="tel"
                value={String(formData.phone1 || '')}
                onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ville</label>
            <input
              type="text"
              value={String(formData.town || '')}
              onChange={(e) => setFormData({ ...formData, town: e.target.value })}
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
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">BoondManager Data Hub</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Synchronisation, nettoyage et export des donnees</p>
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

          {!['dashboard', 'sync', 'quality', 'export'].includes(activeTab) && canWrite && (
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
      <div className="space-y-2">
        {/* Tools tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.filter(t => t.section === 'overview' || t.section === 'tools').map((tab) => (
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
        {/* Data tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.filter(t => t.section === 'data').map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSearch('')
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'bg-white/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search (for data tabs) */}
      {!['dashboard', 'sync', 'quality', 'export'].includes(activeTab) && (
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
      {loading && !['dictionary', 'sync', 'quality', 'export'].includes(activeTab) ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
        </div>
      ) : activeTab === 'dashboard' ? (
        renderDashboard()
      ) : activeTab === 'dictionary' ? (
        renderDictionaryTab()
      ) : activeTab === 'sync' ? (
        renderSyncTab()
      ) : activeTab === 'quality' ? (
        renderQualityTab()
      ) : activeTab === 'export' ? (
        renderExportTab()
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
                  {modalMode === 'create' ? 'Nouveau' : modalMode === 'edit' ? 'Modifier' : 'Details'}
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
