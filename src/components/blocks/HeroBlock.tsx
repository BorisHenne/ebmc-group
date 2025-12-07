import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronDown, Users, Calendar, Building, Award } from 'lucide-react'

type HeroBlockProps = {
  style?: string
  badge?: string
  title: string
  highlightedText?: string
  description?: string
  primaryCta?: {
    link?: {
      type?: string
      page?: { slug: string }
      url?: string
      label?: string
      newTab?: boolean
    }
  }
  secondaryCta?: {
    link?: {
      type?: string
      page?: { slug: string }
      url?: string
      label?: string
      newTab?: boolean
    }
  }
  image?: { url: string; alt: string }
  stats?: Array<{
    value: string
    label: string
    icon?: string
  }>
  showScrollIndicator?: boolean
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  users: Users,
  calendar: Calendar,
  building: Building,
  award: Award,
}

export function HeroBlock({
  style = 'default',
  badge,
  title,
  highlightedText,
  description,
  primaryCta,
  secondaryCta,
  image,
  stats,
  showScrollIndicator = true,
}: HeroBlockProps) {
  const getLink = (cta: typeof primaryCta) => {
    if (!cta?.link) return '#'
    if (cta.link.type === 'internal' && cta.link.page) {
      return `/${cta.link.page.slug === 'home' ? '' : cta.link.page.slug}`
    }
    return cta.link.url || '#'
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-grid dark:bg-grid-dark" />
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#2DB5B5]/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#2DB5B5]/10 rounded-full blur-[128px]" />
      </div>

      {/* Image Background for specific styles */}
      {image && (style === 'withImage' || style === 'fullscreen') && (
        <div className="absolute inset-0">
          <Image
            src={image.url}
            alt={image.alt || ''}
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
      )}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className={`max-w-4xl ${style === 'centered' ? 'mx-auto text-center' : ''}`}>
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DB5B5]/10 border border-[#2DB5B5]/20 text-[#2DB5B5] text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DB5B5] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DB5B5]" />
              </span>
              {badge}
            </div>
          )}

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            {title}{' '}
            {highlightedText && (
              <span className="text-gradient">{highlightedText}</span>
            )}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10">
              {description}
            </p>
          )}

          {/* CTAs */}
          {(primaryCta?.link || secondaryCta?.link) && (
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              {primaryCta?.link && (
                <Link
                  href={getLink(primaryCta)}
                  target={primaryCta.link.newTab ? '_blank' : undefined}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#2DB5B5] text-white font-medium hover:bg-[#249292] transition-colors shadow-lg shadow-[#2DB5B5]/25"
                >
                  {primaryCta.link.label || 'En savoir plus'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {secondaryCta?.link && (
                <Link
                  href={getLink(secondaryCta)}
                  target={secondaryCta.link.newTab ? '_blank' : undefined}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#2DB5B5] text-[#2DB5B5] font-medium hover:bg-[#2DB5B5] hover:text-white transition-colors"
                >
                  {secondaryCta.link.label || 'Découvrir'}
                </Link>
              )}
            </div>
          )}

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {stats.map((stat, i) => {
                const IconComponent = stat.icon ? iconMap[stat.icon] : null
                return (
                  <div key={i} className="relative group">
                    <div className="absolute inset-0 bg-[#2DB5B5]/5 rounded-xl blur-xl group-hover:bg-[#2DB5B5]/10 transition-colors" />
                    <div className="relative p-4 sm:p-6 rounded-xl border bg-card/50 backdrop-blur-sm">
                      {IconComponent && (
                        <IconComponent className="h-5 w-5 text-[#2DB5B5] mb-2" />
                      )}
                      <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
    </section>
  )
}
