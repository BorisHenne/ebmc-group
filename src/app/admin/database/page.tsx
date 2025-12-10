'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Database,
  Trash2,
  Plus,
  RefreshCw,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Copy,
  Table,
  Code,
  FileJson,
  Download,
  Filter,
  Layers,
  Hash
} from 'lucide-react'

interface Collection {
  name: string
  count: number
}

interface Document {
  _id: string
  [key: string]: unknown
}

interface Pagination {
  total: number
  limit: number
  skip: number
  hasMore: boolean
}

type ViewMode = 'json' | 'table'

export default function MongoDBCompassPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('json')

  // Query/Filter
  const [queryFilter, setQueryFilter] = useState('')
  const [activeQuery, setActiveQuery] = useState('')

  // Edit state
  const [editingDoc, setEditingDoc] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // Create state
  const [showCreate, setShowCreate] = useState(false)
  const [newDocContent, setNewDocContent] = useState('{\n  \n}')
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  // Expanded documents
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set())

  // Stats
  const [dbStats, setDbStats] = useState<{ totalCollections: number; totalDocuments: number } | null>(null)

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/site/database?action=collections', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setCollections(data.collections)
        const totalDocs = data.collections.reduce((sum: number, col: Collection) => sum + col.count, 0)
        setDbStats({ totalCollections: data.collections.length, totalDocuments: totalDocs })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDocuments = useCallback(async (collection: string, skip = 0) => {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/site/database?collection=${collection}&limit=50&skip=${skip}`
      const res = await fetch(url, { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setDocuments(data.data || [])
        setPagination({
          total: data.total,
          limit: data.limit,
          skip: data.skip,
          hasMore: data.hasMore
        })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments(selectedCollection, 0)
    }
  }, [selectedCollection, fetchDocuments])

  const handleSelectCollection = (name: string) => {
    setSelectedCollection(name)
    setDocuments([])
    setEditingDoc(null)
    setShowCreate(false)
    setQueryFilter('')
    setActiveQuery('')
    setExpandedDocs(new Set())
  }

  const handleDeleteDocument = async (id: string) => {
    if (!selectedCollection) return
    if (!confirm('Supprimer ce document ?')) return

    try {
      const res = await fetch('/api/site/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ collection: selectedCollection, id }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Document supprime')
        fetchDocuments(selectedCollection, pagination?.skip || 0)
        fetchCollections()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression')
    }
  }

  const handleDropCollection = async (name: string) => {
    if (!confirm(`ATTENTION: Supprimer la collection "${name}" et TOUS ses documents ?`)) return
    if (!confirm('Cette action est IRREVERSIBLE. Confirmer ?')) return

    try {
      const res = await fetch('/api/site/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ collection: name, drop: true }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(`Collection ${name} supprimee`)
        setSelectedCollection(null)
        fetchCollections()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression')
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return

    try {
      const res = await fetch('/api/site/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'createCollection',
          collection: newCollectionName.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(`Collection ${newCollectionName} creee`)
        setShowCreateCollection(false)
        setNewCollectionName('')
        fetchCollections()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de creation')
    }
  }

  const handleStartEdit = (doc: Document) => {
    setEditingDoc(doc._id)
    setEditContent(JSON.stringify(doc, null, 2))
  }

  const handleSaveEdit = async () => {
    if (!editingDoc || !selectedCollection) return

    try {
      const parsed = JSON.parse(editContent)
      const { _id: _unusedId, ...update } = parsed
      void _unusedId

      const res = await fetch('/api/site/database', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          collection: selectedCollection,
          id: editingDoc,
          update,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Document modifie')
        setEditingDoc(null)
        fetchDocuments(selectedCollection, pagination?.skip || 0)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON invalide')
    }
  }

  const handleCreate = async () => {
    if (!selectedCollection) return

    try {
      const parsed = JSON.parse(newDocContent)

      const res = await fetch('/api/site/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'insert',
          collection: selectedCollection,
          document: parsed,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Document cree')
        setShowCreate(false)
        setNewDocContent('{\n  \n}')
        fetchDocuments(selectedCollection, pagination?.skip || 0)
        fetchCollections()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON invalide')
    }
  }

  const handleExport = () => {
    if (!documents.length) return
    const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedCollection}_export.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedDocs)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedDocs(newExpanded)
  }

  const expandAll = () => {
    setExpandedDocs(new Set(documents.map(d => d._id)))
  }

  const collapseAll = () => {
    setExpandedDocs(new Set())
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copie dans le presse-papier')
    setTimeout(() => setSuccess(null), 2000)
  }

  const getDocumentKeys = (): string[] => {
    if (!documents.length) return []
    const keys = new Set<string>()
    documents.forEach(doc => {
      Object.keys(doc).forEach(key => keys.add(key))
    })
    return Array.from(keys)
  }

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toISOString()
      return JSON.stringify(value)
    }
    return String(value)
  }

  const truncateValue = (value: string, maxLength = 50): string => {
    if (value.length <= maxLength) return value
    return value.substring(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Top Bar - Compass Style */}
      <div className="bg-[#0d0d1a] border-b border-[#2a2a4a] px-4 py-3">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold">MongoDB Compass</span>
            {dbStats && (
              <span className="text-slate-400 text-sm ml-4">
                {dbStats.totalCollections} collections | {dbStats.totalDocuments} documents
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateCollection(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Collection
            </button>
            <button
              onClick={() => {
                fetchCollections()
                if (selectedCollection) fetchDocuments(selectedCollection, 0)
              }}
              className="p-2 hover:bg-slate-700 rounded"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500 rounded flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-500/20 border border-green-500 rounded flex items-center gap-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create Collection</h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full px-3 py-2 bg-[#0d0d1a] border border-[#2a2a4a] rounded focus:border-green-500 focus:outline-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateCollection(false)}
                className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar - Collections */}
        <div className="w-64 bg-[#0d0d1a] border-r border-[#2a2a4a] overflow-y-auto">
          <div className="p-3 border-b border-[#2a2a4a]">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Database className="w-4 h-4" />
              <span>Collections</span>
            </div>
          </div>
          {loading && !selectedCollection ? (
            <div className="p-4 text-slate-400 text-sm">Loading...</div>
          ) : (
            <div className="py-1">
              {collections.map((col) => (
                <div
                  key={col.name}
                  className={`group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#2a2a4a] ${
                    selectedCollection === col.name ? 'bg-[#2a2a4a] border-l-2 border-green-500' : ''
                  }`}
                  onClick={() => handleSelectCollection(col.name)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Layers className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="truncate text-sm">{col.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-xs">{col.count}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDropCollection(col.name)
                      }}
                      className="p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCollection ? (
            <>
              {/* Toolbar */}
              <div className="bg-[#0d0d1a] border-b border-[#2a2a4a] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('json')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                        viewMode === 'json' ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <Code className="w-4 h-4" />
                      JSON
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                        viewMode === 'table' ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <Table className="w-4 h-4" />
                      Table
                    </button>
                    <span className="text-slate-400 text-sm ml-4">
                      {pagination?.total || 0} documents
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {viewMode === 'json' && (
                      <>
                        <button onClick={expandAll} className="text-xs text-slate-400 hover:text-white">
                          Expand All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button onClick={collapseAll} className="text-xs text-slate-400 hover:text-white">
                          Collapse All
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600"
                      title="Export JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowCreate(!showCreate)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      Insert
                    </button>
                  </div>
                </div>
              </div>

              {/* Create Form */}
              {showCreate && (
                <div className="bg-[#0d0d1a] border-b border-[#2a2a4a] p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
                    <FileJson className="w-4 h-4" />
                    Insert Document
                  </div>
                  <textarea
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    className="w-full h-32 bg-[#1a1a2e] text-green-400 font-mono text-sm p-3 rounded border border-[#2a2a4a] focus:border-green-500 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreate}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Insert
                    </button>
                    <button
                      onClick={() => setShowCreate(false)}
                      className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="flex-1 overflow-auto p-4">
                {loading ? (
                  <div className="text-slate-400">Loading...</div>
                ) : viewMode === 'table' ? (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#2a2a4a]">
                          {getDocumentKeys().map((key) => (
                            <th key={key} className="text-left p-2 text-slate-400 font-medium">
                              {key}
                            </th>
                          ))}
                          <th className="w-24"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc._id} className="border-b border-[#2a2a4a] hover:bg-[#2a2a4a]">
                            {getDocumentKeys().map((key) => (
                              <td key={key} className="p-2 font-mono text-xs">
                                <span className="text-slate-300" title={formatValue(doc[key])}>
                                  {truncateValue(formatValue(doc[key]))}
                                </span>
                              </td>
                            ))}
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleStartEdit(doc)}
                                  className="p-1 text-blue-400 hover:text-blue-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(doc._id)}
                                  className="p-1 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* JSON View */
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="bg-[#0d0d1a] rounded border border-[#2a2a4a] overflow-hidden"
                      >
                        {editingDoc === doc._id ? (
                          <div className="p-4">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full h-64 bg-[#1a1a2e] text-green-400 font-mono text-sm p-3 rounded border border-[#2a2a4a] focus:border-green-500 focus:outline-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
                              >
                                <Save className="w-4 h-4" />
                                Update
                              </button>
                              <button
                                onClick={() => setEditingDoc(null)}
                                className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#1a1a2e]"
                              onClick={() => toggleExpand(doc._id)}
                            >
                              <div className="flex items-center gap-2">
                                {expandedDocs.has(doc._id) ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                                <Hash className="w-3 h-3 text-slate-500" />
                                <span className="text-slate-400 font-mono text-xs">{doc._id}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); copyToClipboard(JSON.stringify(doc, null, 2)) }}
                                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStartEdit(doc) }}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc._id) }}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {expandedDocs.has(doc._id) && (
                              <pre className="px-4 py-3 bg-[#0a0a15] text-green-400 font-mono text-xs overflow-x-auto border-t border-[#2a2a4a]">
                                {JSON.stringify(doc, null, 2)}
                              </pre>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.total > 50 && (
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[#2a2a4a]">
                    <button
                      onClick={() => fetchDocuments(selectedCollection, Math.max(0, (pagination.skip || 0) - 50))}
                      disabled={!pagination.skip}
                      className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                    >
                      Previous
                    </button>
                    <span className="text-slate-400 text-sm">
                      {pagination.skip + 1} - {Math.min(pagination.skip + 50, pagination.total)} of {pagination.total}
                    </span>
                    <button
                      onClick={() => fetchDocuments(selectedCollection, (pagination.skip || 0) + 50)}
                      disabled={!pagination.hasMore}
                      className="px-4 py-2 bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-400 mb-2">Select a Collection</h2>
                <p className="text-slate-500">Choose a collection from the sidebar to view documents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
