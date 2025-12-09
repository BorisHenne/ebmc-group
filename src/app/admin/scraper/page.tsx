'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Briefcase,
  Loader2,
  User,
  ExternalLink,
  CheckCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Clock,
  Star,
  X,
  RefreshCw
} from 'lucide-react'

interface CVResult {
  id: string
  firstName?: string
  lastName?: string
  fullName: string
  email?: string
  phone?: string
  jobTitle?: string
  jobCategory?: string
  summary?: string
  location?: string
  linkedinUrl?: string
  openToWork: boolean
  isProfileComplete?: boolean
  source: 'LINKEDIN' | 'MALT' | 'MANUAL'
  profileImageUrl?: string
  maltUrl?: string
  dailyRate?: number
  currency?: string
  maltRating?: number
  maltMissionsCompleted?: number
  skills: string[]
  experiences?: Array<{
    title: string
    company: string
    duration?: string
  }>
  languages?: Array<{
    name: string
    level?: string
  }>
  createdAt: string
  updatedAt: string
}

interface SearchFilters {
  query: string
  location: string
  job_categories: string[]
  open_to_work: boolean | null
  source: string
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
  has_more: boolean
}

const JOB_CATEGORIES = [
  { value: 'DEVELOPER', label: 'Développeur' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'PRODUCT_MANAGER', label: 'Product Manager' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SALES', label: 'Commercial' },
  { value: 'HR', label: 'RH' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'OPERATIONS', label: 'Opérations' },
  { value: 'DATA_SCIENTIST', label: 'Data Scientist' },
  { value: 'FUND_ADMIN', label: 'Fund Admin' },
  { value: 'LEGAL', label: 'Juridique' },
  { value: 'COMPLIANCE', label: 'Compliance' },
  { value: 'OTHER', label: 'Autre' },
]

const SOURCES = [
  { value: '', label: 'Toutes sources' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'MALT', label: 'Malt' },
  { value: 'MANUAL', label: 'Manuel' },
]

export default function ScraperPage() {
  const [results, setResults] = useState<CVResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCV, setSelectedCV] = useState<CVResult | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
    has_more: false
  })

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    job_categories: [],
    open_to_work: null,
    source: ''
  })

  const handleSearch = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        page,
        page_size: 20
      }

      if (filters.query.trim()) body.query = filters.query.trim()
      if (filters.location.trim()) body.location = filters.location.trim()
      if (filters.job_categories.length > 0) body.job_categories = filters.job_categories
      if (filters.open_to_work !== null) body.open_to_work = filters.open_to_work
      if (filters.source) body.source = filters.source

      const res = await fetch('/api/scraper/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la recherche')
      }

      const data = await res.json()
      setResults(data.results || [])
      setPagination(data.pagination || {
        page,
        page_size: 20,
        total: data.results?.length || 0,
        total_pages: 1,
        has_more: false
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(1)
    }
  }

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      job_categories: prev.job_categories.includes(category)
        ? prev.job_categories.filter(c => c !== category)
        : [...prev.job_categories, category]
    }))
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'LINKEDIN':
        return <Linkedin className="w-4 h-4 text-[#0077B5]" />
      case 'MALT':
        return <Globe className="w-4 h-4 text-[#FC5757]" />
      default:
        return <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'LINKEDIN':
        return 'bg-[#0077B5]/10 text-[#0077B5] border-[#0077B5]/20'
      case 'MALT':
        return 'bg-[#FC5757]/10 text-[#FC5757] border-[#FC5757]/20'
      default:
        return 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recherche de Candidats</h1>
            <p className="text-gray-500 dark:text-gray-400">Recherchez dans la base de CVs scrappés</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="Rechercher par nom, titre, compétences..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="relative md:w-64">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="Localisation..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition ${
              showFilters ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden md:inline">Filtres</span>
            {filters.job_categories.length > 0 && (
              <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                {filters.job_categories.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleSearch(1)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Rechercher
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 space-y-4"
            >
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégories de poste
                </label>
                <div className="flex flex-wrap gap-2">
                  {JOB_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategory(cat.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                        filters.job_categories.includes(cat.value)
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source & Availability */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Source
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {SOURCES.map(src => (
                      <option key={src.value} value={src.value}>{src.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Disponibilité
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, open_to_work: null }))}
                      className={`flex-1 px-4 py-2.5 text-sm rounded-xl border transition ${
                        filters.open_to_work === null
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, open_to_work: true }))}
                      className={`flex-1 px-4 py-2.5 text-sm rounded-xl border transition ${
                        filters.open_to_work === true
                          ? 'bg-green-50 border-green-500 text-green-600'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Disponibles
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, open_to_work: false }))}
                      className={`flex-1 px-4 py-2.5 text-sm rounded-xl border transition ${
                        filters.open_to_work === false
                          ? 'bg-orange-50 border-orange-500 text-orange-600'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      En poste
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
        >
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
      >
        {/* Results Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {pagination.total > 0
                ? `${pagination.total} résultat${pagination.total > 1 ? 's' : ''}`
                : 'Résultats'
              }
            </h2>
            {pagination.total > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} sur {pagination.total_pages}
              </p>
            )}
          </div>
          {results.length > 0 && (
            <button
              onClick={() => handleSearch(pagination.page)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          )}
        </div>

        {/* Results List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {pagination.total === 0 && filters.query
                ? 'Aucun résultat pour cette recherche'
                : 'Lancez une recherche pour trouver des candidats'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {results.map((cv) => (
              <motion.div
                key={cv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition"
                onClick={() => setSelectedCV(cv)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold overflow-hidden flex-shrink-0">
                    {cv.profileImageUrl ? (
                      <img src={cv.profileImageUrl} alt={cv.fullName} className="w-full h-full object-cover" />
                    ) : (
                      cv.fullName?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{cv.fullName}</h3>
                      {cv.openToWork && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Open to Work
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full border flex items-center gap-1 ${getSourceColor(cv.source)}`}>
                        {getSourceIcon(cv.source)}
                        {cv.source}
                      </span>
                    </div>
                    {cv.jobTitle && (
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{cv.jobTitle}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {cv.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {cv.location}
                        </span>
                      )}
                      {cv.jobCategory && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {JOB_CATEGORIES.find(c => c.value === cv.jobCategory)?.label || cv.jobCategory}
                        </span>
                      )}
                      {cv.dailyRate && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          {cv.dailyRate} {cv.currency || '€'}/jour
                        </span>
                      )}
                    </div>
                    {cv.skills && cv.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {cv.skills.slice(0, 6).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {cv.skills.length > 6 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">+{cv.skills.length - 6}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {cv.linkedinUrl && (
                      <a
                        href={cv.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-[#0077B5] hover:bg-[#0077B5]/10 rounded-lg transition"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {cv.maltUrl && (
                      <a
                        href={cv.maltUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-[#FC5757] hover:bg-[#FC5757]/10 rounded-lg transition"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <button
              onClick={() => handleSearch(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.page} sur {pagination.total_pages}
            </span>
            <button
              onClick={() => handleSearch(pagination.page + 1)}
              disabled={!pagination.has_more || loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* CV Detail Modal */}
      <AnimatePresence>
        {selectedCV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCV(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                  {selectedCV.profileImageUrl ? (
                    <img src={selectedCV.profileImageUrl} alt={selectedCV.fullName} className="w-full h-full object-cover" />
                  ) : (
                    selectedCV.fullName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCV.fullName}</h2>
                    {selectedCV.openToWork && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Disponible
                      </span>
                    )}
                  </div>
                  {selectedCV.jobTitle && (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedCV.jobTitle}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {selectedCV.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedCV.location}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${getSourceColor(selectedCV.source)}`}>
                      {getSourceIcon(selectedCV.source)}
                      {selectedCV.source}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCV(null)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Contact */}
                <div className="flex flex-wrap gap-4">
                  {selectedCV.email && (
                    <a
                      href={`mailto:${selectedCV.email}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 rounded-lg transition"
                    >
                      <Mail className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      {selectedCV.email}
                    </a>
                  )}
                  {selectedCV.phone && (
                    <a
                      href={`tel:${selectedCV.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 rounded-lg transition"
                    >
                      <Phone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      {selectedCV.phone}
                    </a>
                  )}
                  {selectedCV.linkedinUrl && (
                    <a
                      href={selectedCV.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5] rounded-lg transition"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {selectedCV.maltUrl && (
                    <a
                      href={selectedCV.maltUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#FC5757]/10 hover:bg-[#FC5757]/20 text-[#FC5757] rounded-lg transition"
                    >
                      <Globe className="w-4 h-4" />
                      Malt
                    </a>
                  )}
                </div>

                {/* Malt Info */}
                {selectedCV.source === 'MALT' && (selectedCV.dailyRate || selectedCV.maltRating) && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h3 className="font-semibold text-orange-800 mb-2">Infos Malt</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {selectedCV.dailyRate && (
                        <span className="font-medium text-orange-600">
                          TJM: {selectedCV.dailyRate} {selectedCV.currency || '€'}
                        </span>
                      )}
                      {selectedCV.maltRating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {selectedCV.maltRating}/5
                        </span>
                      )}
                      {selectedCV.maltMissionsCompleted && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {selectedCV.maltMissionsCompleted} missions
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedCV.summary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Résumé</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{selectedCV.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedCV.skills && selectedCV.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Compétences</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCV.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experiences */}
                {selectedCV.experiences && selectedCV.experiences.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Expériences</h3>
                    <div className="space-y-3">
                      {selectedCV.experiences.slice(0, 5).map((exp, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{exp.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{exp.company}</p>
                            {exp.duration && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {exp.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedCV.languages && selectedCV.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Langues</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCV.languages.map((lang, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg">
                          {lang.name}
                          {lang.level && <span className="text-gray-400 dark:text-gray-500 ml-1">({lang.level})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <p>Profil ajouté le {new Date(selectedCV.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p>Dernière mise à jour le {new Date(selectedCV.updatedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
