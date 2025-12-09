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
  User,
  Briefcase,
  Clock
} from 'lucide-react'
import Link from 'next/link'

// Recruitment stages - each stage is a column
const RECRUITMENT_STAGES = [
  { id: 'a_qualifier', name: 'À qualifier', color: '#94a3b8', lightBg: 'bg-slate-50', darkBg: 'dark:bg-slate-800/50', lightBorder: 'border-slate-300', darkBorder: 'dark:border-slate-600', headerBg: 'from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800' },
  { id: 'qualifie', name: 'Qualifié', color: '#06b6d4', lightBg: 'bg-cyan-50/50', darkBg: 'dark:bg-cyan-900/20', lightBorder: 'border-cyan-200', darkBorder: 'dark:border-cyan-800', headerBg: 'from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-900/20' },
  { id: 'en_cours', name: 'En cours', color: '#8b5cf6', lightBg: 'bg-purple-50/50', darkBg: 'dark:bg-purple-900/20', lightBorder: 'border-purple-200', darkBorder: 'dark:border-purple-800', headerBg: 'from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-900/20' },
  { id: 'entretien', name: 'Entretien', color: '#f59e0b', lightBg: 'bg-amber-50/50', darkBg: 'dark:bg-amber-900/20', lightBorder: 'border-amber-200', darkBorder: 'dark:border-amber-700', headerBg: 'from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20' },
  { id: 'proposition', name: 'Proposition', color: '#3b82f6', lightBg: 'bg-blue-50/50', darkBg: 'dark:bg-blue-900/20', lightBorder: 'border-blue-200', darkBorder: 'dark:border-blue-800', headerBg: 'from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20' },
  { id: 'embauche', name: 'Embauché', color: '#10b981', lightBg: 'bg-emerald-50/50', darkBg: 'dark:bg-emerald-900/20', lightBorder: 'border-emerald-200', darkBorder: 'dark:border-emerald-800', headerBg: 'from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20' },
]

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title?: string
  source?: string
  stage: string
  createdAt: string
  lastActivity?: string
  notes?: string
  avatar?: string
}

interface KanbanColumn {
  id: string
  name: string
  color: string
  lightBg: string
  darkBg: string
  lightBorder: string
  darkBorder: string
  headerBg: string
  candidates: Candidate[]
}

