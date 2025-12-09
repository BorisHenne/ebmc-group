'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Briefcase,
  Users,
  TrendingUp,
  Euro,
  Search,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Building2,
  Calendar,
  Kanban
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
  AreaChart,
  Area
} from 'recharts'
import { OPPORTUNITY_STATES, RESOURCE_STATES } from '@/lib/boondmanager'

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
    updatedAt?: string
  }
}

interface Resource {
  id: number
  attributes: {
    firstName: string
    lastName: string
    email: string
    state: number
    stateLabel?: string
    title?: string
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
}

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']

const OPPORTUNITY_COLORS: Record<number, string> = {
  1: '#3b82f6', // En cours - blue
  2: '#10b981', // Gagnee - green
  3: '#ef4444', // Perdue - red
  4: '#94a3b8', // Abandonnee - gray
}

const RESOURCE_COLORS: Record<number, string> = {
  1: '#10b981', // Disponible - green
  2: '#3b82f6', // En mission - blue
  3: '#f59e0b', // Intercontrat - amber
  4: '#94a3b8', // Indisponible - gray
  5: '#ef4444', // Sorti - red
}

export default function CommercialDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'opportunities' | 'resources'>('opportunities')
  const [userName, setUserName] = useState<string>('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, opportunitiesRes, resourcesRes, userRes] = await Promise.all([
        fetch('/api/boondmanager?type=stats&demo=true', { credentials: 'include' }),
        fetch('/api/boondmanager?type=opportunities&demo=true', { credentials: 'include' }),
        fetch('/api/boondmanager?type=resources&demo=true', { credentials: 'include' }),
        fetch('/api/auth/me', { credentials: 'include' })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
        setIsDemo(statsData.demo)
      }

      if (opportunitiesRes.ok) {
        const opportunitiesData = await opportunitiesRes.json()
        setOpportunities(opportunitiesData.data || [])
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json()
        setResources(resourcesData.data || [])
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

  const filteredOpportunities = opportunities.filter(o =>
    o.attributes.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.attributes.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredResources = resources.filter(r =>
    `${r.attributes.firstName} ${r.attributes.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.attributes.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const opportunityPieData = stats?.opportunities?.byState
    ? Object.entries(stats.opportunities.byState).map(([state, count]) => ({
        name: OPPORTUNITY_STATES[parseInt(state)] || `Etat ${state}`,
        value: count,
        color: OPPORTUNITY_COLORS[parseInt(state)] || '#64748b'
      }))
    : []

  const resourcePieData = stats?.resources?.byState
    ? Object.entries(stats.resources.byState).map(([state, count]) => ({
        name: RESOURCE_STATES[parseInt(state)] || `Etat ${state}`,
        value: count,
        color: RESOURCE_COLORS[parseInt(state)] || '#64748b'
      }))
    : []

  // Calculate revenue metrics
  const totalDailyRate = opportunities.reduce((sum, o) => sum + (o.attributes.dailyRate || 0), 0)
  const avgDailyRate = opportunities.length > 0 ? Math.round(totalDailyRate / opportunities.length) : 0
  const wonOpportunities = opportunities.filter(o => o.attributes.state === 2).length
  const conversionRate = opportunities.length > 0 ? Math.round((wonOpportunities / opportunities.length) * 100) : 0

  // Revenue trend data
  const revenueTrend = stats?.monthlyActivity?.map(m => ({
    month: m.month,
    ca: m.placements * avgDailyRate * 20, // Estimate: placements * avg rate * 20 days
    objectif: avgDailyRate * 22 * 2 // Target: 2 placements per month
  })) || []

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
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userName ? `Bonjour ${userName}` : 'Dashboard Commercial'}
            </h1>
            <p className="text-gray-500">Suivi de vos opportunités et consultants</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
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
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +8%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.opportunities?.total || 0}</p>
          <p className="text-gray-500 text-sm mt-1">Opportunites totales</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
          <p className="text-gray-500 text-sm mt-1">Taux de conversion</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +5%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.resources?.total || 0}</p>
          <p className="text-gray-500 text-sm mt-1">Consultants</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Euro className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +10%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgDailyRate}€</p>
          <p className="text-gray-500 text-sm mt-1">TJM moyen</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-ebmc-turquoise" />
            Evolution du CA
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${(value/1000).toFixed(0)}k€`} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()}€`, '']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="ca" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCa)" name="CA realise" />
                <Line type="monotone" dataKey="objectif" stroke="#94a3b8" strokeDasharray="5 5" name="Objectif" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Opportunities & Resources Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'opportunities'
                  ? 'bg-ebmc-turquoise text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Opportunites
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'resources'
                  ? 'bg-ebmc-turquoise text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Consultants
            </button>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={activeTab === 'opportunities' ? opportunityPieData : resourcePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(activeTab === 'opportunities' ? opportunityPieData : resourcePieData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {(activeTab === 'opportunities' ? opportunityPieData : resourcePieData).map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-600">{entry.name}</span>
                  <span className="font-semibold text-gray-900 ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Performance Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-ebmc-turquoise" />
          Performance mensuelle
        </h3>
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
              <Bar dataKey="entretiens" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Entretiens clients" />
              <Bar dataKey="placements" fill="#10b981" radius={[4, 4, 0, 0]} name="Demarrages" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Mes opportunites
              </h3>
              <span className="text-sm text-gray-500">{opportunities.length} total</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {filteredOpportunities.slice(0, 8).map((opp) => (
              <div key={opp.id} className="p-4 hover:bg-gray-50/50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{opp.attributes.title}</p>
                    <p className="text-sm text-gray-500">{opp.attributes.reference || `#${opp.id}`}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {opp.attributes.dailyRate && (
                      <span className="text-sm font-semibold text-gray-700">{opp.attributes.dailyRate}€/j</span>
                    )}
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${OPPORTUNITY_COLORS[opp.attributes.state]}20`,
                        color: OPPORTUNITY_COLORS[opp.attributes.state]
                      }}
                    >
                      {OPPORTUNITY_STATES[opp.attributes.state] || `Etat ${opp.attributes.state}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resources List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Mes consultants
              </h3>
              <span className="text-sm text-gray-500">{resources.length} total</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {filteredResources.slice(0, 8).map((resource) => (
              <div key={resource.id} className="p-4 hover:bg-gray-50/50 transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                      {resource.attributes.firstName?.[0]}{resource.attributes.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {resource.attributes.firstName} {resource.attributes.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{resource.attributes.title || '-'}</p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: `${RESOURCE_COLORS[resource.attributes.state]}20`,
                      color: RESOURCE_COLORS[resource.attributes.state]
                    }}
                  >
                    {RESOURCE_STATES[resource.attributes.state] || `Etat ${resource.attributes.state}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
