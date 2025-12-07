import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Briefcase, Clock, Euro, Globe, 
  Building, CheckCircle, Send, Share2, Heart 
} from 'lucide-react'
import { ApplyForm } from '@/components/careers/ApplyForm'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayloadHMR({ config })
  
  const offer = await payload.find({
    collection: 'offers',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (!offer.docs[0]) return { title: 'Offre non trouvée' }

  const doc = offer.docs[0]
  return {
    title: doc.title,
    description: doc.excerpt || doc.meta?.description,
  }
}

export default async function OfferDetailPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayloadHMR({ config })

  const offer = await payload.find({
    collection: 'offers',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (!offer.docs[0]) {
    notFound()
  }

  const doc = offer.docs[0]

  const categoryLabels: Record<string, string> = {
    sap: 'SAP', ict: 'ICT', cybersecurity: 'Cybersécurité',
    ai: 'IA', management: 'Management', other: 'Autre',
  }

  const typeLabels: Record<string, string> = {
    cdi: 'CDI', cdd: 'CDD', freelance: 'Freelance',
    internship: 'Stage', apprenticeship: 'Alternance',
  }

  const remoteLabels: Record<string, string> = {
    onsite: 'Sur site', hybrid: 'Hybride',
    remote: '100% Remote', flexible: 'Flexible',
  }

  const levelLabels: Record<string, string> = {
    junior: 'Junior (0-2 ans)', mid: 'Confirmé (3-5 ans)',
    senior: 'Senior (6-10 ans)', lead: 'Lead / Expert', executive: 'Executive',
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link 
          href="/careers" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les offres
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#2DB5B5]/10 text-[#2DB5B5] border border-[#2DB5B5]/20">
                  {categoryLabels[doc.category] || doc.category}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted">
                  {typeLabels[doc.type] || doc.type}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{doc.title}</h1>

              {doc.excerpt && (
                <p className="text-lg text-muted-foreground">{doc.excerpt}</p>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border bg-card/50">
                <MapPin className="h-5 w-5 text-[#2DB5B5] mb-2" />
                <div className="text-sm text-muted-foreground">Localisation</div>
                <div className="font-medium">{doc.location}</div>
              </div>
              <div className="p-4 rounded-xl border bg-card/50">
                <Globe className="h-5 w-5 text-[#2DB5B5] mb-2" />
                <div className="text-sm text-muted-foreground">Télétravail</div>
                <div className="font-medium">{remoteLabels[doc.remote]}</div>
              </div>
              <div className="p-4 rounded-xl border bg-card/50">
                <Briefcase className="h-5 w-5 text-[#2DB5B5] mb-2" />
                <div className="text-sm text-muted-foreground">Expérience</div>
                <div className="font-medium">{levelLabels[doc.experienceLevel]}</div>
              </div>
              <div className="p-4 rounded-xl border bg-card/50">
                <Building className="h-5 w-5 text-[#2DB5B5] mb-2" />
                <div className="text-sm text-muted-foreground">Contrat</div>
                <div className="font-medium">{typeLabels[doc.type]}</div>
              </div>
            </div>

            {/* Description */}
            {doc.description && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h2>Description du poste</h2>
                <div dangerouslySetInnerHTML={{ __html: doc.description }} />
              </div>
            )}

            {/* Skills */}
            {doc.skills && doc.skills.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Compétences requises</h2>
                <div className="flex flex-wrap gap-2">
                  {doc.skills.map((skill: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                        skill.required 
                          ? 'bg-[#2DB5B5]/10 border-[#2DB5B5]/20' 
                          : 'bg-muted'
                      }`}
                    >
                      {skill.required && <CheckCircle className="h-4 w-4 text-[#2DB5B5]" />}
                      <span className="text-sm font-medium">{skill.skill}</span>
                      {!skill.required && (
                        <span className="text-xs text-muted-foreground">(optionnel)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {doc.languages && doc.languages.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Langues</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {doc.languages.map((lang: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium capitalize">{lang.language}</span>
                      <span className="text-sm text-muted-foreground capitalize">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {doc.benefits && doc.benefits.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Avantages</h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {doc.benefits.map((b: any, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#2DB5B5]" />
                      <span>{b.benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {doc.requirements && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h2>Autres prérequis</h2>
                <div dangerouslySetInnerHTML={{ __html: doc.requirements }} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Apply Card */}
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="text-lg font-semibold mb-4">Postuler à cette offre</h3>
                
                {/* Salary */}
                {doc.salaryVisible && (doc.salaryMin || doc.salaryMax) && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2DB5B5]/10 text-[#2DB5B5] mb-4">
                    <Euro className="h-5 w-5" />
                    <span className="font-medium">
                      {doc.salaryMin && doc.salaryMax
                        ? `${doc.salaryMin.toLocaleString()} - ${doc.salaryMax.toLocaleString()}`
                        : doc.salaryMin
                        ? `À partir de ${doc.salaryMin.toLocaleString()}`
                        : `Jusqu'à ${doc.salaryMax?.toLocaleString()}`}
                      {doc.salaryCurrency === 'eur' ? '€' : doc.salaryCurrency}
                      {doc.salaryPeriod === 'yearly' ? '/an' : '/mois'}
                    </span>
                  </div>
                )}

                <Link
                  href={`/careers/${doc.slug}/apply`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Postuler maintenant
                </Link>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Sauvegarder</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Partager</span>
                  </button>
                </div>
              </div>

              {/* Company Info */}
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="text-lg font-semibold mb-4">À propos d'EBMC GROUP</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ESN européenne spécialisée en SAP, ICT, Cybersécurité et IA. 
                  Plus de 210 consultants au service de votre transformation digitale.
                </p>
                <Link
                  href="/why-ebmc"
                  className="text-sm text-[#2DB5B5] hover:underline"
                >
                  En savoir plus sur EBMC →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
