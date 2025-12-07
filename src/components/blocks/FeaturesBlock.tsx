import { Brain, BarChart3, Globe, Puzzle, Eye, CheckCircle, Zap, Target, Rocket, Heart } from 'lucide-react'

const iconMap: Record<string, any> = {
  brain: Brain, chart: BarChart3, globe: Globe, puzzle: Puzzle,
  eye: Eye, check: CheckCircle, zap: Zap, target: Target, rocket: Rocket, heart: Heart,
}

export function FeaturesBlock({ title, highlightedText, description, layout = 'grid', features, bottomStats }: any) {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {title} {highlightedText && <span className="text-gradient">{highlightedText}</span>}
              </h2>
            )}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className={`grid gap-8 ${layout === 'list' ? 'max-w-3xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {features?.map((feature: any, i: number) => {
            const Icon = feature.icon ? iconMap[feature.icon] : CheckCircle
            return (
              <div key={i} className="relative p-6 rounded-xl border bg-card/50 hover:border-[#2DB5B5]/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#2DB5B5]/10 text-[#2DB5B5] group-hover:bg-[#2DB5B5] group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    {feature.description && <p className="text-sm text-muted-foreground">{feature.description}</p>}
                    {feature.highlights?.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {feature.highlights.map((h: any, j: number) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-[#2DB5B5]" />
                            {h.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {bottomStats?.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {bottomStats.map((stat: any, i: number) => (
              <div key={i} className="p-6 rounded-xl bg-[#2DB5B5]/10 text-center">
                <div className="text-3xl font-bold text-[#2DB5B5]">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
