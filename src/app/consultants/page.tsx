'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  User,
  MapPin,
  Award,
  Briefcase,
  Mail,
  Star,
  Loader2
} from 'lucide-react'
import {
  TextGradient,
  ShimmerButton
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

interface Consultant {
  id: string
  name: string
  title: string
  titleEn: string
  location: string
  experience: string
  experienceEn: string
  category: string
  available: boolean
  skills: string[]
  certifications: string[]
}

export default function ConsultantsPage() {
  const t = useTranslations()
  const [locale, setLocale] = useState('fr')
  const [filter, setFilter] = useState('all')
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      const res = await fetch('/api/consultants')
      if (res.ok) {
        const data = await res.json()
        setConsultants(data.consultants || [])
      }
    } catch (error) {
      console.error('Error fetching consultants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultants = filter === 'all'
    ? consultants
    : consultants.filter(c => c.category === filter)

  return (
    <TechBackground variant="semi-light">
      <main className="min-h-screen text-slate-800 overflow-hidden">
        <Navigation currentPage="consultants" variant="light" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ebmc-turquoise/10 mb-8">
                <Star className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm font-medium text-ebmc-turquoise">{t('consultants.badge')}</span>
              </span>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900">
                {t('consultants.title')} <TextGradient animate={false}>{t('consultants.titleHighlight')}</TextGradient>
              </h1>

              <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                {t('consultants.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <TechSection className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {['all', 'sap', 'security', 'dev', 'data'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 rounded-full transition-all font-medium ${
                    filter === cat
                      ? 'bg-ebmc-turquoise text-white shadow-lg shadow-ebmc-turquoise/30'
                      : 'bg-white/60 border border-slate-200/60 text-slate-600 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  {t(`consultants.filters.${cat}`)}
                </button>
              ))}
            </div>
          </div>
        </TechSection>

        {/* Consultants Grid */}
        <TechSection className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredConsultants.map((consultant, index) => (
                  <motion.div
                    key={consultant.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 cursor-pointer"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ebmc-turquoise to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-1 truncate text-slate-800">{consultant.name}</h3>
                        <p className="text-ebmc-turquoise text-sm mb-2 font-medium">
                          {locale === 'fr' ? consultant.title : consultant.titleEn}
                        </p>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          {consultant.location}
                        </div>
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4 ${
                      consultant.available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${consultant.available ? 'bg-green-500' : 'bg-orange-500'}`} />
                      {consultant.available ? t('consultants.available') : t('consultants.unavailable')}
                    </div>

                    {/* Experience */}
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                      <Briefcase className="w-4 h-4" />
                      <span>{t('consultants.experience')}: </span>
                      <span className="text-slate-800 font-medium">{locale === 'fr' ? consultant.experience : consultant.experienceEn}</span>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="text-sm text-slate-500 mb-2">{t('consultants.skills')}</div>
                      <div className="flex flex-wrap gap-2">
                        {consultant.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-slate-100 border border-slate-200/60 rounded text-xs text-slate-600 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="mb-6">
                      <div className="text-sm text-slate-500 mb-2">{t('consultants.certifications')}</div>
                      <div className="space-y-1">
                        {consultant.certifications.map((cert, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-ebmc-turquoise" />
                            <span className="text-slate-600">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Button */}
                    {consultant.available && (
                      <a href={`mailto:contact@ebmcgroup.eu?subject=Contact consultant: ${consultant.name}`}>
                        <ShimmerButton className="w-full">
                          <Mail className="w-4 h-4" />
                          {t('consultants.contact')}
                        </ShimmerButton>
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && filteredConsultants.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                {t('consultants.noConsultants')}
              </div>
            )}
          </div>
        </TechSection>

        {/* CTA Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-card p-12"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-ebmc-turquoise to-cyan-500 flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-slate-900">
                {locale === 'fr' ? 'Besoin d\'un expert ?' : 'Need an expert?'}
              </h2>
              <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">
                {locale === 'fr'
                  ? 'Contactez-nous pour discuter de vos besoins et trouver le consultant idéal pour votre projet.'
                  : 'Contact us to discuss your needs and find the ideal consultant for your project.'}
              </p>
              <Link href="/#contact">
                <ShimmerButton>
                  <Mail className="w-4 h-4" />
                  {locale === 'fr' ? 'Nous contacter' : 'Contact us'}
                </ShimmerButton>
              </Link>
            </motion.div>
          </div>
        </TechSection>

        <Footer variant="light" />
      </main>
    </TechBackground>
  )
}
