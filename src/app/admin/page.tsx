'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  UserCheck,
  Mail,
  Database,
  Activity,
  Server,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
  HardDrive,
  Layers,
  FileText,
  Calendar,
  Settings,
  ExternalLink,
  BarChart3,
  PieChart as PieChartIcon,
  GitBranch,
  Webhook,
  Key,
  ChevronRight,
  Eye,
  Building2,
  UserPlus,
  MessageSquare,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts'

// Types
interface DashboardStats {
  overview: {
    totalUsers: number
    totalCandidates: number
    totalJobs: number
    activeJobs: number
    totalConsultants: number
    totalMessages: number
    totalTimesheets: number
    totalAbsences: number
    totalWebhooks: number
    totalApiTokens: number
  }
  recent: {
    candidatesLast30Days: number
    messagesLast30Days: number
  }
  distributions: {
    usersByRole: Record<string, number>
    candidatesByStatus: Record<string, number>
    consultantsByState: Record<string, number>
    consultantsByContract: Record<string, number>
    jobsByCategory: Record<string, number>
    topSkills: Record<string, number>
  }
  monthlyStats: Array<{
    month: string
    year: number
    candidates: number
    jobs: number
    messages: number
  }>
  syncs: Array<{
    date: string
    status: string
    records: number
    errors: number
  }>
  database: {
    collections: number
    dataSize: number
    storageSize: number
    indexes: number
    avgObjSize: number
  }
  timestamp: string
}

// Grafana color palette
const GRAFANA_COLORS = {
  green: '#73BF69',
  yellow: '#FADE2A',
  orange: '#FF9830',
  red: '#F2495C',
  blue: '#5794F2',
  purple: '#B877D9',
  cyan: '#8AB8FF',
  pink: '#FF85A1',
  teal: '#2BA3AD',
}

const STATUS_COLORS: Record<string, string> = {
  a_qualifier: GRAFANA_COLORS.yellow,
  qualifie: GRAFANA_COLORS.blue,
  en_cours: GRAFANA_COLORS.cyan,
  entretien: GRAFANA_COLORS.purple,
  proposition: GRAFANA_COLORS.orange,
  embauche: GRAFANA_COLORS.green,
  refuse: GRAFANA_COLORS.red,
  unknown: '#6B7280',
}

const STATUS_LABELS: Record<string, string> = {
  a_qualifier: 'A qualifier',
  qualifie: 'Qualifie',
  en_cours: 'En cours',
  entretien: 'Entretien',
  proposition: 'Proposition',
  embauche: 'Embauche',
  refuse: 'Refuse',
  unknown: 'Autre',
}

const ROLE_COLORS: Record<string, string> = {
  admin: GRAFANA_COLORS.red,
  commercial: GRAFANA_COLORS.blue,
  sourceur: GRAFANA_COLORS.purple,
  rh: GRAFANA_COLORS.yellow,
  consultant_cdi: GRAFANA_COLORS.teal,
  freelance: GRAFANA_COLORS.green,
  candidat: '#6B7280',
}

// Utility functions
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Panel component (Grafana style)
function Panel({
  title,
  children,
  className = '',
  icon: Icon,
  actions,
  noPadding = false,
}: {
  title: string
  children: React.ReactNode
  className?: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
  noPadding?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#181B1F] rounded-lg border border-[#2D3035] overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D3035] bg-[#1F2229]">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#8E9196]" />}
          <h3 className="text-sm font-medium text-white">{title}</h3>
        </div>
        {actions}
      </div>
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </motion.div>
  )
}

