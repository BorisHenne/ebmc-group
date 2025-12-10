'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Database,
  RefreshCw,
  Loader2,
  AlertCircle,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Table,
  FileJson,
  FileSpreadsheet,
  Eye,
  X,
  Check,
  Copy,
  Layers
} from 'lucide-react'

interface CollectionInfo {
  name: string
  count: number
}

interface DocumentData {
  _id: string
  [key: string]: unknown
}

export default function DatabasePage() {
  const [collections, setCollections] = useState<CollectionInfo[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [data, setData] = useState<DocumentData[]>([])
  const [fields, setFields] = useState<string[]>([])
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [skip, setSkip] = useState(0)
  const [limit] = useState(50)
  const [viewDocument, setViewDocument] = useState<DocumentData | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch collections list
  const fetchCollections = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/site/database?action=collections', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la recuperation des collections')
      }

      const result = await response.json()
      setCollections(result.collections || [])
    } catch (err) {
      console.error('Error fetching collections:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch collection data
  const fetchData = useCallback(async (collection: string, newSkip = 0) => {
    setLoadingData(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        collection,
        limit: limit.toString(),
        skip: newSkip.toString(),
      })
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/site/database?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la recuperation des donnees')
      }

      const result = await response.json()
      setData(result.data || [])
      setFields(result.fields || [])
      setTotal(result.total || 0)
      setSkip(newSkip)

      // Select all fields by default
      if (selectedFields.length === 0 && result.fields) {
        setSelectedFields(result.fields.slice(0, 10)) // First 10 by default
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoadingData(false)
    }
  }, [limit, searchQuery, selectedFields.length])

  // Export data
  const handleExport = async (format: 'json' | 'csv') => {
    if (!selectedCollection) return

    setExporting(true)
    try {
      const response = await fetch('/api/site/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          collection: selectedCollection,
          format,
          fields: selectedFields.length > 0 ? selectedFields : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export')
      }

      const result = await response.json()

      // Download file
      const blob = new Blob(
        [format === 'json' ? JSON.stringify(result.data, null, 2) : result.data],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Export error:', err)
      setError(err instanceof Error ? err.message : 'Erreur export')
    } finally {
      setExporting(false)
    }
  }

  // Copy document to clipboard
  const copyToClipboard = async (doc: DocumentData) => {
    await navigator.clipboard.writeText(JSON.stringify(doc, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  useEffect(() => {
    if (selectedCollection) {
      setSelectedFields([])
      fetchData(selectedCollection, 0)
    }
  }, [selectedCollection, fetchData])

  // Format value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toLocaleDateString('fr-FR')
      if (Array.isArray(value)) return `[${value.length} items]`
      return '{...}'
    }
    const str = String(value)
    return str.length > 50 ? str.substring(0, 50) + '...' : str
  }

  // Get total documents
  const totalDocs = collections.reduce((sum, c) => sum + c.count, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Base de donnees MongoDB</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {collections.length} collections • {totalDocs.toLocaleString()} documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCollections}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collections List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            Collections
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {collections.map(col => (
              <button
                key={col.name}
                onClick={() => setSelectedCollection(col.name)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition text-left ${
                  selectedCollection === col.name
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="font-medium truncate">{col.name}</span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  selectedCollection === col.name
                    ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {col.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Data View */}
        <div className="lg:col-span-3 space-y-4">
          {selectedCollection ? (
            <>
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Table className="w-5 h-5 text-gray-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">{selectedCollection}</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {total.toLocaleString()} documents
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchData(selectedCollection, 0)}
                        className="pl-9 pr-4 py-2 w-48 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
                      />
                    </div>

                    {/* Export buttons */}
                    <button
                      onClick={() => handleExport('json')}
                      disabled={exporting || loadingData}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 text-sm"
                    >
                      <FileJson className="w-4 h-4" />
                      JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      disabled={exporting || loadingData}
                      className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </button>
                  </div>
                </div>

                {/* Field selector */}
                {fields.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Colonnes affichees:</p>
                    <div className="flex flex-wrap gap-2">
                      {fields.map(field => (
                        <button
                          key={field}
                          onClick={() => {
                            setSelectedFields(prev =>
                              prev.includes(field)
                                ? prev.filter(f => f !== field)
                                : [...prev, field]
                            )
                          }}
                          className={`px-2 py-1 text-xs rounded-full transition ${
                            selectedFields.includes(field)
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {field}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                {loadingData ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <Database className="w-12 h-12 mb-4 opacity-50" />
                    <p>Aucune donnee dans cette collection</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                            {(selectedFields.length > 0 ? selectedFields : fields.slice(0, 8)).map(field => (
                              <th
                                key={field}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                {field}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                          {data.map((doc, idx) => (
                            <tr key={doc._id || idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => setViewDocument(doc)}
                                  className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition"
                                  title="Voir le document"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                              {(selectedFields.length > 0 ? selectedFields : fields.slice(0, 8)).map(field => (
                                <td
                                  key={field}
                                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {formatValue(doc[field])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage {skip + 1} - {Math.min(skip + limit, total)} sur {total.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchData(selectedCollection, Math.max(0, skip - limit))}
                          disabled={skip === 0 || loadingData}
                          className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => fetchData(selectedCollection, skip + limit)}
                          disabled={skip + limit >= total || loadingData}
                          className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Database className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Selectionnez une collection</p>
              <p className="text-sm">Choisissez une collection dans la liste pour visualiser ses donnees</p>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewDocument && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewDocument(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-emerald-500" />
                Document JSON
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(viewDocument)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm ${
                    copied
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copie!' : 'Copier'}
                </button>
                <button
                  onClick={() => setViewDocument(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
                {JSON.stringify(viewDocument, null, 2)}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
