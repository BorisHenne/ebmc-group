import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import Link from 'next/link'
import { Briefcase, Search, ChevronRight } from 'lucide-react'
import { OffersFilters } from '@/components/careers/OffersFilters'
import { OfferCard } from '@/components/careers/OfferCard'
import type { Offer } from '@/types/offers'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Carrières',
  description: 'Rejoignez EBMC GROUP et participez à la transformation digitale des entreprises européennes. Découvrez nos offres SAP, ICT, Cybersécurité et IA.',
}

type SearchParams = {
  category?: string
  type?: string
  location?: string
  search?: string
}

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const payload = await getPayloadHMR({ config })

  // Build query based on filters
  const where: Where = {
    _status: { equals: 'published' },
  }

  if (params.category && params.category !== 'all') {
    where.category = { equals: params.category }
  }
  if (params.type && params.type !== 'all') {
    where.type = { equals: params.type }
  }
  if (params.location) {
    where.location = { contains: params.location }
  }

  const result = await payload.find({
    collection: 'offers',
    where,
    sort: '-publishedAt',
    limit: 50,
  })

  // Cast to Offer type
  const offers = result.docs as Offer[]

  // Filter by search if provided
  let filteredOffers = offers
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredOffers = offers.filter(
      (offer) =>
        offer.title.toLowerCase().includes(searchLower) ||
        offer.excerpt?.toLowerCase().includes(searchLower)
    )
  }

  const categories = [
    { value: 'all', label: 'Toutes' },
    { value: 'sap', label: 'SAP' },
    { value: 'ict', label: 'ICT' },
    { value: 'cybersecurity', label: 'Cybersécurité' },
    { value: 'ai', label: 'IA' },
    { value: 'management', label: 'Management' },
  ]

  const types = [
    { value: 'all', label: 'Tous' },
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Stage' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#2DB5B5]/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DB5B5]/10 border border-[#2DB5B5]/20 text-[#2DB5B5] text-sm font-medium mb-6">
            <Briefcase className="h-4 w-4" />
            {result.totalDocs} offres disponibles
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Rejoignez une équipe <span className="text-gradient">d&apos;experts</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Participez à des projets innovants au cœur de la transformation digitale européenne. 
            Nous recherchons des talents passionnés pour renforcer nos équipes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          {[
            { value: '210+', label: 'Consultants' },
            { value: '4', label: 'Bureaux en Europe' },
            { value: '19+', label: "Années d'existence" },
            { value: '100%', label: 'Remote possible' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border bg-card/50 text-center">
              <div className="text-2xl font-bold text-gradient">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <OffersFilters 
          categories={categories} 
          types={types} 
          currentCategory={params.category || 'all'}
          currentType={params.type || 'all'}
          currentSearch={params.search || ''}
        />

        {/* Offers List */}
        {filteredOffers.length > 0 ? (
          <div className="grid gap-4 max-w-4xl mx-auto mt-8">
            {filteredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="p-4 rounded-full bg-muted inline-flex mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucune offre trouvée</h3>
            <p className="text-muted-foreground mb-6">
              Aucune offre ne correspond à vos critères de recherche. 
              Essayez de modifier vos filtres.
            </p>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] transition-colors"
            >
              Voir toutes les offres
            </Link>
          </div>
        )}

        {/* Spontaneous Application */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl border bg-gradient-to-r from-[#2DB5B5]/10 to-transparent">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  Vous ne trouvez pas l&apos;offre idéale ?
                </h3>
                <p className="text-muted-foreground">
                  Envoyez-nous votre candidature spontanée. Nous sommes toujours à la recherche 
                  de talents pour rejoindre nos équipes.
                </p>
              </div>
              <Link
                href="/contact?type=careers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#2DB5B5] text-[#2DB5B5] font-medium hover:bg-[#2DB5B5] hover:text-white transition-colors whitespace-nowrap"
              >
                Candidature spontanée
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}