'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  Briefcase,
  UserCheck,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Euro,
  Calendar,
  Clock,
  Search,
  Building2,
  Award,
  BarChart3
} from 'lucide-react'
import { TextGradient } from '@/components/ui/aceternity'
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
  Legend
} from 'recharts'

// Types for dashboard data
interface TeamMember {
  id: string
  name: string
  role: 'sourceur' | 'commercial'
  avatar?: string
  stats: {
    candidatesSourced?: number
    candidatesPlaced?: number
    conversionRate?: number
    opportunities?: number
    dealsWon?: number
    revenue?: number
    avgDealSize?: number
  }
}

interface DashboardStats {
  totalCandidates: number
  candidatesThisMonth: number
  candidatesGrowth: number
  totalConsultants: number
  consultantsActive: number
  totalOpportunities: number
  opportunitiesWon: number
  conversionRate: number
  avgTJM: number
  totalRevenue: number
  revenueGrowth: number
}

// Demo data for charts
const monthlyData = [
  { month: 'Jan', candidats: 45, embauches: 8, opportunites: 12 },
  { month: 'Fév', candidats: 52, embauches: 10, opportunites: 15 },
  { month: 'Mar', candidats: 61, embauches: 12, opportunites: 18 },
  { month: 'Avr', candidats: 48, embauches: 9, opportunites: 14 },
  { month: 'Mai', candidats: 55, embauches: 11, opportunites: 16 },
  { month: 'Juin', candidats: 67, embauches: 14, opportunites: 20 },
  { month: 'Juil', candidats: 58, embauches: 12, opportunites: 17 },
  { month: 'Août', candidats: 42, embauches: 8, opportunites: 11 },
  { month: 'Sep', candidats: 71, embauches: 15, opportunites: 22 },
  { month: 'Oct', candidats: 65, embauches: 13, opportunites: 19 },
  { month: 'Nov', candidats: 78, embauches: 16, opportunites: 24 },
  { month: 'Déc', candidats: 54, embauches: 11, opportunites: 15 },
]

const pipelineData = [
  { name: 'À qualifier', value: 45, color: '#94a3b8' },
  { name: 'Qualifié', value: 32, color: '#06b6d4' },
  { name: 'En cours', value: 28, color: '#8b5cf6' },
  { name: 'Entretien', value: 18, color: '#f59e0b' },
  { name: 'Proposition', value: 12, color: '#3b82f6' },
  { name: 'Embauché', value: 8, color: '#10b981' },
]

const moduleStats = [
  { module: 'SAP FI CO', candidates: 45, placements: 12 },
  { module: 'SAP SD', candidates: 38, placements: 9 },
  { module: 'SAP MM', candidates: 32, placements: 8 },
  { module: 'SAP PP', candidates: 25, placements: 6 },
  { module: 'SAP ABAP', candidates: 28, placements: 7 },
  { module: 'S/4HANA', candidates: 22, placements: 5 },
]

// Demo team members
const sourceurs: TeamMember[] = [
  { id: 's1', name: 'Marie Dupont', role: 'sourceur', stats: { candidatesSourced: 156, candidatesPlaced: 28, conversionRate: 18 } },
  { id: 's2', name: 'Thomas Martin', role: 'sourceur', stats: { candidatesSourced: 142, candidatesPlaced: 24, conversionRate: 17 } },
  { id: 's3', name: 'Sophie Bernard', role: 'sourceur', stats: { candidatesSourced: 128, candidatesPlaced: 22, conversionRate: 17 } },
  { id: 's4', name: 'Lucas Petit', role: 'sourceur', stats: { candidatesSourced: 98, candidatesPlaced: 15, conversionRate: 15 } },
]

