'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, Save, Send, CheckCircle, AlertCircle, Loader2, Calendar } from 'lucide-react'

interface TimesheetDay {
  date: string
  dayName: string
  dayNumber: number
  isWeekend: boolean
  hours: number
  type: 'worked' | 'absence' | 'holiday' | ''
  comment: string
}

interface Timesheet {
  id?: string
  month: number
  year: number
  status: 'draft' | 'submitted' | 'validated' | 'rejected'
  days: TimesheetDay[]
  totalHours: number
  submittedAt?: string
  validatedAt?: string
}

const dayTypes = [
  { value: 'worked', label: 'Travaillé', color: 'bg-blue-100 text-blue-700' },
  { value: 'absence', label: 'Absence', color: 'bg-purple-100 text-purple-700' },
  { value: 'holiday', label: 'Férié', color: 'bg-green-100 text-green-700' },
  { value: '', label: '-', color: 'bg-gray-100 text-gray-500' },
]

export default function TimesheetsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Generate days for the month
  const generateDays = (): TimesheetDay[] => {
    const days: TimesheetDay[] = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: i,
        isWeekend,
        hours: isWeekend ? 0 : 8,
        type: isWeekend ? '' : 'worked',
        comment: ''
      })
    }

    return days
  }

  // Convert API days object to array format
  const convertDaysToArray = (daysObj: Record<string, number> | undefined, monthNum: number, yearNum: number): TimesheetDay[] => {
    const days: TimesheetDay[] = []
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate()

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(yearNum, monthNum - 1, i)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const hours = daysObj?.[dateStr] ?? (isWeekend ? 0 : 8)

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: i,
        isWeekend,
        hours,
        type: isWeekend ? '' : (hours > 0 ? 'worked' : ''),
        comment: ''
      })
    }

    return days
  }

  useEffect(() => {
    const fetchTimesheet = async () => {
      setLoading(true)
      try {
        const monthParam = `${year}-${String(month + 1).padStart(2, '0')}`
        const res = await fetch(`/api/freelance/timesheets?month=${monthParam}`, {
          credentials: 'include'
        })

        if (res.ok) {
          const data = await res.json()
          if (data.timesheet) {
            // Convert days object to array if needed
            const apiTimesheet = data.timesheet
            const daysArray = Array.isArray(apiTimesheet.days)
              ? apiTimesheet.days
              : convertDaysToArray(apiTimesheet.days, month + 1, year)

            const totalHours = daysArray.reduce((sum: number, day: TimesheetDay) =>
              sum + (day.type === 'worked' ? day.hours : 0), 0)

            setTimesheet({
              id: apiTimesheet._id?.toString() || apiTimesheet.id,
              month: month + 1,
              year,
              status: apiTimesheet.status || 'draft',
              days: daysArray,
              totalHours,
              submittedAt: apiTimesheet.submittedAt,
              validatedAt: apiTimesheet.validatedAt
            })
          } else {
            // Create new timesheet template
            setTimesheet({
              month: month + 1,
              year,
              status: 'draft',
              days: generateDays(),
              totalHours: 0
            })
          }
        } else {
          // Create new timesheet template
          setTimesheet({
            month: month + 1,
            year,
            status: 'draft',
            days: generateDays(),
            totalHours: 0
          })
        }
      } catch (error) {
        console.error('Error fetching timesheet:', error)
        setTimesheet({
          month: month + 1,
          year,
          status: 'draft',
          days: generateDays(),
          totalHours: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTimesheet()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year])

  const updateDay = (index: number, field: keyof TimesheetDay, value: string | number) => {
    if (!timesheet || timesheet.status !== 'draft') return

    const newDays = [...timesheet.days]
    newDays[index] = { ...newDays[index], [field]: value }

    // Recalculate total hours
    const totalHours = newDays.reduce((sum, day) => sum + (day.type === 'worked' ? day.hours : 0), 0)

    setTimesheet({ ...timesheet, days: newDays, totalHours })
  }

  const handleSave = async () => {
    if (!timesheet) return
    setSaving(true)

    try {
      // Convert days array to object format for API
      const daysObj: Record<string, number> = {}
      timesheet.days.forEach(day => {
        daysObj[day.date] = day.type === 'worked' ? day.hours : 0
      })

      const monthParam = `${timesheet.year}-${String(timesheet.month).padStart(2, '0')}`

      const res = await fetch('/api/freelance/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          month: monthParam,
          days: daysObj
        })
      })

      if (res.ok) {
        const data = await res.json()
        // Update with saved data, keeping local array format
        if (data.success) {
          setTimesheet(prev => prev ? { ...prev, totalHours: data.totalHours } : null)
        }
      }
    } catch (error) {
      console.error('Error saving timesheet:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!timesheet || timesheet.status !== 'draft') return
    setSubmitting(true)

    try {
      const res = await fetch('/api/freelance/timesheets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: timesheet.id, month: timesheet.month, year: timesheet.year })
      })

      if (res.ok) {
        const data = await res.json()
        setTimesheet(data.timesheet)
      }
    } catch (error) {
      console.error('Error submitting timesheet:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1)
    setCurrentDate(newDate)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string; icon: typeof CheckCircle }> = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Brouillon', icon: Clock },
      submitted: { color: 'bg-amber-100 text-amber-700', label: 'Soumis', icon: AlertCircle },
      validated: { color: 'bg-green-100 text-green-700', label: 'Validé', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejeté', icon: AlertCircle },
    }
    const badge = badges[status] || badges.draft
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${badge.color}`}>
        <badge.icon className="w-4 h-4" />
        {badge.label}
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes CRA</h1>
            <p className="text-gray-500">Compte Rendu d&apos;Activité</p>
          </div>
        </div>

        {timesheet && getStatusBadge(timesheet.status)}
      </div>

      {/* Month Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-ebmc-turquoise" />
            <span className="text-lg font-semibold capitalize">{monthName}</span>
          </div>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </motion.div>

      {/* Timesheet Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Jour</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Heures</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {(timesheet?.days ?? []).map((day, index) => (
                <tr
                  key={day.date}
                  className={`border-b border-gray-50 ${day.isWeekend ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium capitalize ${day.isWeekend ? 'text-gray-400' : 'text-gray-700'}`}>
                      {day.dayName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${day.isWeekend ? 'text-gray-400' : 'text-gray-600'}`}>
                      {day.dayNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={day.type}
                      onChange={(e) => updateDay(index, 'type', e.target.value)}
                      disabled={timesheet?.status !== 'draft' || day.isWeekend}
                      className={`text-sm px-3 py-1.5 rounded-lg border-0 ${
                        dayTypes.find(t => t.value === day.type)?.color || 'bg-gray-100'
                      } ${timesheet?.status !== 'draft' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {dayTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={day.hours}
                      onChange={(e) => updateDay(index, 'hours', parseFloat(e.target.value) || 0)}
                      disabled={timesheet?.status !== 'draft' || day.type !== 'worked'}
                      className={`w-16 text-center text-sm px-2 py-1.5 border border-gray-200 rounded-lg ${
                        timesheet?.status !== 'draft' || day.type !== 'worked'
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise'
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={day.comment}
                      onChange={(e) => updateDay(index, 'comment', e.target.value)}
                      disabled={timesheet?.status !== 'draft'}
                      placeholder={day.isWeekend ? '' : 'Optionnel...'}
                      className={`w-full text-sm px-3 py-1.5 border border-gray-200 rounded-lg ${
                        timesheet?.status !== 'draft'
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise'
                      }`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <div>
            <span className="text-gray-600">Total heures travaillées:</span>
            <span className="ml-2 text-xl font-bold text-gray-900">{timesheet?.totalHours || 0}h</span>
          </div>
          <div className="text-sm text-gray-500">
            {(timesheet?.days ?? []).filter(d => d.type === 'worked').length || 0} jours travaillés
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      {timesheet?.status === 'draft' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Enregistrer brouillon
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting || !timesheet.id}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Soumettre le CRA
          </button>
        </motion.div>
      )}

      {/* Validation info */}
      {timesheet?.status === 'validated' && timesheet.validatedAt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">
            CRA validé le {new Date(timesheet.validatedAt).toLocaleDateString('fr-FR')}
          </span>
        </motion.div>
      )}

      {timesheet?.status === 'submitted' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-amber-700">
            CRA soumis le {timesheet.submittedAt ? new Date(timesheet.submittedAt).toLocaleDateString('fr-FR') : ''} - En attente de validation
          </span>
        </motion.div>
      )}
    </div>
  )
}
