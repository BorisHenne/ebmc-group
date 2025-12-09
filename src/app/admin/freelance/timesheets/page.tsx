'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Save, Send, CheckCircle, AlertCircle, Loader2, Upload, FileText, X, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import { EventClickArg } from '@fullcalendar/core'

interface TimesheetDay {
  date: string
  hours: number
  type: 'worked' | 'absence' | 'holiday' | ''
  comment: string
}

interface TimesheetDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  url: string
}

interface Timesheet {
  id?: string
  month: number
  year: number
  status: 'draft' | 'submitted' | 'validated' | 'rejected'
  days: Record<string, TimesheetDay>
  totalHours: number
  submittedAt?: string
  validatedAt?: string
  documents?: TimesheetDocument[]
}

interface DayModalData {
  date: string
  day: TimesheetDay
}

const dayTypes = [
  { value: 'worked', label: 'Travaillé', color: '#3b82f6', bgColor: 'bg-blue-100 text-blue-700' },
  { value: 'absence', label: 'Absence', color: '#8b5cf6', bgColor: 'bg-purple-100 text-purple-700' },
  { value: 'holiday', label: 'Férié', color: '#22c55e', bgColor: 'bg-green-100 text-green-700' },
  { value: '', label: 'Non renseigné', color: '#9ca3af', bgColor: 'bg-gray-100 text-gray-500' },
]

