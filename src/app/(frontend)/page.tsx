import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayloadHMR({ config })

  const page = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'home' },
    },
    limit: 1,
  })

  if (!page.docs[0]) {
    // Fallback to static home page if no CMS content
    return <StaticHomePage />
  }

  const { layout } = page.docs[0]

  return (
    <>
      {layout && <RenderBlocks blocks={layout} />}
    </>
  )
}

// Static fallback home page
function StaticHomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background">
          <div className="absolute inset-0 bg-grid dark:bg-grid-dark" />
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#2DB5B5]/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#2DB5B5]/10 rounded-full blur-[128px]" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DB5B5]/10 border border-[#2DB5B5]/20 text-[#2DB5B5] text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DB5B5] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DB5B5]" />
              </span>
              SAP Silver Partner · Depuis 2006
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              L'union européenne de{' '}
              <span className="text-gradient">l'expertise digitale</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Votre ESN de référence en Europe, née dans le SAP, enrichie par l'ICT, 
              renforcée par la cybersécurité. Maîtriser la technologie, préserver l'humain.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] transition-colors shadow-lg shadow-[#2DB5B5]/25"
              >
                Discutons de votre projet
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/careers"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#2DB5B5] text-[#2DB5B5] font-medium hover:bg-[#2DB5B5] hover:text-white transition-colors"
              >
                Rejoignez-nous
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {[
                { value: '210+', label: 'Consultants' },
                { value: '19+', label: "Années d'expertise" },
                { value: '4', label: "Pôles d'expertise" },
                { value: '99.8%', label: 'SLA garanti' },
              ].map((stat) => (
                <div key={stat.label} className="relative group">
                  <div className="absolute inset-0 bg-[#2DB5B5]/5 rounded-xl blur-xl group-hover:bg-[#2DB5B5]/10 transition-colors" />
                  <div className="relative p-4 sm:p-6 rounded-xl border bg-card/50 backdrop-blur-sm">
                    <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-muted/50" />
        <div className="absolute inset-0 bg-dots opacity-50" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Une croissance portée par{' '}
              <span className="text-gradient">4 expertises stratégiques</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              De la stratégie à l'exécution, nous couvrons l'ensemble de vos besoins 
              en transformation digitale avec des équipes spécialisées.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {[
              { year: '2006', title: 'SAP', subtitle: 'Notre ADN', gradient: 'from-blue-500 to-cyan-500' },
              { year: '2019', title: 'ICT', subtitle: 'Innovation Continue', gradient: 'from-purple-500 to-pink-500' },
              { year: '2025', title: 'Cybersécurité', subtitle: 'Security by Design', gradient: 'from-red-500 to-orange-500' },
              { year: '2026', title: 'IA Générative', subtitle: 'Copilotes & Automation', gradient: 'from-emerald-500 to-teal-500' },
            ].map((service) => (
              <div key={service.title} className="p-6 sm:p-8 rounded-xl border bg-card/50 hover:border-[#2DB5B5]/50 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient} text-white`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Depuis {service.year}</div>
                    <h3 className="text-2xl font-bold">{service.title}</h3>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#2DB5B5] mb-2">{service.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-[#1C1C1C]">
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2DB5B5]/20 rounded-full blur-[128px]" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à transformer votre{' '}
            <span className="text-[#2DB5B5]">infrastructure IT</span> ?
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Discutons de votre projet et découvrez comment EBMC GROUP peut vous accompagner.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] transition-colors animate-pulse-glow"
            >
              Parlons de votre projet
            </a>
            <a
              href="/careers"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Rejoindre l'équipe
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
