'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Briefcase, Target, Search, Plus, Edit, Trash2, X, Check,
  Loader2, AlertCircle, Phone, Mail, Calendar, Building2, RefreshCw
} from 'lucide-react'
import { CANDIDATE_STATES, RESOURCE_STATES, OPPORTUNITY_STATES } from '@/lib/boondmanager'

type TabType = 'candidates' | 'resources' | 'opportunities'

interface Candidate {
  id: number
  attributes: {
    firstName: string
    lastName: string
    email: string
    civility: string
    state: number
    stateLabel?: string
    title?: string
    phone?: string
    source?: string
    createdAt?: string
  }
}

interface Resource {
  id: number
  attributes: {
    firstName: string
    lastName: string
    email: string
    civility: string
    state: number
    stateLabel?: string
    title?: string
    phone?: string
    createdAt?: string
  }
}

interface Opportunity {
  id: number
  attributes: {
    title: string
    reference?: string
    state: number
    stateLabel?: string
    description?: string
    startDate?: string
    dailyRate?: number
    createdAt?: string
  }
}

type FormData = {
  firstName?: string
  lastName?: string
  email?: string
  civility?: string
  title?: string
  phone?: string
  source?: string
  state?: number
  reference?: string
  description?: string
  startDate?: string
  dailyRate?: number
}