const commerciaux: TeamMember[] = [
  { id: 'c1', name: 'Alexandre Leroy', role: 'commercial', stats: { opportunities: 45, dealsWon: 18, revenue: 892000, avgDealSize: 49500 } },
  { id: 'c2', name: 'Julie Moreau', role: 'commercial', stats: { opportunities: 38, dealsWon: 15, revenue: 745000, avgDealSize: 49700 } },
  { id: 'c3', name: 'Nicolas Garcia', role: 'commercial', stats: { opportunities: 32, dealsWon: 12, revenue: 584000, avgDealSize: 48700 } },
  { id: 'c4', name: 'Camille Roux', role: 'commercial', stats: { opportunities: 28, dealsWon: 10, revenue: 478000, avgDealSize: 47800 } },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 524,
    candidatesThisMonth: 78,
    candidatesGrowth: 12.5,
    totalConsultants: 89,
    consultantsActive: 72,
    totalOpportunities: 143,
    opportunitiesWon: 55,
    conversionRate: 38.5,
    avgTJM: 685,
    totalRevenue: 2699000,
    revenueGrowth: 18.3,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const kpiCards = [
    {
      label: 'Candidats totaux',
      value: stats.totalCandidates,
      change: stats.candidatesGrowth,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Consultants actifs',
      value: stats.consultantsActive,
      subValue: `/ ${stats.totalConsultants} total`,
      icon: UserCheck,
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Taux de conversion',
      value: `${stats.conversionRate}%`,
      change: 2.3,
      icon: Target,
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'TJM moyen',
      value: `${stats.avgTJM}€`,
      change: 5.2,
      icon: Euro,
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      label: 'CA généré',
      value: `${(stats.totalRevenue / 1000000).toFixed(2)}M€`,
      change: stats.revenueGrowth,
      icon: TrendingUp,
      gradient: 'from-ebmc-turquoise to-cyan-500',
      bgLight: 'bg-cyan-50 dark:bg-cyan-900/20'
    },
    {
      label: 'Opportunités gagnées',
      value: stats.opportunitiesWon,
      subValue: `/ ${stats.totalOpportunities} total`,
      icon: Award,
      gradient: 'from-rose-500 to-red-500',
      bgLight: 'bg-rose-50 dark:bg-rose-900/20'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-ebmc-turquoise to-cyan-400">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-ebmc-turquoise">Dashboard Admin</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
            <TextGradient animate={false}>Vue d&apos;ensemble</TextGradient>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Performance globale de l&apos;équipe EBMC GROUP</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          <span>Mis à jour: {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${kpi.bgLight} rounded-xl p-4 border border-slate-200/60 dark:border-slate-700`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${kpi.gradient}`}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
              {kpi.change !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${kpi.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {kpi.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(kpi.change)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '...' : kpi.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {kpi.label}
              {kpi.subValue && <span className="ml-1 text-slate-400">{kpi.subValue}</span>}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Activité annuelle</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-500 dark:text-slate-400">Candidats</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-500 dark:text-slate-400">Embauches</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-500 dark:text-slate-400">Opportunités</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorCandidats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEmbauches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="candidats" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCandidats)" strokeWidth={2} />
              <Area type="monotone" dataKey="embauches" stroke="#10b981" fillOpacity={1} fill="url(#colorEmbauches)" strokeWidth={2} />
              <Area type="monotone" dataKey="opportunites" stroke="#8b5cf6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pipeline Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700"
        >
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Pipeline de recrutement</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pipelineData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pipelineData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                <span className="font-medium text-slate-800 dark:text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Team Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sourceurs Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Performance Sourceurs</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Classement par candidats placés</p>
              </div>
            </div>
            <Link href="/admin/sourceur" className="text-sm text-ebmc-turquoise hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {sourceurs.map((member, index) => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                  index === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
                  index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                  'bg-slate-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 dark:text-white">{member.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {member.stats.candidatesSourced} sourcés • {member.stats.conversionRate}% conversion
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{member.stats.candidatesPlaced}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">placés</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Commerciaux Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Performance Commerciaux</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Classement par CA généré</p>
              </div>
            </div>
            <Link href="/admin/commercial" className="text-sm text-ebmc-turquoise hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {commerciaux.map((member, index) => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                  index === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
                  index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                  'bg-slate-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 dark:text-white">{member.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {member.stats.dealsWon}/{member.stats.opportunities} deals • TJM moy: {member.stats.avgDealSize?.toLocaleString()}€
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{(member.stats.revenue! / 1000).toFixed(0)}k€</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">CA</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modules Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/60 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Compétences SAP les plus demandées</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Répartition par module</p>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={moduleStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis dataKey="module" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="candidates" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Candidats" />
            <Bar dataKey="placements" fill="#10b981" radius={[0, 4, 4, 0]} name="Placements" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { href: '/admin/recrutement', icon: Users, label: 'Kanban Recrutement', desc: 'Gérer le pipeline', gradient: 'from-purple-500 to-indigo-500' },
          { href: '/admin/sourceur', icon: Search, label: 'Espace Sourceur', desc: 'Rechercher des talents', gradient: 'from-blue-500 to-cyan-500' },
          { href: '/admin/commercial', icon: Building2, label: 'Espace Commercial', desc: 'Gérer les opportunités', gradient: 'from-green-500 to-emerald-500' },
          { href: '/admin/consultants', icon: UserCheck, label: 'Consultants', desc: 'Voir les profils', gradient: 'from-amber-500 to-orange-500' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white group-hover:text-ebmc-turquoise transition-colors">
                {action.label}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{action.desc}</p>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
