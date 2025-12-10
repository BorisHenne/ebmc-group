'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Briefcase,
  Loader2,
  User,
  ExternalLink,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Clock,
  Star,
  X,
  RefreshCw,
  Database
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

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'LINKEDIN':
        return 'bg-gradient-to-r from-[#0077B5]/20 to-[#0077B5]/10 text-[#0077B5]'
      case 'MALT':
        return 'bg-gradient-to-r from-[#FC5757]/20 to-[#FC5757]/10 text-[#FC5757]'
      default:
        return 'bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-600 text-gray-600 dark:text-gray-300'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 rounded-xl">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Base de CVs</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {pagination.total > 0 ? `${pagination.total} profils trouvés` : 'Recherchez dans la base de CVs scrappés'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="Rechercher par nom, titre, compétences..."
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Location */}
          <div className="relative lg:w-56">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="Localisation..."
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Source */}
          <select
            value={filters.source}
            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
            className="lg:w-40 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise text-gray-900 dark:text-white"
          >
            {SOURCES.map(src => (
              <option key={src.value} value={src.value}>{src.label}</option>
            ))}
          </select>

          {/* Availability */}
          <select
            value={filters.open_to_work === null ? '' : filters.open_to_work ? 'true' : 'false'}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              open_to_work: e.target.value === '' ? null : e.target.value === 'true'
            }))}
            className="lg:w-40 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise text-gray-900 dark:text-white"
          >
            <option value="">Disponibilité</option>
            <option value="true">Disponibles</option>
            <option value="false">En poste</option>
          </select>

          {/* Search button */}
          <button
            onClick={() => handleSearch(1)}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition-all font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Rechercher
          </button>
        </div>

        {/* Category chips */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Catégories :</p>
          <div className="flex flex-wrap gap-2">
            {JOB_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  filters.job_categories.includes(cat.value)
                    ? 'bg-gradient-to-r from-ebmc-turquoise to-cyan-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
            <X className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Results Table */}
      <div className="glass-card overflow-hidden">
        {/* Table Header */}
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
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-ebmc-turquoise transition"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-ebmc-turquoise/20 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-ebmc-turquoise" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {pagination.total === 0 && filters.query
                ? 'Aucun résultat pour cette recherche'
                : 'Lancez une recherche pour trouver des candidats'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidat</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {results.map((cv, index) => (
                <motion.tr
                  key={cv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50/80 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCV(cv)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ebmc-turquoise to-cyan-500 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0 relative">
                        {cv.profileImageUrl ? (
                          <Image src={cv.profileImageUrl} alt={cv.fullName} fill className="object-cover" unoptimized />
                        ) : (
                          cv.fullName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{cv.fullName}</p>
                        {cv.skills && cv.skills.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {cv.skills.slice(0, 2).map((skill, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {cv.skills.length > 2 && (
                              <span className="text-xs text-gray-400">+{cv.skills.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{cv.jobTitle || '-'}</p>
                    {cv.jobCategory && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {JOB_CATEGORIES.find(c => c.value === cv.jobCategory)?.label || cv.jobCategory}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {cv.location ? (
                      <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-3.5 h-3.5" />
                        {cv.location}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${getSourceBadge(cv.source)}`}>
                      {getSourceIcon(cv.source)}
                      {cv.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    {cv.openToWork ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg">
                        En poste
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {cv.linkedinUrl && (
                        <a
                          href={cv.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-[#0077B5] hover:bg-[#0077B5]/10 rounded-lg transition"
                        >
                          <Linkedin className="w-4 h-4" />
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
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCV(cv); }}
                        className="p-2 text-ebmc-turquoise hover:bg-ebmc-turquoise/10 rounded-lg transition"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
      </div>

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
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ebmc-turquoise to-cyan-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0 relative">
                  {selectedCV.profileImageUrl ? (
                    <Image src={selectedCV.profileImageUrl} alt={selectedCV.fullName} fill className="object-cover" unoptimized />
                  ) : (
                    selectedCV.fullName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCV.fullName}</h2>
                    {selectedCV.openToWork && (
                      <span className="px-2.5 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
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
                    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg ${getSourceBadge(selectedCV.source)}`}>
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

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Contact */}
                <div className="flex flex-wrap gap-3">
                  {selectedCV.email && (
                    <a
                      href={`mailto:${selectedCV.email}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition text-sm"
                    >
                      <Mail className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-200">{selectedCV.email}</span>
                    </a>
                  )}
                  {selectedCV.phone && (
                    <a
                      href={`tel:${selectedCV.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition text-sm"
                    >
                      <Phone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-200">{selectedCV.phone}</span>
                    </a>
                  )}
                  {selectedCV.linkedinUrl && (
                    <a
                      href={selectedCV.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5] rounded-lg transition text-sm font-medium"
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
                      className="flex items-center gap-2 px-4 py-2 bg-[#FC5757]/10 hover:bg-[#FC5757]/20 text-[#FC5757] rounded-lg transition text-sm font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      Malt
                    </a>
                  )}
                </div>

                {/* Malt Info */}
                {selectedCV.source === 'MALT' && (selectedCV.dailyRate || selectedCV.maltRating) && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Infos Malt</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {selectedCV.dailyRate && (
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          TJM: {selectedCV.dailyRate} {selectedCV.currency || '€'}
                        </span>
                      )}
                      {selectedCV.maltRating && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {selectedCV.maltRating}/5
                        </span>
                      )}
                      {selectedCV.maltMissionsCompleted && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
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
                        <span key={i} className="px-3 py-1 bg-gradient-to-r from-ebmc-turquoise/20 to-cyan-500/20 text-ebmc-turquoise text-sm rounded-lg">
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
                          <div className="w-2 h-2 bg-ebmc-turquoise rounded-full mt-2" />
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
