'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
  Search,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Kanban,
  Filter,
  X,
  ChevronDown
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import { CANDIDATE_STATES } from '@/lib/boondmanager'

interface Candidate {
  id: number
  attributes: {
    firstName: string
    lastName: string
    email: string
    state: number
    stateLabel?: string
    title?: string
    source?: string
    phone?: string
    createdAt?: string
    updatedAt?: string
  }
}

interface DashboardStats {
  candidates: {
    total: number
    byState: Record<number, number>
  }
  resources: {
    total: number
    byState: Record<number, number>
  }
  opportunities: {
    total: number
    byState: Record<number, number>
  }
  monthlyActivity: Array<{
    month: string
    candidats: number
    entretiens: number
    placements: number
  }>
  funnel: Array<{
    stage: string
    count: number
  }>
  recentActivity: Array<{
    type: string
    action: string
    name: string
    time: string
  }>
}

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#6366f1']

const STATE_COLORS: Record<number, string> = {
  1: '#94a3b8', // A qualifier - gray
  2: '#06b6d4', // Qualifie - cyan
  3: '#8b5cf6', // En cours - purple
  4: '#f59e0b', // Entretien - amber
  5: '#3b82f6', // Proposition - blue
  6: '#10b981', // Embauche - green
  7: '#ef4444', // Refuse - red
  8: '#64748b', // Archive - slate
}

export default function SourceurDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userName, setUserName] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, candidatesRes, userRes] = await Promise.all([
        fetch('/api/boondmanager?type=stats&demo=true', { credentials: 'include' }),
        fetch('/api/boondmanager?type=candidates&demo=true', { credentials: 'include' }),
        fetch('/api/auth/me', { credentials: 'include' })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
        setIsDemo(statsData.demo)
      }

      if (candidatesRes.ok) {
        const candidatesData = await candidatesRes.json()
        setCandidates(candidatesData.data || [])
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setUserName(userData.user?.name || '')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Get unique sources for filter dropdown
  const uniqueSources = Array.from(new Set(candidates.map(c => c.attributes.source).filter(Boolean))) as string[]

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = searchQuery === '' ||
      `${c.attributes.firstName} ${c.attributes.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.attributes.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.attributes.title?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === null || c.attributes.state === statusFilter
    const matchesSource = sourceFilter === null || c.attributes.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const clearFilters = () => {
    setStatusFilter(null)
    setSourceFilter(null)
    setSearchQuery('')
  }

  const hasActiveFilters = statusFilter !== null || sourceFilter !== null || searchQuery !== ''

  const pieData = stats?.candidates?.byState
    ? Object.entries(stats.candidates.byState).map(([state, count]) => ({
        name: CANDIDATE_STATES[parseInt(state)] || `Etat ${state}`,
        value: count,
        color: STATE_COLORS[parseInt(state)] || '#64748b'
      }))
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userName ? `Bonjour ${userName}` : 'Dashboard Sourceur'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Suivi de vos candidats et activité de recrutement</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDemo && (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Mode Démo
            </span>
          )}
          <Link
            href="/admin/recrutement"
            className="flex items-center gap-2 px-4 py-2 bg-ebmc-turquoise text-white rounded-lg hover:bg-ebmc-turquoise/90 transition shadow-lg"
          >
            <Kanban className="w-4 h-4" />
            Parcours recrutement
          </Link>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.candidates?.total || 0}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Candidats totaux</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +8%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.candidates?.byState?.[3] || 0}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">En cours de process</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +5%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.candidates?.byState?.[4] || 0}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Entretiens planifies</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +15%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.candidates?.byState?.[6] || 0}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Placements</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activite mensuelle</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="candidats" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Candidats" />
                <Bar dataKey="entretiens" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Entretiens" />
                <Bar dataKey="placements" fill="#10b981" radius={[4, 4, 0, 0]} name="Placements" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Candidates by State Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Repartition par statut</h3>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-white ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Funnel and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-ebmc-turquoise" />
            Tunnel de recrutement
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="count"
                  data={stats?.funnel || []}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#374151" stroke="none" dataKey="stage" />
                  {(stats?.funnel || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-ebmc-turquoise" />
            Activite recente
          </h3>
          <div className="space-y-4">
            {(stats?.recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'candidate' ? 'bg-cyan-100' :
                  activity.type === 'interview' ? 'bg-purple-100' :
                  activity.type === 'placement' ? 'bg-green-100' :
                  'bg-blue-100'
                }`}>
                  {activity.type === 'candidate' && <UserPlus className="w-4 h-4 text-cyan-600" />}
                  {activity.type === 'interview' && <Calendar className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'placement' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {activity.type === 'opportunity' && <Target className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.name}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Search and Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
      >
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un candidat (nom, email, poste)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition ${
                showFilters || hasActiveFilters
                  ? 'bg-ebmc-turquoise text-white border-ebmc-turquoise'
                  : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-white dark:bg-slate-800/20 rounded-full text-xs">
                  {[statusFilter !== null, sourceFilter !== null].filter(Boolean).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-slate-700"
            >
              {/* Status Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Statut</label>
                <select
                  value={statusFilter ?? ''}
                  onChange={(e) => setStatusFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise min-w-[180px]"
                >
                  <option value="">Tous les statuts</option>
                  {Object.entries(CANDIDATE_STATES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Source</label>
                <select
                  value={sourceFilter ?? ''}
                  onChange={(e) => setSourceFilter(e.target.value || null)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise min-w-[180px]"
                >
                  <option value="">Toutes les sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                    Effacer les filtres
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Results count */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouve{filteredCandidates.length > 1 ? 's' : ''}</span>
              {statusFilter !== null && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs">
                  {CANDIDATE_STATES[statusFilter]}
                </span>
              )}
              {sourceFilter && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs">
                  {sourceFilter}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Candidates List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mes candidats</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{filteredCandidates.length} sur {candidates.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Candidat</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Poste</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Source</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.slice(0, 10).map((candidate) => (
                <tr key={candidate.id} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {candidate.attributes.firstName} {candidate.attributes.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.attributes.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">{candidate.attributes.title || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 dark:text-gray-400">{candidate.attributes.source || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${STATE_COLORS[candidate.attributes.state]}20`,
                        color: STATE_COLORS[candidate.attributes.state]
                      }}
                    >
                      {CANDIDATE_STATES[candidate.attributes.state] || `Etat ${candidate.attributes.state}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 rounded-lg transition">
                      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCandidates.length > 10 && (
          <div className="p-4 text-center border-t border-gray-100 dark:border-slate-700">
            <button className="text-ebmc-turquoise hover:underline text-sm font-medium">
              Voir tous les candidats ({filteredCandidates.length})
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
