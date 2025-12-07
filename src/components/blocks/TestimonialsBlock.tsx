import Image from 'next/image'
import { Star, Quote } from 'lucide-react'

export function TestimonialsBlock({ title, description, testimonials }: any) {
  return (
    <section className="py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials?.map((t: any, i: number) => (
            <div key={i} className="p-6 rounded-xl border bg-card">
              <Quote className="h-8 w-8 text-[#2DB5B5]/30 mb-4" />
              
              {t.rating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < t.rating ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} />
                  ))}
                </div>
              )}
              
              <p className="text-muted-foreground mb-6">{t.quote}</p>
              
              <div className="flex items-center gap-3">
                {t.image?.url && (
                  <Image src={t.image.url} alt={t.author} width={48} height={48} className="rounded-full object-cover" />
                )}
                <div>
                  <div className="font-semibold">{t.author}</div>
                  {(t.role || t.company) && (
                    <div className="text-sm text-muted-foreground">
                      {t.role}{t.company && `, ${t.company}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
