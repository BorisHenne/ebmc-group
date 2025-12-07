import Link from 'next/link'
import { Server, Monitor, Shield, Brain, Cloud, Code, Database, Lock, ChevronRight } from 'lucide-react'

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  server: Server, monitor: Monitor, shield: Shield, brain: Brain,
  cloud: Cloud, code: Code, database: Database, lock: Lock,
}

const gradientMap: Record<string, string> = {
  turquoise: 'from-[#2DB5B5] to-[#249292]',
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-purple-500 to-pink-500',
  red: 'from-red-500 to-orange-500',
  green: 'from-emerald-500 to-teal-500',
}

export function ServicesBlock({ title, highlightedText, description, services }: any) {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-muted/50" />
      <div className="absolute inset-0 bg-dots opacity-50" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || highlightedText || description) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {(title || highlightedText) && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {title} {highlightedText && <span className="text-gradient">{highlightedText}</span>}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services?.map((service: any, i: number) => {
            const IconComponent = service.icon ? iconMap[service.icon] : Server
            const gradient = service.gradient ? gradientMap[service.gradient] : gradientMap.turquoise

            return (
              <div key={i} className="group p-6 sm:p-8 rounded-xl border bg-card/50 hover:border-[#2DB5B5]/50 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    {service.year && (
                      <div className="text-sm text-muted-foreground">Depuis {service.year}</div>
                    )}
                    <h3 className="text-2xl font-bold">{service.title}</h3>
                  </div>
                </div>
                
                {service.subtitle && (
                  <p className="text-sm font-medium text-[#2DB5B5] mb-2">{service.subtitle}</p>
                )}
                
                {service.description && (
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                )}

                {service.features?.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {service.features.map((f: any, j: number) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2DB5B5]" />
                        {f.feature}
                      </li>
                    ))}
                  </ul>
                )}

                {service.link?.link && (
                  <Link
                    href={service.link.link.page?.slug ? `/${service.link.link.page.slug}` : service.link.link.url || '#'}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#2DB5B5] group-hover:underline"
                  >
                    {service.link.link.label || 'En savoir plus'}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
