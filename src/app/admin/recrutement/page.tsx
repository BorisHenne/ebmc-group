'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Plus,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  ChevronLeft,
  Briefcase,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Archive,
  Wrench
} from 'lucide-react'
import Link from 'next/link'
import { CANDIDATE_STATES } from '@/lib/boondmanager-client'

// Site candidate from MongoDB (imported from BoondManager)
interface SiteCandidate {
  id: string
  _id?: string
  boondManagerId?: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  title?: string
  state: number
  stateLabel: string
  location?: string
  skills: string[]
  experience?: string
  source?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Recruitment stages based on BoondManager CANDIDATE_STATES
// States 0-6 are active pipeline, 7=Refuse, 8=Archive
const RECRUITMENT_STAGES: { id: number; name: string; color: string; lightBg: string; darkBg: string; lightBorder: string; darkBorder: string; headerBg: string; icon?: React.ReactNode }[] = [
  { id: 0, name: 'Nouveau', color: '#64748b', lightBg: 'bg-slate-50', darkBg: 'dark:bg-slate-800/50', lightBorder: 'border-slate-300', darkBorder: 'dark:border-slate-600', headerBg: 'from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800' },
  { id: 1, name: 'A qualifier', color: '#94a3b8', lightBg: 'bg-gray-50', darkBg: 'dark:bg-gray-800/50', lightBorder: 'border-gray-300', darkBorder: 'dark:border-gray-600', headerBg: 'from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800' },
  { id: 2, name: 'Qualifie', color: '#06b6d4', lightBg: 'bg-cyan-50/50', darkBg: 'dark:bg-cyan-900/20', lightBorder: 'border-cyan-200', darkBorder: 'dark:border-cyan-800', headerBg: 'from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/20' },
  { id: 3, name: 'En cours', color: '#8b5cf6', lightBg: 'bg-purple-50/50', darkBg: 'dark:bg-purple-900/20', lightBorder: 'border-purple-200', darkBorder: 'dark:border-purple-800', headerBg: 'from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-900/20' },
  { id: 4, name: 'Entretien', color: '#f59e0b', lightBg: 'bg-amber-50/50', darkBg: 'dark:bg-amber-900/20', lightBorder: 'border-amber-200', darkBorder: 'dark:border-amber-700', headerBg: 'from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20' },
  { id: 5, name: 'Proposition', color: '#3b82f6', lightBg: 'bg-blue-50/50', darkBg: 'dark:bg-blue-900/20', lightBorder: 'border-blue-200', darkBorder: 'dark:border-blue-800', headerBg: 'from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20' },
  { id: 6, name: 'Embauche', color: '#10b981', lightBg: 'bg-emerald-50/50', darkBg: 'dark:bg-emerald-900/20', lightBorder: 'border-emerald-200', darkBorder: 'dark:border-emerald-800', headerBg: 'from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20' },
  { id: 7, name: 'Refuse', color: '#ef4444', lightBg: 'bg-red-50/50', darkBg: 'dark:bg-red-900/20', lightBorder: 'border-red-200', darkBorder: 'dark:border-red-800', headerBg: 'from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/20' },
  { id: 8, name: 'Archive', color: '#475569', lightBg: 'bg-slate-100/50', darkBg: 'dark:bg-slate-800/30', lightBorder: 'border-slate-300', darkBorder: 'dark:border-slate-700', headerBg: 'from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900' },
]

interface KanbanColumn {
  id: number
  name: string
  color: string
  lightBg: string
  darkBg: string
  lightBorder: string
  darkBorder: string
  headerBg: string
  candidates: SiteCandidate[]
}

// Client-side sanitization to handle BoondManager objects like {typeOf, detail}
function sanitizeField(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    // Handle BoondManager objects
    if ('detail' in obj && typeof obj.detail === 'string') return obj.detail
    if ('value' in obj && typeof obj.value === 'string') return obj.value
    if ('label' in obj && typeof obj.label === 'string') return obj.label
    if ('name' in obj && typeof obj.name === 'string') return obj.name
    // Fallback to JSON for debugging
    try {
      return JSON.stringify(value)
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}

function sanitizeArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  return arr.map(item => sanitizeField(item))
}

function sanitizeCandidate(candidate: Record<string, unknown>): SiteCandidate {
  return {
    id: String(candidate.id || candidate._id || ''),
    _id: candidate._id ? String(candidate._id) : undefined,
    boondManagerId: typeof candidate.boondManagerId === 'number' ? candidate.boondManagerId : undefined,
    firstName: sanitizeField(candidate.firstName),
    lastName: sanitizeField(candidate.lastName),
    email: candidate.email ? sanitizeField(candidate.email) : undefined,
    phone: candidate.phone ? sanitizeField(candidate.phone) : undefined,
    title: candidate.title ? sanitizeField(candidate.title) : undefined,
    state: typeof candidate.state === 'number' ? candidate.state : 0,
    stateLabel: sanitizeField(candidate.stateLabel),
    location: candidate.location ? sanitizeField(candidate.location) : undefined,
    skills: sanitizeArray(candidate.skills),
    experience: candidate.experience ? sanitizeField(candidate.experience) : undefined,
    source: candidate.source ? sanitizeField(candidate.source) : undefined,
    notes: candidate.notes ? sanitizeField(candidate.notes) : undefined,
    createdAt: sanitizeField(candidate.createdAt),
    updatedAt: sanitizeField(candidate.updatedAt),
  }
}

export default function RecrutementPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<SiteCandidate | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [fixingStates, setFixingStates] = useState(false)
  const [fixResult, setFixResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/site/candidates?stats=true', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la recuperation des candidats')
      }

      const data = await response.json()
      // Sanitize all candidate data to prevent React rendering errors
      const candidates: SiteCandidate[] = (data.data || []).map((c: Record<string, unknown>) => sanitizeCandidate(c))

      // Organize candidates into columns by state
      const boardColumns: KanbanColumn[] = RECRUITMENT_STAGES.map(stage => ({
        ...stage,
        candidates: candidates.filter((c: SiteCandidate) => c.state === stage.id)
      }))

      setColumns(boardColumns)
    } catch (err) {
      console.error('Error fetching candidates:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Fix states based on stateLabel
  const fixCandidateStates = async () => {
    setFixingStates(true)
    setFixResult(null)

    try {
      const response = await fetch('/api/site/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dryRun: false }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la correction')
      }

      setFixResult({
        message: data.message,
        type: 'success',
      })

      // Refresh the kanban after fixing states
      await fetchCandidates()
    } catch (err) {
      console.error('Error fixing states:', err)
      setFixResult({
        message: err instanceof Error ? err.message : 'Erreur inconnue',
        type: 'error',
      })
    } finally {
      setFixingStates(false)
    }
  }

  // Handle drag end - update candidate state
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    // No destination = dropped outside
    if (!destination) return

    const sourceState = parseInt(source.droppableId)
    const destState = parseInt(destination.droppableId)

    // Same position = no change
    if (sourceState === destState && source.index === destination.index) {
      return
    }

    // Find source and destination columns
    const sourceColIndex = columns.findIndex(col => col.id === sourceState)
    const destColIndex = columns.findIndex(col => col.id === destState)

    if (sourceColIndex === -1 || destColIndex === -1) return

    // Optimistic update
    const newColumns = [...columns]
    const sourceCol = { ...newColumns[sourceColIndex], candidates: [...newColumns[sourceColIndex].candidates] }
    const destCol = sourceState === destState
      ? sourceCol
      : { ...newColumns[destColIndex], candidates: [...newColumns[destColIndex].candidates] }

    // Remove from source
    const [movedCandidate] = sourceCol.candidates.splice(source.index, 1)

    // Update candidate state
    const updatedCandidate: SiteCandidate = {
      ...movedCandidate,
      state: destState,
      stateLabel: CANDIDATE_STATES[destState] || 'Inconnu',
      updatedAt: new Date().toISOString()
    }

    // Add to destination
    destCol.candidates.splice(destination.index, 0, updatedCandidate)

    // Update columns
    newColumns[sourceColIndex] = sourceCol
    if (sourceState !== destState) {
      newColumns[destColIndex] = destCol
    }

    setColumns(newColumns)

    // Persist to API
    try {
      setUpdating(true)
      const response = await fetch('/api/site/candidates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: movedCandidate.id || movedCandidate._id,
          state: destState,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise a jour')
      }

      console.log(`Moved ${movedCandidate.firstName} ${movedCandidate.lastName} to ${CANDIDATE_STATES[destState]}`)
    } catch (err) {
      // Revert on error
      console.error('Error updating candidate:', err)
      fetchCandidates()
    } finally {
      setUpdating(false)
    }
  }

  // Filter candidates across all columns
  const filterCandidates = (candidates: SiteCandidate[]) => {
    if (!searchQuery) return candidates
    const query = searchQuery.toLowerCase()
    return candidates.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.title?.toLowerCase().includes(query) ||
      c.source?.toLowerCase().includes(query)
    )
  }

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  }

  // Get total candidates count
  const totalCandidates = columns.reduce((sum, col) => sum + col.candidates.length, 0)

  // Filter columns based on showArchived
  const visibleColumns = showArchived
    ? columns
    : columns.filter(col => col.id !== 8) // Hide Archive column by default

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchCandidates}
          className="flex items-center gap-2 px-4 py-2 bg-ebmc-turquoise text-white rounded-lg hover:bg-ebmc-turquoise/90 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Reessayer
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/sourceur"
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parcours de recrutement</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {totalCandidates} candidats dans le pipeline
              {updating && <span className="ml-2 text-amber-500">• Mise a jour...</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {totalCandidates === 0 && (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Aucun candidat - Importez depuis BoondManager
            </span>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-gray-300"
            />
            Afficher archives
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={fetchCandidates}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={fixCandidateStates}
            disabled={fixingStates}
            title="Corriger les états en fonction du stateLabel"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
          >
            <Wrench className={`w-4 h-4 ${fixingStates ? 'animate-spin' : ''}`} />
            {fixingStates ? 'Correction...' : 'Corriger états'}
          </button>
          <Link
            href="/admin/boondmanager-v2"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            Importer
          </Link>
        </div>
      </div>

      {/* Fix Result Message */}
      {fixResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            fixResult.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          {fixResult.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{fixResult.message}</span>
          <button
            onClick={() => setFixResult(null)}
            className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className={`grid gap-4 mb-6 ${showArchived ? 'grid-cols-9' : 'grid-cols-8'}`}>
        {visibleColumns.map(col => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-3 shadow-sm border-l-4 ${col.lightBg} ${col.darkBg} border ${col.lightBorder} ${col.darkBorder}`}
            style={{ borderLeftColor: col.color }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">{col.name}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: col.color }}>{col.candidates.length}</p>
          </motion.div>
        ))}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max h-full">
            {visibleColumns.map(column => (
              <div
                key={column.id}
                className={`w-72 flex-shrink-0 flex flex-col rounded-xl border-t-4 overflow-hidden ${column.lightBg} ${column.darkBg} ${column.lightBorder} ${column.darkBorder} border`}
                style={{ borderTopColor: column.color }}
              >
                {/* Column Header */}
                <div className={`p-3 bg-gradient-to-b ${column.headerBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {column.id === 6 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {column.id === 7 && <XCircle className="w-4 h-4 text-red-500" />}
                      {column.id === 8 && <Archive className="w-4 h-4 text-slate-500" />}
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{column.name}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: column.color }}
                      >
                        {filterCandidates(column.candidates).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column Content */}
                <Droppable droppableId={column.id.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-white/50 dark:bg-white/5' : ''
                      }`}
                    >
                      {filterCandidates(column.candidates).map((candidate, index) => (
                        <Draggable
                          key={candidate.id || candidate._id}
                          draggableId={candidate.id || candidate._id || `candidate-${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-ebmc-turquoise/20 scale-105' : ''
                              }`}
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium">
                                    {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                      {candidate.firstName} {candidate.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                      {candidate.title || 'Candidat'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                </button>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatRelativeTime(candidate.updatedAt || candidate.createdAt)}
                                </span>
                                {candidate.source && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-gray-300 truncate max-w-[80px]">
                                    {candidate.source}
                                  </span>
                                )}
                              </div>

                              {candidate.skills && candidate.skills.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {candidate.skills.slice(0, 2).map((skill, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs truncate max-w-[60px]">
                                      {skill}
                                    </span>
                                  ))}
                                  {candidate.skills.length > 2 && (
                                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                                      +{candidate.skills.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {filterCandidates(column.candidates).length === 0 && (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                          Aucun candidat
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ebmc-turquoise to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedCandidate.firstName?.[0]}{selectedCandidate.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCandidate.firstName} {selectedCandidate.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{selectedCandidate.title || 'Candidat'}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${RECRUITMENT_STAGES.find(s => s.id === selectedCandidate.state)?.color}20`,
                      color: RECRUITMENT_STAGES.find(s => s.id === selectedCandidate.state)?.color
                    }}
                  >
                    {selectedCandidate.stateLabel || CANDIDATE_STATES[selectedCandidate.state]}
                  </span>
                  {selectedCandidate.experience && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      {selectedCandidate.experience}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Competences</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {selectedCandidate.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{selectedCandidate.email}</span>
                </div>
              )}

              {selectedCandidate.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{selectedCandidate.phone}</span>
                </div>
              )}

              {selectedCandidate.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{selectedCandidate.location}</span>
                </div>
              )}

              {selectedCandidate.source && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Source: {selectedCandidate.source}</span>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Mis a jour le {new Date(selectedCandidate.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {selectedCandidate.notes && (
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Notes</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedCandidate.notes}</p>
                </div>
              )}

              {selectedCandidate.boondManagerId && (
                <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  BoondManager ID: {selectedCandidate.boondManagerId}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                Fermer
              </button>
              {selectedCandidate.boondManagerId && (
                <Link
                  href={`/admin/boondmanager-v2?tab=candidates&id=${selectedCandidate.boondManagerId}`}
                  className="flex-1 px-4 py-2 bg-ebmc-turquoise text-white rounded-lg hover:bg-ebmc-turquoise/90 transition text-center"
                >
                  Voir dans BoondManager
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
