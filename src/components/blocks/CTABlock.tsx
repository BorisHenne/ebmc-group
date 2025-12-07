// CTABlock
import Link from 'next/link'
import { ArrowRight, MessageSquare, Users, Briefcase, Phone } from 'lucide-react'

const iconMap: Record<string, any> = {
  message: MessageSquare, users: Users, briefcase: Briefcase, phone: Phone,
}

export function CTABlock({ style = 'dark', title, highlightedText, description, primaryCta, secondaryCta, cards, testimonial }: any) {
  const getLink = (cta: any) => {
    if (!cta?.link?.link) return '#'
    return cta.link.link.page?.slug ? `/${cta.link.link.page.slug}` : cta.link.link.url || '#'
  }

  return (
    <section className={`relative py-24 sm:py-32 overflow-hidden ${style === 'dark' ? 'bg-[#1C1C1C]' : 'bg-muted/50'}`}>
      <div className="absolute inset-0 bg-grid-dark opacity-20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2DB5B5]/20 rounded-full blur-[128px]" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${style === 'dark' ? 'text-white' : ''}`}>
          {title} {highlightedText && <span className="text-[#2DB5B5]">{highlightedText}</span>}
        </h2>
        
        {description && (
          <p className={`text-lg max-w-2xl mx-auto mb-8 ${style === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {primaryCta?.link && (
            <Link href={getLink(primaryCta)} className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] transition-colors animate-pulse-glow">
              {primaryCta.link.link?.label || 'Nous contacter'} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {secondaryCta?.link && (
            <Link href={getLink(secondaryCta)} className={`inline-flex items-center px-8 py-4 rounded-lg border font-medium transition-colors ${style === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-border hover:bg-muted'}`}>
              {secondaryCta.link.link?.label || 'En savoir plus'}
            </Link>
          )}
        </div>

        {cards?.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {cards.map((card: any, i: number) => {
              const Icon = card.icon ? iconMap[card.icon] : MessageSquare
              return (
                <div key={i} className="p-6 rounded-xl border bg-white/5 backdrop-blur-sm text-left">
                  <Icon className="h-8 w-8 text-[#2DB5B5] mb-4" />
                  <h3 className={`font-semibold mb-2 ${style === 'dark' ? 'text-white' : ''}`}>{card.title}</h3>
                  <p className="text-sm text-gray-400">{card.description}</p>
                </div>
              )
            })}
          </div>
        )}

        {testimonial?.quote && (
          <div className="mt-12 max-w-2xl mx-auto">
            <blockquote className={`text-lg italic ${style === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
              "{testimonial.quote}"
            </blockquote>
            <div className={`mt-4 font-medium ${style === 'dark' ? 'text-white' : ''}`}>
              {testimonial.author}
              {testimonial.role && <span className="text-[#2DB5B5]"> — {testimonial.role}</span>}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
