'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, Filter, X } from 'lucide-react'

type FilterOption = {
  value: string
  label: string
}

type OffersFiltersProps = {
  categories: FilterOption[]
  types: FilterOption[]
  currentCategory: string
  currentType: string
  currentSearch: string
}

export function OffersFilters({
  categories,
  types,
  currentCategory,
  currentType,
  currentSearch,
}: OffersFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`/careers?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/careers')
    })
  }

  const hasFilters = currentCategory !== 'all' || currentType !== 'all' || currentSearch

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une offre..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border bg-card/50 focus:ring-2 focus:ring-[#2DB5B5] focus:border-transparent transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              updateFilters('search', '')
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtres :
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateFilters('category', cat.value)}
              disabled={isPending}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentCategory === cat.value
                  ? 'bg-[#2DB5B5] text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border hidden sm:block" />

        {/* Types */}
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => updateFilters('type', type.value)}
              disabled={isPending}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentType === type.value
                  ? 'bg-[#2DB5B5] text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Clear */}
        {hasFilters && (
          <>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
            >
              Effacer les filtres
            </button>
          </>
        )}
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="flex justify-center">
          <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#2DB5B5] animate-shimmer" />
          </div>
        </div>
      )}
    </div>
  )
}