export default function BoondManagerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('candidates')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedItem, setSelectedItem] = useState<Candidate | Resource | Opportunity | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [isBoondConnected, setIsBoondConnected] = useState(false)

  const tabs = [
    { id: 'candidates' as TabType, label: 'Candidats', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'resources' as TabType, label: 'Ressources', icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
    { id: 'opportunities' as TabType, label: 'Opportunites', icon: Target, color: 'from-green-500 to-emerald-500' },
  ]

  const checkBoondConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setIsBoondConnected(!!data.user?.boondManagerId)
      }
    } catch {
      setIsBoondConnected(false)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = `/api/boondmanager/${activeTab}${search ? `?search=${encodeURIComponent(search)}` : ''}`
      const res = await fetch(endpoint, { credentials: 'include' })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de chargement')
      }

      const data = await res.json()

      switch (activeTab) {
        case 'candidates':
          setCandidates(data.data || [])
          break
        case 'resources':
          setResources(data.data || [])
          break
        case 'opportunities':
          setOpportunities(data.data || [])
          break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    checkBoondConnection()
  }, [checkBoondConnection])

  useEffect(() => {
    if (isBoondConnected) {
      fetchData()
    }
  }, [fetchData, isBoondConnected])

  const handleCreate = () => {
    setModalMode('create')
    setSelectedItem(null)
    setFormData({})
    setShowModal(true)
  }

  const handleEdit = (item: Candidate | Resource | Opportunity) => {
    setModalMode('edit')
    setSelectedItem(item)
    if (activeTab === 'opportunities') {
      const opp = item as Opportunity
      setFormData({
        title: opp.attributes.title,
        reference: opp.attributes.reference,
        description: opp.attributes.description,
        startDate: opp.attributes.startDate,
        dailyRate: opp.attributes.dailyRate,
        state: opp.attributes.state,
      })
    } else {
      const person = item as Candidate | Resource
      setFormData({
        firstName: person.attributes.firstName,
        lastName: person.attributes.lastName,
        email: person.attributes.email,
        civility: person.attributes.civility,
        title: person.attributes.title,
        phone: person.attributes.phone,
        state: person.attributes.state,
        ...('source' in person.attributes ? { source: person.attributes.source } : {}),
      })
    }
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cet element ?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/boondmanager/${activeTab}?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de suppression')
      }

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

      const res = await fetch(`/api/boondmanager/${activeTab}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de sauvegarde')
      }

      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const getStateColor = (state: number, type: TabType) => {
    if (type === 'candidates') {
      const colors: Record<number, string> = {
        1: 'bg-slate-100 text-slate-700',
        2: 'bg-cyan-100 text-cyan-700',
        3: 'bg-purple-100 text-purple-700',
        4: 'bg-amber-100 text-amber-700',
        5: 'bg-blue-100 text-blue-700',
        6: 'bg-green-100 text-green-700',
        7: 'bg-red-100 text-red-700',
        8: 'bg-gray-100 text-gray-700',
      }
      return colors[state] || 'bg-gray-100 text-gray-700'
    }
    if (type === 'resources') {
      const colors: Record<number, string> = {
        1: 'bg-green-100 text-green-700',
        2: 'bg-blue-100 text-blue-700',
        3: 'bg-amber-100 text-amber-700',
        4: 'bg-red-100 text-red-700',
        5: 'bg-gray-100 text-gray-700',
      }
      return colors[state] || 'bg-gray-100 text-gray-700'
    }
    if (type === 'opportunities') {
      const colors: Record<number, string> = {
        1: 'bg-blue-100 text-blue-700',
        2: 'bg-green-100 text-green-700',
        3: 'bg-red-100 text-red-700',
        4: 'bg-gray-100 text-gray-700',
      }
      return colors[state] || 'bg-gray-100 text-gray-700'
    }
    return 'bg-gray-100 text-gray-700'
  }

  if (!isBoondConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Connexion BoondManager requise</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Pour acceder aux donnees BoondManager, vous devez vous connecter avec vos identifiants BoondManager.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Deconnectez-vous et reconnectez-vous via l&apos;onglet BoondManager sur la page de connexion.
          </p>
        </div>
      </div>
    )
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
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestion des donnees BoondManager</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white rounded-lg hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          Nouveau
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* Search and Refresh */}
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
      ) : (
        <div className="grid gap-4">
          {activeTab === 'candidates' && candidates.map((candidate) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {candidate.attributes.firstName?.charAt(0)}{candidate.attributes.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      {candidate.attributes.firstName} {candidate.attributes.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{candidate.attributes.title || 'Sans titre'}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {candidate.attributes.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {candidate.attributes.email}
                        </span>
                      )}
                      {candidate.attributes.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {candidate.attributes.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(candidate.attributes.state, 'candidates')}`}>
                    {CANDIDATE_STATES[candidate.attributes.state] || candidate.attributes.stateLabel}
                  </span>
                  <button onClick={() => handleEdit(candidate)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(candidate.id)}
                    disabled={deleting === candidate.id}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    {deleting === candidate.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {activeTab === 'resources' && resources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {resource.attributes.firstName?.charAt(0)}{resource.attributes.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      {resource.attributes.firstName} {resource.attributes.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{resource.attributes.title || 'Sans titre'}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {resource.attributes.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {resource.attributes.email}
                        </span>
                      )}
                      {resource.attributes.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {resource.attributes.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(resource.attributes.state, 'resources')}`}>
                    {RESOURCE_STATES[resource.attributes.state] || resource.attributes.stateLabel}
                  </span>
                  <button onClick={() => handleEdit(resource)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    disabled={deleting === resource.id}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    {deleting === resource.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {activeTab === 'opportunities' && opportunities.map((opportunity) => (
            <motion.div
              key={opportunity.id}
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
                    <h3 className="font-semibold text-slate-800 dark:text-white">{opportunity.attributes.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{opportunity.attributes.reference || 'Sans reference'}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {opportunity.attributes.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {opportunity.attributes.startDate}
                        </span>
                      )}
                      {opportunity.attributes.dailyRate && (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {opportunity.attributes.dailyRate} EUR/j
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(opportunity.attributes.state, 'opportunities')}`}>
                    {OPPORTUNITY_STATES[opportunity.attributes.state] || opportunity.attributes.stateLabel}
                  </span>
                  <button onClick={() => handleEdit(opportunity)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(opportunity.id)}
                    disabled={deleting === opportunity.id}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    {deleting === opportunity.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {!loading && (
            (activeTab === 'candidates' && candidates.length === 0) ||
            (activeTab === 'resources' && resources.length === 0) ||
            (activeTab === 'opportunities' && opportunities.length === 0)
          ) && (
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
                  {modalMode === 'create' ? 'Nouveau' : 'Modifier'} {activeTab === 'candidates' ? 'candidat' : activeTab === 'resources' ? 'ressource' : 'opportunite'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              <div className="space-y-4">
                {activeTab !== 'opportunities' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prenom</label>
                        <input
                          type="text"
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                        <input
                          type="text"
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre / Poste</label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telephone</label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                      />
                    </div>
                    {activeTab === 'candidates' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source</label>
                        <select
                          value={formData.source || ''}
                          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                        >
                          <option value="">Selectionner...</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Indeed">Indeed</option>
                          <option value="Site Web">Site Web</option>
                          <option value="Cooptation">Cooptation</option>
                          <option value="CVtheque">CVtheque</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                    )}
                    {modalMode === 'edit' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                        <select
                          value={formData.state || 1}
                          onChange={(e) => setFormData({ ...formData, state: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                        >
                          {Object.entries(activeTab === 'candidates' ? CANDIDATE_STATES : RESOURCE_STATES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre</label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference</label>
                      <input
                        type="text"
                        value={formData.reference || ''}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de debut</label>
                        <input
                          type="date"
                          value={formData.startDate || ''}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TJM (EUR)</label>
                        <input
                          type="number"
                          value={formData.dailyRate || ''}
                          onChange={(e) => setFormData({ ...formData, dailyRate: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                        />
                      </div>
                    </div>
                    {modalMode === 'edit' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                        <select
                          value={formData.state || 1}
                          onChange={(e) => setFormData({ ...formData, state: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise"
                        >
                          {Object.entries(OPPORTUNITY_STATES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
