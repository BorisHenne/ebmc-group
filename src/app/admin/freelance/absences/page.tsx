'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, X, CheckCircle, AlertCircle, Clock, Loader2, Trash2 } from 'lucide-react'

interface AbsenceRequest {
  id: string
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

interface AbsenceBalance {
  total: number
  used: number
  pending: number
  remaining: number
}

const absenceTypes = [
  { value: 'conges_payes', label: 'Congés payés', color: 'bg-blue-100 text-blue-700' },
  { value: 'rtt', label: 'RTT', color: 'bg-purple-100 text-purple-700' },
  { value: 'maladie', label: 'Maladie', color: 'bg-red-100 text-red-700' },
  { value: 'sans_solde', label: 'Sans solde', color: 'bg-gray-100 text-gray-700' },
  { value: 'autre', label: 'Autre', color: 'bg-orange-100 text-orange-700' },
]

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<AbsenceRequest[]>([])
  const [balance, setBalance] = useState<AbsenceBalance>({ total: 25, used: 0, pending: 0, remaining: 25 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    type: 'conges_payes',
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    fetchAbsences()
  }, [])

  const fetchAbsences = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/freelance/absences', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAbsences(data.absences || [])
        if (data.balance) {
          setBalance(data.balance)
        }
      }
    } catch (error) {
      console.error('Error fetching absences:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    // Exclude weekends (simplified)
    let businessDays = 0
    const current = new Date(startDate)
    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++
      }
      current.setDate(current.getDate() + 1)
    }

    return businessDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const days = calculateDays(formData.startDate, formData.endDate)
      const res = await fetch('/api/freelance/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, days })
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({ type: 'conges_payes', startDate: '', endDate: '', reason: '' })
        fetchAbsences()
      }
    } catch (error) {
      console.error('Error submitting absence:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return

    try {
      const res = await fetch(`/api/freelance/absences/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        fetchAbsences()
      }
    } catch (error) {
      console.error('Error deleting absence:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string; icon: typeof CheckCircle }> = {
      pending: { color: 'bg-amber-100 text-amber-700', label: 'En attente', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700', label: 'Approuvé', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Refusé', icon: AlertCircle },
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <badge.icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeInfo = absenceTypes.find(t => t.value === type) || absenceTypes[4]
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Absences</h1>
            <p className="text-gray-500">Gérez vos demandes de congés</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white rounded-xl hover:opacity-90 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouvelle demande
        </button>
      </div>

      {/* Balance Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Solde total</p>
          <p className="text-2xl font-bold text-gray-900">{balance.total}j</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Utilisés</p>
          <p className="text-2xl font-bold text-blue-600">{balance.used}j</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-amber-600">{balance.pending}j</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Restants</p>
          <p className="text-2xl font-bold text-green-600">{balance.remaining}j</p>
        </div>
      </motion.div>

      {/* Absences List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Historique des demandes</h2>
        </div>

        {absences.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune demande d&apos;absence</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-ebmc-turquoise hover:underline"
            >
              Créer une demande
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {absences.map((absence) => (
              <div key={absence.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div>
                    {getTypeBadge(absence.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(absence.startDate).toLocaleDateString('fr-FR')} - {new Date(absence.endDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {absence.days} jour{absence.days > 1 ? 's' : ''} • {absence.reason || 'Pas de motif'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(absence.status)}
                  {absence.status === 'pending' && (
                    <button
                      onClick={() => handleDelete(absence.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* New Absence Modal */}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nouvelle demande</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type d&apos;absence
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise"
                  >
                    {absenceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      min={formData.startDate}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise"
                    />
                  </div>
                </div>

                {formData.startDate && formData.endDate && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <p className="text-sm text-blue-700">
                      <strong>{calculateDays(formData.startDate, formData.endDate)}</strong> jour(s) ouvré(s)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Motif (optionnel)
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    placeholder="Décrivez la raison de votre absence..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.startDate || !formData.endDate}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Soumettre'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
