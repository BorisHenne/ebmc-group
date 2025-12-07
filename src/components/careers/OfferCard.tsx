import Link from 'next/link'
import { MapPin, Briefcase, Euro, ChevronRight, Globe } from 'lucide-react'
import type { Offer } from '@/types/offers'

const categoryColors: Record<string, string> = {
  sap: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ict: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  cybersecurity: 'bg-red-500/10 text-red-500 border-red-500/20',
  ai: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  management: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

const categoryLabels: Record<string, string> = {
  sap: 'SAP',
  ict: 'ICT',
  cybersecurity: 'Cybersécurité',
  ai: 'IA',
  management: 'Management',
  other: 'Autre',
}

const typeLabels: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  freelance: 'Freelance',
  internship: 'Stage',
  apprenticeship: 'Alternance',
}

const remoteLabels: Record<string, string> = {
  onsite: 'Sur site',
  hybrid: 'Hybride',
  remote: '100% Remote',
  flexible: 'Flexible',
}

const levelLabels: Record<string, string> = {
  junior: 'Junior',
  mid: 'Confirmé',
  senior: 'Senior',
  lead: 'Lead / Expert',
  executive: 'Executive',
}

const countryLabels: Record<string, string> = {
  luxembourg: '🇱🇺 Luxembourg',
  france: '🇫🇷 France',
  belgium: '🇧🇪 Belgique',
  spain: '🇪🇸 Espagne',
  germany: '🇩🇪 Allemagne',
}

export function OfferCard({ offer }: { offer: Offer }) {
  const formatSalary = () => {
    if (!offer.salaryVisible || (!offer.salaryMin && !offer.salaryMax)) return null
    
    const currency = offer.salaryCurrency === 'eur' ? '€' : offer.salaryCurrency?.toUpperCase()
    const period = offer.salaryPeriod === 'yearly' ? '/an' : offer.salaryPeriod === 'monthly' ? '/mois' : ''
    
    if (offer.salaryMin && offer.salaryMax) {
      return `${offer.salaryMin.toLocaleString()} - ${offer.salaryMax.toLocaleString()}${currency}${period}`
    }
    if (offer.salaryMin) {
      return `À partir de ${offer.salaryMin.toLocaleString()}${currency}${period}`
    }
    return `Jusqu'à ${offer.salaryMax?.toLocaleString()}${currency}${period}`
  }

  const salary = formatSalary()

  return (
    <Link href={`/careers/${offer.slug}`}>
      <div className={`group p-6 rounded-xl border bg-card/50 hover:border-[#2DB5B5]/50 hover:bg-card transition-all ${
        offer.featured ? 'ring-2 ring-[#2DB5B5]/30' : ''
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Category Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[offer.category] || categoryColors.other}`}>
                {categoryLabels[offer.category] || offer.category}
              </span>
              
              {/* Type Badge */}
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted">
                {typeLabels[offer.type] || offer.type}
              </span>

              {/* Featured Badge */}
              {offer.featured && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#2DB5B5]/10 text-[#2DB5B5] border border-[#2DB5B5]/20">
                  ⭐ Offre à la une
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2 group-hover:text-[#2DB5B5] transition-colors">
              {offer.title}
            </h3>

            {/* Excerpt */}
            {offer.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {offer.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{offer.location}</span>
                <span className="text-xs">{countryLabels[offer.country] || offer.country}</span>
              </div>
              
              {offer.remote && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span>{remoteLabels[offer.remote] || offer.remote}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span>{levelLabels[offer.experienceLevel] || offer.experienceLevel}</span>
              </div>

              {salary && (
                <div className="flex items-center gap-1.5 text-[#2DB5B5]">
                  <Euro className="h-4 w-4" />
                  <span className="font-medium">{salary}</span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center">
            <div className="p-3 rounded-full bg-muted group-hover:bg-[#2DB5B5] group-hover:text-white transition-colors">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
