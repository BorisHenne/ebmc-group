'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, Activity, TrendingUp } from 'lucide-react'

interface Stats {
  users: number
  messages: number
  visits: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, messages: 0, visits: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
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
    { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'bg-blue-500' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'bg-green-500' },
    { label: 'Visites', value: stats.visits, icon: Activity, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenue dans le backoffice EBMC GROUP</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? '-' : stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/admin/users"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Gérer les utilisateurs</p>
              <p className="text-sm text-gray-500">Ajouter, modifier, supprimer</p>
            </div>
          </a>
          <a
            href="/admin/messages"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <MessageSquare className="w-8 h-8 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Voir les messages</p>
              <p className="text-sm text-gray-500">Messages du formulaire contact</p>
            </div>
          </a>
        </div>
      </div>

      {/* Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Activité récente
        </h2>
        <div className="text-gray-500 text-center py-8">
          Aucune activité récente
        </div>
      </div>
    </div>
  )
}
