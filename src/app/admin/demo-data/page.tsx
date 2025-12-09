'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  RefreshCw,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  UserCheck,
  MessageSquare,
  Users,
  Download,
  RotateCcw
} from 'lucide-react'

interface DemoDataStatus {
  counts: {
    jobs: number
    consultants: number
    messages: number
    users: number
  }
  samples: {
    jobs: Array<{ id: string; title: string; active: boolean }>
    consultants: Array<{ id: string; name: string; available: boolean }>
  }
  defaultDataAvailable: {
    jobs: number
    consultants: number
  }
}

export default function DemoDataPage() {
  const [status, setStatus] = useState<DemoDataStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/demo-data', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (action: string, options: Record<string, unknown> = {}) => {
    setActionLoading(action)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, ...options }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: getSuccessMessage(action, data.results) })
        await fetchStatus()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'opération' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setActionLoading(null)
    }
  }

  const getSuccessMessage = (action: string, results: Record<string, unknown>) => {
    switch (action) {
      case 'seed':
        return 'Données de démo ajoutées avec succès'
      case 'reset':
        return 'Données réinitialisées aux valeurs par défaut'
      case 'clear':
        return 'Données supprimées avec succès'
      default:
        return JSON.stringify(results)
    }
  }

  const stats = [
    { label: 'Offres d\'emploi', value: status?.counts.jobs || 0, icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
    { label: 'Consultants', value: status?.counts.consultants || 0, icon: UserCheck, color: 'from-purple-500 to-pink-500' },
    { label: 'Messages', value: status?.counts.messages || 0, icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
    { label: 'Utilisateurs', value: status?.counts.users || 0, icon: Users, color: 'from-orange-500 to-amber-500' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Données de démonstration</h1>
          <p className="text-gray-600 mt-2">Gérez les données de démo pour le site vitrine</p>
        </div>
        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {message.text}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-5 shadow-sm"
          >
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-r ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Seed Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ajouter les données</h3>
              <p className="text-sm text-gray-500">Seed si collections vides</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Ajoute {status?.defaultDataAvailable.jobs} offres et {status?.defaultDataAvailable.consultants} consultants par défaut si les collections sont vides.
          </p>
          <button
            onClick={() => performAction('seed')}
            disabled={actionLoading !== null}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {actionLoading === 'seed' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Ajouter données démo
          </button>
        </motion.div>

        {/* Reset Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Réinitialiser</h3>
              <p className="text-sm text-gray-500">Reset aux valeurs par défaut</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Supprime toutes les offres et consultants existants puis ajoute les données par défaut.
          </p>
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr ? Toutes les données actuelles seront supprimées.')) {
                performAction('reset')
              }
            }}
            disabled={actionLoading !== null}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
          >
            {actionLoading === 'reset' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Réinitialiser tout
          </button>
        </motion.div>

        {/* Clear All */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Vider tout</h3>
              <p className="text-sm text-gray-500">Supprimer toutes les données</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Supprime toutes les offres, consultants et messages. Les utilisateurs sont préservés.
          </p>
          <button
            onClick={() => {
              if (confirm('⚠️ ATTENTION: Toutes les données seront définitivement supprimées. Continuer ?')) {
                performAction('clear', { collection: 'all' })
              }
            }}
            disabled={actionLoading !== null}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {actionLoading === 'clear' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Vider toutes les données
          </button>
        </motion.div>
      </div>

      {/* Clear Individual Collections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm mb-8"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-500" />
          Vider une collection spécifique
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              if (confirm('Supprimer toutes les offres d\'emploi ?')) {
                performAction('clear', { collection: 'jobs' })
              }
            }}
            disabled={actionLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          >
            <Briefcase className="w-4 h-4" />
            Vider Jobs ({status?.counts.jobs})
          </button>
          <button
            onClick={() => {
              if (confirm('Supprimer tous les consultants ?')) {
                performAction('clear', { collection: 'consultants' })
              }
            }}
            disabled={actionLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            Vider Consultants ({status?.counts.consultants})
          </button>
          <button
            onClick={() => {
              if (confirm('Supprimer tous les messages ?')) {
                performAction('clear', { collection: 'messages' })
              }
            }}
            disabled={actionLoading !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4" />
            Vider Messages ({status?.counts.messages})
          </button>
        </div>
      </motion.div>

      {/* Preview Data */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Jobs Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            Aperçu des offres ({status?.counts.jobs})
          </h3>
          {status?.samples.jobs && status.samples.jobs.length > 0 ? (
            <div className="space-y-3">
              {status.samples.jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700 truncate flex-1">{job.title}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    job.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {job.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
              {status.counts.jobs > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  + {status.counts.jobs - 5} autres offres
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucune offre</p>
          )}
        </motion.div>

        {/* Consultants Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-500" />
            Aperçu des consultants ({status?.counts.consultants})
          </h3>
          {status?.samples.consultants && status.samples.consultants.length > 0 ? (
            <div className="space-y-3">
              {status.samples.consultants.map((consultant) => (
                <div
                  key={consultant.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700 truncate flex-1">{consultant.name}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    consultant.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {consultant.available ? 'Disponible' : 'En mission'}
                  </span>
                </div>
              ))}
              {status.counts.consultants > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  + {status.counts.consultants - 5} autres consultants
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucun consultant</p>
          )}
        </motion.div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100"
      >
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Information
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Les données par défaut comprennent {status?.defaultDataAvailable.jobs} offres et {status?.defaultDataAvailable.consultants} consultants</li>
          <li>• &quot;Ajouter données démo&quot; n&apos;ajoute que si les collections sont vides</li>
          <li>• &quot;Réinitialiser&quot; supprime tout et recrée les données par défaut</li>
          <li>• Les utilisateurs admin ne sont jamais supprimés</li>
        </ul>
      </motion.div>
    </div>
  )
}
