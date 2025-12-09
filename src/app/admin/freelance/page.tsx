'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, Calendar, CheckCircle, AlertCircle, ArrowRight, User, Building2 } from 'lucide-react'

interface UserInfo {
  id: string
  email: string
  name?: string
  boondManagerId?: number
  boondManagerSubdomain?: string
}

interface TimesheetSummary {
  pending: number
  validated: number
  currentMonth: string
}

interface AbsenceSummary {
  pending: number
  approved: number
  remaining: number
}

export default function FreelancePortalPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [timesheetSummary, setTimesheetSummary] = useState<TimesheetSummary>({
    pending: 0,
    validated: 0,
    currentMonth: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  })
  const [absenceSummary, setAbsenceSummary] = useState<AbsenceSummary>({
    pending: 0,
    approved: 0,
    remaining: 25
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userRes = await fetch('/api/auth/me', { credentials: 'include' })
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)

          // If user has BoondManager ID, fetch their data
          if (userData.user.boondManagerId) {
            // Fetch timesheet summary
            const timesheetRes = await fetch('/api/freelance/timesheets/summary', { credentials: 'include' })
            if (timesheetRes.ok) {
              const timesheetData = await timesheetRes.json()
              setTimesheetSummary(timesheetData)
            }

            // Fetch absence summary
            const absenceRes = await fetch('/api/freelance/absences/summary', { credentials: 'include' })
            if (absenceRes.ok) {
              const absenceData = await absenceRes.json()
              setAbsenceSummary(absenceData)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const cards = [
    {
      title: 'Mes CRA',
      description: 'Saisissez et soumettez vos comptes rendus d\'activité',
      icon: Clock,
      href: '/admin/freelance/timesheets',
      color: 'from-blue-500 to-indigo-500',
      stats: [
        { label: 'En attente', value: timesheetSummary.pending, icon: AlertCircle },
        { label: 'Validés', value: timesheetSummary.validated, icon: CheckCircle },
      ]
    },
    {
      title: 'Mes Absences',
      description: 'Gérez vos demandes de congés et absences',
      icon: Calendar,
      href: '/admin/freelance/absences',
      color: 'from-purple-500 to-pink-500',
      stats: [
        { label: 'En attente', value: absenceSummary.pending, icon: AlertCircle },
        { label: 'Jours restants', value: absenceSummary.remaining, icon: CheckCircle },
      ]
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ebmc-turquoise"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bienvenue, {user?.name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Portail Freelance EBMC GROUP</p>
          </div>
        </motion.div>

        {/* BoondManager connection status */}
        {user?.boondManagerId ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl w-fit"
          >
            <Building2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">
              Connecté à BoondManager ({user.boondManagerSubdomain})
            </span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl w-fit"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              Compte non lié à BoondManager - Fonctionnalités limitées
            </span>
          </motion.div>
        )}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-ebmc-turquoise to-cyan-500 rounded-2xl p-6 mb-8 text-white"
      >
        <h2 className="text-lg font-semibold mb-4 opacity-90">Résumé du mois - {timesheetSummary.currentMonth}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-xl p-4">
            <p className="text-sm opacity-80">CRA en attente</p>
            <p className="text-3xl font-bold">{timesheetSummary.pending}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <p className="text-sm opacity-80">CRA validés</p>
            <p className="text-3xl font-bold">{timesheetSummary.validated}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <p className="text-sm opacity-80">Absences en attente</p>
            <p className="text-3xl font-bold">{absenceSummary.pending}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <p className="text-sm opacity-80">Jours de congés</p>
            <p className="text-3xl font-bold">{absenceSummary.remaining}</p>
          </div>
        </div>
      </motion.div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Link href={card.href}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-ebmc-turquoise group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{card.description}</p>

                <div className="flex gap-4">
                  {card.stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <stat.icon className={`w-4 h-4 ${stat.label.includes('attente') ? 'text-amber-500' : 'text-green-500'}`} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">{stat.value}</span> {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gray-50 dark:bg-slate-800 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Besoin d&apos;aide ?</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Pour toute question concernant vos CRA ou vos absences, contactez votre gestionnaire RH ou envoyez un email à{' '}
          <a href="mailto:rh@ebmcgroup.eu" className="text-ebmc-turquoise hover:underline">
            rh@ebmcgroup.eu
          </a>
        </p>
      </motion.div>
    </div>
  )
}
