import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import Link from 'next/link'
import { MapPin, Briefcase, ChevronRight } from 'lucide-react'

export async function OffersListBlock({ title, description, filterCategory, filterType, limit = 10, featuredOnly }: any) {
  const payload = await getPayloadHMR({ config })

  const where: any = { _status: { equals: 'published' } }
  if (filterCategory && filterCategory !== 'all') where.category = { equals: filterCategory }
  if (filterType && filterType !== 'all') where.type = { equals: filterType }
  if (featuredOnly) where.featured = { equals: true }

  const offers = await payload.find({
    collection: 'offers',
    where,
    sort: '-publishedAt',
    limit: limit || 10,
  })

  const categoryLabels: Record<string, string> = {
    sap: 'SAP', ict: 'ICT', cybersecurity: 'Cybersécurité',
    ai: 'IA', management: 'Management', other: 'Autre',
  }

  const typeLabels: Record<string, string> = {
    cdi: 'CDI', cdd: 'CDD', freelance: 'Freelance',
    internship: 'Stage', apprenticeship: 'Alternance',
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}

        {offers.docs.length > 0 ? (
          <div className="grid gap-4 max-w-4xl mx-auto">
            {offers.docs.map((offer: any) => (
              <Link key={offer.id} href={`/careers/${offer.slug}`}>
                <div className="group p-6 rounded-xl border bg-card/50 hover:border-[#2DB5B5]/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#2DB5B5]/10 text-[#2DB5B5]">
                          {categoryLabels[offer.category] || offer.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted">
                          {typeLabels[offer.type] || offer.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-[#2DB5B5] transition-colors">
                        {offer.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{offer.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{offer.experienceLevel}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#2DB5B5] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune offre disponible pour le moment.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/careers" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border hover:bg-muted transition-colors">
            Voir toutes les offres <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
