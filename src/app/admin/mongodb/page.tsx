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
  Copy
} from 'lucide-react'

interface Collection {
  name: string
  type: string
  count: number
}

interface Document {
  _id: string
  [key: string]: unknown
}

export default function MongoDBAdminPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Edit state
  const [editingDoc, setEditingDoc] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // Create state
  const [showCreate, setShowCreate] = useState(false)
  const [newDocContent, setNewDocContent] = useState('{\n  \n}')

  // Expanded documents
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set())

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/mongodb', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setCollections(data.collections)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDocuments = useCallback(async (collection: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/mongodb?collection=${collection}&limit=100`, {
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setDocuments(data.documents)
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
      fetchDocuments(selectedCollection)
    }
  }, [selectedCollection, fetchDocuments])

  const handleSelectCollection = (name: string) => {
    setSelectedCollection(name)
    setDocuments([])
    setEditingDoc(null)
    setShowCreate(false)
  }

  const handleDeleteDocument = async (id: string) => {
    if (!selectedCollection) return
    if (!confirm('Supprimer ce document ?')) return

    try {
      const res = await fetch(
        `/api/admin/mongodb?collection=${selectedCollection}&id=${id}`,
        { method: 'DELETE', credentials: 'include' }
      )
      const data = await res.json()
      if (data.success) {
        setSuccess('Document supprimé')
        fetchDocuments(selectedCollection)
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
      const res = await fetch(
        `/api/admin/mongodb?collection=${name}&drop=true`,
        { method: 'DELETE', credentials: 'include' }
      )
      const data = await res.json()
      if (data.success) {
        setSuccess(`Collection ${name} supprimée`)
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

  const handleStartEdit = (doc: Document) => {
    setEditingDoc(doc._id)
    setEditContent(JSON.stringify(doc, null, 2))
  }

  const handleSaveEdit = async () => {
    if (!editingDoc || !selectedCollection) return

    try {
      const parsed = JSON.parse(editContent)
      // Remove _id from update (can't update _id field)
      const { _id: _unusedId, ...update } = parsed
      void _unusedId // Silence unused variable warning

      const res = await fetch('/api/admin/mongodb', {
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
        setSuccess('Document modifié')
        setEditingDoc(null)
        fetchDocuments(selectedCollection)
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

      const res = await fetch('/api/admin/mongodb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          collection: selectedCollection,
          document: parsed,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Document créé')
        setShowCreate(false)
        setNewDocContent('{\n  \n}')
        fetchDocuments(selectedCollection)
        fetchCollections()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON invalide')
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copié dans le presse-papier')
    setTimeout(() => setSuccess(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-green-500" />
            <h1 className="text-2xl font-bold text-white">MongoDB Admin</h1>
          </div>
          <button
            onClick={() => {
              fetchCollections()
              if (selectedCollection) fetchDocuments(selectedCollection)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Collections List */}
          <div className="col-span-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Collections</h2>
            {loading && !selectedCollection ? (
              <div className="text-slate-400">Chargement...</div>
            ) : (
              <div className="space-y-2">
                {collections.map((col) => (
                  <div
                    key={col.name}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                      selectedCollection === col.name
                        ? 'bg-green-500/20 border border-green-500'
                        : 'bg-slate-700/50 hover:bg-slate-700'
                    }`}
                    onClick={() => handleSelectCollection(col.name)}
                  >
                    <div>
                      <div className="text-white font-medium">{col.name}</div>
                      <div className="text-slate-400 text-sm">{col.count} documents</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDropCollection(col.name)
                      }}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                      title="Supprimer la collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="col-span-9 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            {selectedCollection ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {selectedCollection}
                    <span className="text-slate-400 text-sm ml-2">
                      ({documents.length} documents)
                    </span>
                  </h2>
                  <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Nouveau
                  </button>
                </div>

                {/* Create Form */}
                {showCreate && (
                  <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-2">Nouveau document</h3>
                    <textarea
                      value={newDocContent}
                      onChange={(e) => setNewDocContent(e.target.value)}
                      className="w-full h-40 bg-slate-900 text-green-400 font-mono text-sm p-3 rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save className="w-4 h-4" />
                        Créer
                      </button>
                      <button
                        onClick={() => setShowCreate(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Documents List */}
                {loading ? (
                  <div className="text-slate-400">Chargement...</div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden"
                      >
                        {editingDoc === doc._id ? (
                          <div className="p-4">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full h-60 bg-slate-900 text-green-400 font-mono text-sm p-3 rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                <Save className="w-4 h-4" />
                                Sauvegarder
                              </button>
                              <button
                                onClick={() => setEditingDoc(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
                              >
                                <X className="w-4 h-4" />
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-600/50"
                              onClick={() => toggleExpand(doc._id)}
                            >
                              <div className="flex items-center gap-2">
                                {expandedDocs.has(doc._id) ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                                <span className="text-slate-400 font-mono text-sm">
                                  {doc._id}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyToClipboard(JSON.stringify(doc, null, 2))
                                  }}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded"
                                  title="Copier"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartEdit(doc)
                                  }}
                                  className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteDocument(doc._id)
                                  }}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {expandedDocs.has(doc._id) && (
                              <pre className="p-3 bg-slate-900 text-green-400 font-mono text-xs overflow-x-auto">
                                {JSON.stringify(doc, null, 2)}
                              </pre>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-400 text-center py-12">
                Sélectionnez une collection pour voir les documents
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
