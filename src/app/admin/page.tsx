'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  Briefcase,
  UserCheck,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react'
import { TextGradient } from '@/components/ui/aceternity'

interface Stats {
  users: number
  messages: number
  visits: number
  jobs?: number
  consultants?: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, messages: 0, visits: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Utilisateurs', value: stats.users, icon: Users, gradient: 'from-blue-500 to-indigo-500', bgLight: 'bg-blue-50' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, gradient: 'from-green-500 to-emerald-500', bgLight: 'bg-green-50' },
    { label: 'Visites', value: stats.visits, icon: Activity, gradient: 'from-purple-500 to-pink-500', bgLight: 'bg-purple-50' },
  ]

  const quickActions = [
    { href: '/admin/jobs', icon: Briefcase, label: 'Offres d\'emploi', desc: 'Gérer les offres', gradient: 'from-ebmc-turquoise to-cyan-500' },
    { href: '/admin/consultants', icon: UserCheck, label: 'Consultants', desc: 'Voir les profils', gradient: 'from-purple-500 to-pink-500' },
    { href: '/admin/users', icon: Users, label: 'Utilisateurs', desc: 'Gérer les accès', gradient: 'from-blue-500 to-indigo-500' },
    { href: '/admin/messages', icon: MessageSquare, label: 'Messages', desc: 'Lire les messages', gradient: 'from-green-500 to-emerald-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-ebmc-turquoise to-cyan-400">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-ebmc-turquoise">Vue d&apos;ensemble</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            <TextGradient animate={false}>Dashboard</TextGradient>
          </h1>
          <p className="text-slate-500 mt-2">Bienvenue dans le backoffice EBMC GROUP</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card p-6 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`px-2.5 py-1 rounded-full ${stat.bgLight} text-xs font-medium text-slate-600`}>
                +0%
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-4xl font-bold text-slate-800 mt-1">
                {loading ? (
                  <span className="inline-block w-16 h-10 bg-slate-200 rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Actions rapides</h2>
          <Link
            href="/admin/settings"
            className="text-sm text-ebmc-turquoise hover:text-ebmc-turquoise-dark flex items-center gap-1 transition"
          >
            Tous les paramètres
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col p-5 rounded-xl border border-slate-200/60 bg-white/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-slate-800 group-hover:text-ebmc-turquoise transition-colors">
                  {action.label}
                </p>
                <p className="text-sm text-slate-500 mt-1">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-ebmc-turquoise to-cyan-400">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Activité récente</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Aucune activité récente</p>
          <p className="text-slate-400 text-sm mt-1">Les nouvelles activités apparaîtront ici</p>
        </div>
      </motion.div>
    </div>
  )
}