// Generate demo candidates
function generateDemoCandidates(): Candidate[] {
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Julie', 'Nicolas', 'Emma', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Alexandre', 'Camille', 'Maxime', 'Sarah', 'Antoine', 'Laura', 'Mathieu', 'Clara']
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard']
  const titles = ['Développeur Full Stack', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UX Designer', 'Tech Lead', 'Architecte Cloud', 'Consultant SAP', 'Chef de Projet', 'Scrum Master', 'Data Engineer', 'Frontend Developer', 'Backend Developer', 'Mobile Developer', 'QA Engineer']
  const sources = ['LinkedIn', 'Indeed', 'Site Web', 'Cooptation', 'CVthèque', 'JobBoard', 'Réseau', 'Salon']
  const stages = ['a_qualifier', 'qualifie', 'en_cours', 'entretien', 'proposition', 'embauche']

  return Array.from({ length: 24 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const stageIndex = Math.floor(Math.random() * stages.length)

    return {
      id: `candidate-${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+33 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      stage: stages[stageIndex],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  })
}

export default function RecrutementPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const initializeBoard = useCallback(() => {
    setLoading(true)

    // Generate demo candidates
    const candidates = generateDemoCandidates()

    // Organize candidates into columns
    const boardColumns: KanbanColumn[] = RECRUITMENT_STAGES.map(stage => ({
      ...stage,
      candidates: candidates.filter(c => c.stage === stage.id)
    }))

    setColumns(boardColumns)
    setLoading(false)
  }, [])

  useEffect(() => {
    initializeBoard()
  }, [initializeBoard])

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    // No destination = dropped outside
    if (!destination) return

    // Same position = no change
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Find source and destination columns
    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId)
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId)

    if (sourceColIndex === -1 || destColIndex === -1) return

    const newColumns = [...columns]
    const sourceCol = { ...newColumns[sourceColIndex] }
    const destCol = source.droppableId === destination.droppableId
      ? sourceCol
      : { ...newColumns[destColIndex] }

    // Remove from source
    const [movedCandidate] = sourceCol.candidates.splice(source.index, 1)

    // Update candidate stage
    movedCandidate.stage = destination.droppableId
    movedCandidate.lastActivity = new Date().toISOString()

    // Add to destination
    destCol.candidates.splice(destination.index, 0, movedCandidate)

    // Update columns
    newColumns[sourceColIndex] = sourceCol
    if (source.droppableId !== destination.droppableId) {
      newColumns[destColIndex] = destCol
    }

    setColumns(newColumns)

    // Here you would typically also call an API to persist the change
    console.log(`Moved ${movedCandidate.firstName} ${movedCandidate.lastName} to ${destination.droppableId}`)
  }

  // Filter candidates across all columns
  const filterCandidates = (candidates: Candidate[]) => {
    if (!searchQuery) return candidates
    const query = searchQuery.toLowerCase()
    return candidates.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.title?.toLowerCase().includes(query)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
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
            <p className="text-gray-500 dark:text-gray-400">Gérez vos candidats par étape de recrutement</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Mode Démo
          </span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise/20 focus:border-ebmc-turquoise"
            />
          </div>
          <button
            onClick={initializeBoard}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {columns.map(col => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 shadow-sm border-l-4 ${col.lightBg} ${col.darkBg} border ${col.lightBorder} ${col.darkBorder}`}
            style={{ borderLeftColor: col.color }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{col.name}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: col.color }}>{col.candidates.length}</p>
          </motion.div>
        ))}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max h-full">
            {columns.map(column => (
              <div
                key={column.id}
                className={`w-80 flex-shrink-0 flex flex-col rounded-xl border-t-4 overflow-hidden ${column.lightBg} ${column.darkBg} ${column.lightBorder} ${column.darkBorder} border`}
                style={{ borderTopColor: column.color }}
              >
                {/* Column Header */}
                <div className={`p-4 bg-gradient-to-b ${column.headerBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: column.color }}
                      >
                        {filterCandidates(column.candidates).length}
                      </span>
                    </div>
                    <button className="p-1 hover:bg-white/50 dark:hover:bg-slate-600 rounded transition">
                      <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Column Content */}
                <Droppable droppableId={column.id}>
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
                          key={candidate.id}
                          draggableId={candidate.id}
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
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium">
                                    {candidate.firstName[0]}{candidate.lastName[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                      {candidate.firstName} {candidate.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.title}</p>
                                  </div>
                                </div>
                                <button
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Open menu
                                  }}
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                </button>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatRelativeTime(candidate.lastActivity || candidate.createdAt)}
                                </span>
                                {candidate.source && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-gray-300">
                                    {candidate.source}
                                  </span>
                                )}
                              </div>
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
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ebmc-turquoise to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCandidate.firstName} {selectedCandidate.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{selectedCandidate.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${RECRUITMENT_STAGES.find(s => s.id === selectedCandidate.stage)?.color}20`,
                      color: RECRUITMENT_STAGES.find(s => s.id === selectedCandidate.stage)?.color
                    }}
                  >
                    {RECRUITMENT_STAGES.find(s => s.id === selectedCandidate.stage)?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{selectedCandidate.email}</span>
              </div>

              {selectedCandidate.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedCandidate.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Briefcase className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{selectedCandidate.source || 'Source inconnue'}</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Ajouté le {new Date(selectedCandidate.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                Fermer
              </button>
              <button className="flex-1 px-4 py-2 bg-ebmc-turquoise text-white rounded-lg hover:bg-ebmc-turquoise/90 transition">
                Voir le profil
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