export default function TimesheetsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<DayModalData | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<FullCalendar>(null)

  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()
  const monthParam = `${year}-${String(month + 1).padStart(2, '0')}`

  // Generate initial days for the month
  const generateDays = useCallback((): Record<string, TimesheetDay> => {
    const days: Record<string, TimesheetDay> = {}
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      days[dateStr] = {
        date: dateStr,
        hours: isWeekend ? 0 : 8,
        type: isWeekend ? '' : 'worked',
        comment: ''
      }
    }

    return days
  }, [month, year])

  // Fetch timesheet data
  const fetchTimesheet = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/freelance/timesheets?month=${monthParam}`, {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        if (data.timesheet) {
          const apiTimesheet = data.timesheet

          // Convert API days (object with hours) to our format
          let daysMap: Record<string, TimesheetDay> = {}

          if (apiTimesheet.days) {
            if (typeof apiTimesheet.days === 'object' && !Array.isArray(apiTimesheet.days)) {
              // API returns {date: hours} format
              Object.keys(apiTimesheet.days).forEach(dateStr => {
                const hours = apiTimesheet.days[dateStr]
                const date = new Date(dateStr)
                const dayOfWeek = date.getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                daysMap[dateStr] = {
                  date: dateStr,
                  hours: typeof hours === 'number' ? hours : 0,
                  type: isWeekend ? '' : (hours > 0 ? 'worked' : ''),
                  comment: ''
                }
              })
            }
          }

          // Fill missing days
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i)
            const dateStr = date.toISOString().split('T')[0]
            if (!daysMap[dateStr]) {
              const dayOfWeek = date.getDay()
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
              daysMap[dateStr] = {
                date: dateStr,
                hours: isWeekend ? 0 : 8,
                type: isWeekend ? '' : 'worked',
                comment: ''
              }
            }
          }

          const totalHours = Object.values(daysMap).reduce((sum, day) =>
            sum + (day.type === 'worked' ? day.hours : 0), 0)

          setTimesheet({
            id: apiTimesheet._id?.toString() || apiTimesheet.id,
            month: month + 1,
            year,
            status: apiTimesheet.status || 'draft',
            days: daysMap,
            totalHours,
            submittedAt: apiTimesheet.submittedAt,
            validatedAt: apiTimesheet.validatedAt,
            documents: apiTimesheet.documents || []
          })
        } else {
          setTimesheet({
            month: month + 1,
            year,
            status: 'draft',
            days: generateDays(),
            totalHours: 0,
            documents: []
          })
        }
      } else {
        setTimesheet({
          month: month + 1,
          year,
          status: 'draft',
          days: generateDays(),
          totalHours: 0,
          documents: []
        })
      }
    } catch (error) {
      console.error('Error fetching timesheet:', error)
      setTimesheet({
        month: month + 1,
        year,
        status: 'draft',
        days: generateDays(),
        totalHours: 0,
        documents: []
      })
    } finally {
      setLoading(false)
    }
  }, [month, year, monthParam, generateDays])

  useEffect(() => {
    fetchTimesheet()
  }, [fetchTimesheet])

  // Convert days to calendar events
  const getCalendarEvents = () => {
    if (!timesheet) return []

    return Object.values(timesheet.days).map(day => {
      const typeInfo = dayTypes.find(t => t.value === day.type) || dayTypes[3]
      return {
        id: day.date,
        title: day.type === 'worked' ? `${day.hours}h` : typeInfo.label,
        start: day.date,
        backgroundColor: typeInfo.color,
        borderColor: typeInfo.color,
        textColor: '#ffffff',
        extendedProps: { ...day }
      }
    })
  }

  // Handle date click
  const handleDateClick = (arg: DateClickArg) => {
    if (!timesheet || timesheet.status !== 'draft') return

    const dateStr = arg.dateStr
    const day = timesheet.days[dateStr]

    if (day) {
      setSelectedDay({ date: dateStr, day: { ...day } })
    }
  }

  // Handle event click
  const handleEventClick = (arg: EventClickArg) => {
    if (!timesheet || timesheet.status !== 'draft') return

    const dateStr = arg.event.startStr
    const day = timesheet.days[dateStr]

    if (day) {
      setSelectedDay({ date: dateStr, day: { ...day } })
    }
  }

  // Update day from modal
  const updateDayFromModal = () => {
    if (!timesheet || !selectedDay) return

    const newDays = { ...timesheet.days }
    newDays[selectedDay.date] = selectedDay.day

    const totalHours = Object.values(newDays).reduce((sum, day) =>
      sum + (day.type === 'worked' ? day.hours : 0), 0)

    setTimesheet({ ...timesheet, days: newDays, totalHours })
    setSelectedDay(null)
  }

  // Save timesheet
  const handleSave = async () => {
    if (!timesheet) return
    setSaving(true)

    try {
      // Convert days to API format {date: hours}
      const daysObj: Record<string, number> = {}
      Object.values(timesheet.days).forEach(day => {
        daysObj[day.date] = day.type === 'worked' ? day.hours : 0
      })

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

  // Submit timesheet
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
        await fetchTimesheet()
      }
    } catch (error) {
      console.error('Error submitting timesheet:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !timesheet) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
        if (!validTypes.includes(file.type)) {
          alert(`Type de fichier non supporté: ${file.name}. Utilisez PDF ou DOCX.`)
          continue
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`Fichier trop volumineux: ${file.name}. Maximum 10MB.`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('month', monthParam)

        const res = await fetch('/api/freelance/timesheets/documents', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (res.ok) {
          const data = await res.json()
          if (data.document) {
            setTimesheet(prev => prev ? {
              ...prev,
              documents: [...(prev.documents || []), data.document]
            } : null)
          }
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  // Handle file delete
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Supprimer ce document ?')) return

    try {
      const res = await fetch(`/api/freelance/timesheets/documents?id=${docId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        setTimesheet(prev => prev ? {
          ...prev,
          documents: (prev.documents || []).filter(d => d.id !== docId)
        } : null)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  // Navigate month
  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1)
    setCurrentDate(newDate)
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      if (direction > 0) {
        calendarApi.next()
      } else {
        calendarApi.prev()
      }
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes CRA</h1>
            <p className="text-gray-500 dark:text-gray-400">Compte Rendu d&apos;Activité</p>
          </div>
        </div>
        {timesheet && getStatusBadge(timesheet.status)}
      </div>

      {/* Month Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-lg font-semibold capitalize">{monthName}</span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Légende:</span>
          {dayTypes.slice(0, 3).map(type => (
            <div key={type.value} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: type.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-300">{type.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={frLocale}
          headerToolbar={false}
          height="auto"
          events={getCalendarEvents()}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          initialDate={currentDate}
          firstDay={1}
          dayMaxEvents={1}
          eventDisplay="block"
          dayCellClassNames={(arg) => {
            const dayOfWeek = arg.date.getDay()
            return dayOfWeek === 0 || dayOfWeek === 6 ? 'bg-gray-50 dark:bg-slate-800' : ''
          }}
        />

        <style jsx global>{`
          .fc {
            font-family: inherit;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: #f3f4f6;
          }
          .fc-theme-standard .fc-scrollgrid {
            border-color: #f3f4f6;
          }
          .fc .fc-daygrid-day-number {
            color: #374151;
            font-weight: 500;
            padding: 8px;
          }
          .fc .fc-daygrid-day.fc-day-today {
            background-color: #dbeafe;
          }
          .fc .fc-daygrid-day:hover {
            background-color: #f3f4f6;
            cursor: pointer;
          }
          .fc-event {
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            padding: 2px 6px;
            cursor: pointer;
          }
          .fc-daygrid-day-frame {
            min-height: 80px;
          }
          .fc-col-header-cell {
            background-color: #f9fafb;
            padding: 12px 0;
          }
          .fc-col-header-cell-cushion {
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
          }
        `}</style>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600">{timesheet?.totalHours || 0}h</div>
            <div className="text-sm text-blue-600 mt-1">Heures travaillées</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600">
              {Object.values(timesheet?.days || {}).filter(d => d.type === 'worked').length}
            </div>
            <div className="text-sm text-green-600 mt-1">Jours travaillés</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600">
              {Object.values(timesheet?.days || {}).filter(d => d.type === 'absence').length}
            </div>
            <div className="text-sm text-purple-600 mt-1">Jours d&apos;absence</div>
          </div>
        </div>
      </motion.div>

      {/* Documents Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          Documents justificatifs
        </h2>

        {/* Upload Zone */}
        {timesheet?.status === 'draft' && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver
                ? 'border-ebmc-turquoise bg-ebmc-turquoise/5'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFileUpload(e.dataTransfer.files)
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-ebmc-turquoise' : 'text-gray-400 dark:text-gray-500'}`} />

            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Glissez-déposez vos fichiers ici ou{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-ebmc-turquoise hover:underline font-medium"
              >
                parcourez
              </button>
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">PDF, DOCX (max 10MB)</p>

            {uploading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-ebmc-turquoise">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Upload en cours...</span>
              </div>
            )}
          </div>
        )}

        {/* Documents List */}
        {timesheet?.documents && timesheet.documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {timesheet.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.size)} - {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition"
                  >
                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </a>
                  {timesheet.status === 'draft' && (
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(!timesheet?.documents || timesheet.documents.length === 0) && timesheet?.status !== 'draft' && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun document joint</p>
        )}
      </motion.div>

      {/* Actions */}
      {timesheet?.status === 'draft' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
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

      {/* Status Messages */}
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

      {/* Day Edit Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedDay.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {dayTypes.slice(0, 3).map(type => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedDay({
                          ...selectedDay,
                          day: { ...selectedDay.day, type: type.value as TimesheetDay['type'] }
                        })}
                        className={`p-3 rounded-lg border-2 transition ${
                          selectedDay.day.type === type.value
                            ? 'border-ebmc-turquoise bg-ebmc-turquoise/10'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: type.color }} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDay.day.type === 'worked' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heures</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={selectedDay.day.hours}
                      onChange={(e) => setSelectedDay({
                        ...selectedDay,
                        day: { ...selectedDay.day, hours: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commentaire</label>
                  <textarea
                    value={selectedDay.day.comment}
                    onChange={(e) => setSelectedDay({
                      ...selectedDay,
                      day: { ...selectedDay.day, comment: e.target.value }
                    })}
                    placeholder="Optionnel..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedDay(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={updateDayFromModal}
                  className="flex-1 px-4 py-2 bg-ebmc-turquoise text-white rounded-lg hover:opacity-90 transition"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
