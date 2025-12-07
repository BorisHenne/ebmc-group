import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Briefcase, MapPin } from 'lucide-react'
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

  return {
    title: `Postuler - ${offer.docs[0].title}`,
    description: `Postulez à l'offre ${offer.docs[0].title} chez EBMC GROUP`,
  }
}

export default async function ApplyPage({ params }: PageProps) {
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

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        {/* Back Link */}
        <Link 
          href={`/careers/${slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'offre
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#2DB5B5]/10 text-[#2DB5B5] border border-[#2DB5B5]/20">
              {categoryLabels[doc.category] || doc.category}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted">
              {typeLabels[doc.type] || doc.type}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{doc.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {doc.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              {typeLabels[doc.type]}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8 rounded-xl border bg-card/50">
          <h2 className="text-xl font-semibold mb-6">Votre candidature</h2>
          <ApplyForm offerId={doc.id} offerTitle={doc.title} />
        </div>

        {/* Info */}
        <div className="mt-8 p-6 rounded-xl bg-muted/50">
          <h3 className="font-semibold mb-2">Informations importantes</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Votre CV doit être au format PDF, DOC ou DOCX (max 10 Mo)</li>
            <li>• Nous vous contacterons dans un délai de 5 jours ouvrés</li>
            <li>• Vos données sont traitées conformément au RGPD</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
