import Image from 'next/image'
import Link from 'next/link'
import { Linkedin, Mail } from 'lucide-react'

export function TeamBlock({ title, description, members }: any) {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members?.map((m: any, i: number) => (
            <div key={i} className="group text-center">
              <div className="relative mb-4 aspect-square rounded-xl overflow-hidden bg-muted">
                {m.image?.url ? (
                  <Image src={m.image.url} alt={m.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                    {m.name?.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-semibold">{m.name}</h3>
              {m.role && <p className="text-sm text-[#2DB5B5]">{m.role}</p>}
              {m.bio && <p className="text-sm text-muted-foreground mt-2">{m.bio}</p>}
              
              <div className="flex justify-center gap-2 mt-3">
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {m.email && (
                  <a href={`mailto:${m.email}`} className="p-2 rounded-lg hover:bg-muted">
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