// Stat card component
function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  color,
  trend,
  link,
}: {
  label: string
  value: string | number
  subValue?: string
  icon: React.ComponentType<{ className?: string; color?: string; style?: React.CSSProperties }>
  color: string
  trend?: { value: number; positive: boolean }
  link?: string
}) {
  const content = (
    <div className="bg-[#181B1F] rounded-lg border border-[#2D3035] p-4 hover:border-[#3D4045] transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon className="w-5 h-5" color={color} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-[#73BF69]' : 'text-[#F2495C]'}`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
        {link && (
          <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-white transition-colors" />
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-[#8E9196]">{label}</p>
      {subValue && <p className="text-xs text-[#6B7280] mt-1">{subValue}</p>}
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }
  return content
}

// Status indicator
function StatusIndicator({ status }: { status: 'healthy' | 'warning' | 'error' }) {
  const colors = {
    healthy: 'bg-[#73BF69]',
    warning: 'bg-[#FADE2A]',
    error: 'bg-[#F2495C]',
  }
  return (
    <span className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
  )
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2229] border border-[#2D3035] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-[#8E9196] mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-white">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard-stats')
      if (!res.ok) throw new Error('Erreur de chargement')
      const data = await res.json()
      setStats(data)
      setError(null)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchStats])

  // Prepare chart data
  const pipelineData = stats?.distributions.candidatesByStatus
    ? Object.entries(stats.distributions.candidatesByStatus).map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        fill: STATUS_COLORS[status] || '#6B7280',
      }))
    : []

  const roleData = stats?.distributions.usersByRole
    ? Object.entries(stats.distributions.usersByRole).map(([role, count]) => ({
        name: role,
        value: count,
        fill: ROLE_COLORS[role] || '#6B7280',
      }))
    : []

  const skillsData = stats?.distributions.topSkills
    ? Object.entries(stats.distributions.topSkills)
        .slice(0, 8)
        .map(([skill, count]) => ({
          skill,
          count,
        }))
    : []

  const categoryData = stats?.distributions.jobsByCategory
    ? Object.entries(stats.distributions.jobsByCategory).map(([category, count]) => ({
        category,
        count,
      }))
    : []

  // Database health metrics
  const dbHealth = stats?.database
    ? [
        { name: 'Collections', value: stats.database.collections, fill: GRAFANA_COLORS.blue },
        { name: 'Indexes', value: stats.database.indexes, fill: GRAFANA_COLORS.green },
      ]
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111217] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2BA3AD] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8E9196]">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-[#111217] flex items-center justify-center">
        <div className="bg-[#181B1F] rounded-lg border border-[#F2495C] p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-[#F2495C]" />
            <h2 className="text-lg font-semibold text-white">Erreur de connexion</h2>
          </div>
          <p className="text-[#8E9196] mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="w-full px-4 py-2 bg-[#2BA3AD] text-white rounded-lg hover:bg-[#238A93] transition-colors"
          >
            Reessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111217] text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-[#2BA3AD]" />
            <span className="text-sm font-medium text-[#2BA3AD]">EBMC Dashboard</span>
            <StatusIndicator status="healthy" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Monitoring & Analytics</h1>
          <p className="text-[#8E9196] mt-1">Vue en temps reel des donnees MongoDB</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[#8E9196]">
            <Clock className="w-4 h-4" />
            <span>
              Mis a jour: {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg border transition-colors ${
              autoRefresh
                ? 'bg-[#2BA3AD]/20 border-[#2BA3AD] text-[#2BA3AD]'
                : 'bg-[#1F2229] border-[#2D3035] text-[#8E9196]'
            }`}
            title={autoRefresh ? 'Auto-refresh actif (30s)' : 'Auto-refresh desactive'}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          </button>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-[#2BA3AD] text-white rounded-lg hover:bg-[#238A93] transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          label="Utilisateurs"
          value={stats?.overview.totalUsers || 0}
          icon={Users}
          color={GRAFANA_COLORS.blue}
          link="/admin/users"
        />
        <StatCard
          label="Candidats"
          value={stats?.overview.totalCandidates || 0}
          subValue={`+${stats?.recent.candidatesLast30Days || 0} ce mois`}
          icon={UserPlus}
          color={GRAFANA_COLORS.purple}
          trend={stats?.recent.candidatesLast30Days ? { value: 12, positive: true } : undefined}
          link="/admin/candidats"
        />
        <StatCard
          label="Offres actives"
          value={stats?.overview.activeJobs || 0}
          subValue={`/ ${stats?.overview.totalJobs || 0} total`}
          icon={Briefcase}
          color={GRAFANA_COLORS.orange}
          link="/admin/jobs"
        />
        <StatCard
          label="Consultants"
          value={stats?.overview.totalConsultants || 0}
          icon={UserCheck}
          color={GRAFANA_COLORS.green}
          link="/admin/consultants"
        />
        <StatCard
          label="Messages"
          value={stats?.overview.totalMessages || 0}
          subValue={`+${stats?.recent.messagesLast30Days || 0} ce mois`}
          icon={MessageSquare}
          color={GRAFANA_COLORS.cyan}
          link="/admin/messages"
        />
        <StatCard
          label="Webhooks"
          value={stats?.overview.totalWebhooks || 0}
          icon={Webhook}
          color={GRAFANA_COLORS.pink}
          link="/admin/webhooks"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Monthly Activity */}
        <Panel
          title="Activite Mensuelle"
          icon={BarChart3}
          className="lg:col-span-2"
          actions={
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAFANA_COLORS.blue }} />
                Candidats
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAFANA_COLORS.green }} />
                Jobs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAFANA_COLORS.orange }} />
                Messages
              </span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats?.monthlyStats || []}>
              <defs>
                <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GRAFANA_COLORS.blue} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={GRAFANA_COLORS.blue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GRAFANA_COLORS.green} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={GRAFANA_COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3035" />
              <XAxis dataKey="month" tick={{ fill: '#8E9196', fontSize: 11 }} stroke="#2D3035" />
              <YAxis tick={{ fill: '#8E9196', fontSize: 11 }} stroke="#2D3035" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="candidates"
                name="Candidats"
                stroke={GRAFANA_COLORS.blue}
                fill="url(#colorCandidates)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="jobs"
                name="Jobs"
                stroke={GRAFANA_COLORS.green}
                fill="url(#colorJobs)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="messages"
                name="Messages"
                stroke={GRAFANA_COLORS.orange}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* Pipeline Distribution */}
        <Panel title="Pipeline Candidats" icon={PieChartIcon}>
          {pipelineData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pipelineData.slice(0, 6).map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-[#8E9196] truncate">{item.name}</span>
                    <span className="font-medium text-white ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-[#8E9196]">
              Aucune donnee
            </div>
          )}
        </Panel>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Skills Distribution */}
        <Panel title="Top Competences" icon={Zap}>
          {skillsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={skillsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3035" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#8E9196', fontSize: 11 }} stroke="#2D3035" />
                <YAxis
                  dataKey="skill"
                  type="category"
                  tick={{ fill: '#8E9196', fontSize: 11 }}
                  stroke="#2D3035"
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Candidats" fill={GRAFANA_COLORS.purple} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#8E9196]">
              Aucune donnee
            </div>
          )}
        </Panel>

        {/* Jobs by Category */}
        <Panel title="Offres par Categorie" icon={Briefcase}>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3035" />
                <XAxis dataKey="category" tick={{ fill: '#8E9196', fontSize: 11 }} stroke="#2D3035" />
                <YAxis tick={{ fill: '#8E9196', fontSize: 11 }} stroke="#2D3035" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Offres" fill={GRAFANA_COLORS.orange} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#8E9196]">
              Aucune donnee
            </div>
          )}
        </Panel>

        {/* Users by Role */}
        <Panel title="Utilisateurs par Role" icon={Users}>
          {roleData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {roleData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-[#8E9196] capitalize">{item.name}</span>
                    </div>
                    <span className="font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#8E9196]">
              Aucune donnee
            </div>
          )}
        </Panel>
      </div>

      {/* System Health Row */}
      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        {/* Database Stats */}
        <Panel title="Base de Donnees MongoDB" icon={Database} className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1F2229] rounded-lg p-4 text-center">
              <Layers className="w-6 h-6 mx-auto mb-2 text-[#5794F2]" />
              <p className="text-2xl font-bold">{stats?.database.collections || 0}</p>
              <p className="text-xs text-[#8E9196]">Collections</p>
            </div>
            <div className="bg-[#1F2229] rounded-lg p-4 text-center">
              <GitBranch className="w-6 h-6 mx-auto mb-2 text-[#73BF69]" />
              <p className="text-2xl font-bold">{stats?.database.indexes || 0}</p>
              <p className="text-xs text-[#8E9196]">Index</p>
            </div>
            <div className="bg-[#1F2229] rounded-lg p-4 text-center">
              <HardDrive className="w-6 h-6 mx-auto mb-2 text-[#FF9830]" />
              <p className="text-2xl font-bold">{formatBytes(stats?.database.dataSize || 0)}</p>
              <p className="text-xs text-[#8E9196]">Taille donnees</p>
            </div>
            <div className="bg-[#1F2229] rounded-lg p-4 text-center">
              <Server className="w-6 h-6 mx-auto mb-2 text-[#B877D9]" />
              <p className="text-2xl font-bold">{formatBytes(stats?.database.storageSize || 0)}</p>
              <p className="text-xs text-[#8E9196]">Stockage</p>
            </div>
          </div>
        </Panel>

        {/* Recent Syncs */}
        <Panel title="Synchronisations Recentes" icon={RefreshCw} noPadding className="lg:col-span-2">
          {stats?.syncs && stats.syncs.length > 0 ? (
            <div className="divide-y divide-[#2D3035]">
              {stats.syncs.map((sync, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-[#1F2229]">
                  <div className="flex items-center gap-3">
                    {sync.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-[#73BF69]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#F2495C]" />
                    )}
                    <div>
                      <p className="text-sm text-white">
                        {new Date(sync.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-[#8E9196]">{sync.records} enregistrements</p>
                    </div>
                  </div>
                  {sync.errors > 0 && (
                    <span className="px-2 py-1 bg-[#F2495C]/20 text-[#F2495C] text-xs rounded">
                      {sync.errors} erreurs
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-[#8E9196]">
              Aucune synchronisation
            </div>
          )}
        </Panel>
      </div>

      {/* Quick Links */}
      <Panel title="Acces Rapide" icon={Zap}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { href: '/admin/recrutement', icon: Users, label: 'Recrutement', color: GRAFANA_COLORS.purple },
            { href: '/admin/candidats', icon: UserPlus, label: 'Candidats', color: GRAFANA_COLORS.blue },
            { href: '/admin/jobs', icon: Briefcase, label: 'Offres', color: GRAFANA_COLORS.orange },
            { href: '/admin/consultants', icon: UserCheck, label: 'Consultants', color: GRAFANA_COLORS.green },
            { href: '/admin/boondmanager-v2', icon: Building2, label: 'BoondManager', color: GRAFANA_COLORS.cyan },
            { href: '/admin/database', icon: Database, label: 'Database', color: GRAFANA_COLORS.pink },
            { href: '/admin/users', icon: Users, label: 'Utilisateurs', color: GRAFANA_COLORS.yellow },
            { href: '/admin/messages', icon: Mail, label: 'Messages', color: GRAFANA_COLORS.red },
            { href: '/admin/webhooks', icon: Webhook, label: 'Webhooks', color: GRAFANA_COLORS.purple },
            { href: '/admin/api-tokens', icon: Key, label: 'API Tokens', color: GRAFANA_COLORS.teal },
            { href: '/admin/settings', icon: Settings, label: 'Settings', color: '#6B7280' },
            { href: '/admin/docs', icon: FileText, label: 'Documentation', color: GRAFANA_COLORS.blue },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-3 rounded-lg bg-[#1F2229] border border-[#2D3035] hover:border-[#3D4045] hover:bg-[#252830] transition-all group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${link.color}20`, color: link.color }}
              >
                <link.icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-[#8E9196] group-hover:text-white transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>
      </Panel>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-[#6B7280]">
        <p>EBMC GROUP Dashboard v2.0 - Donnees actualisees depuis MongoDB</p>
        <p className="mt-1">
          Derniere mise a jour: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString('fr-FR') : '-'}
        </p>
      </div>
    </div>
  )
}
