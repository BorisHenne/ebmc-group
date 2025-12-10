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
  Loader2,
  CheckCircle,
  Server,
  Cloud,
  Shield
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

const expertiseIcons = [
  { key: 'sap', icon: Server, gradient: 'from-ebmc-turquoise to-cyan-500' },
  { key: 'ict', icon: Cloud, gradient: 'from-violet-500 to-purple-500' },
  { key: 'cybersecurity', icon: Shield, gradient: 'from-emerald-500 to-teal-500' }
]

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

  const modelItems = t.raw('consultants.model.items') as string[]
  const whyWorkItems = t.raw('consultants.whyWork.items') as string[]

  return (
    <TechBackground variant="semi-light">
      <main className="min-h-screen text-slate-800 dark:text-slate-100 overflow-hidden">
        <Navigation currentPage="consultants" variant="auto" />

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

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('consultants.title')} <TextGradient animate={false}>{t('consultants.titleHighlight')}</TextGradient>
              </h1>

              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                {t('consultants.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Model Section */}
        <TechSection className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-10"
            >
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('consultants.model.title')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {modelItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-ebmc-turquoise mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </TechSection>

        {/* Expertise Areas */}
        <TechSection className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {expertiseIcons.map((area, index) => {
                const items = t.raw(`consultants.expertise.${area.key}.items`) as string[]
                return (
                  <motion.div
                    key={area.key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${area.gradient} shadow-lg`}>
                        <area.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {t(`consultants.expertise.${area.key}.title`)}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-ebmc-turquoise mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </TechSection>

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
                      : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
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
                        <h3 className="text-xl font-bold mb-1 truncate text-slate-800 dark:text-white">{consultant.name}</h3>
                        <p className="text-ebmc-turquoise text-sm mb-2 font-medium">
                          {locale === 'fr' ? consultant.title : consultant.titleEn}
                        </p>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                          <MapPin className="w-4 h-4" />
                          {consultant.location}
                        </div>
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4 ${
                      consultant.available
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${consultant.available ? 'bg-green-500' : 'bg-orange-500'}`} />
                      {consultant.available ? t('consultants.available') : t('consultants.unavailable')}
                    </div>

                    {/* Experience */}
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-4">
                      <Briefcase className="w-4 h-4" />
                      <span>{t('consultants.experience')}: </span>
                      <span className="text-slate-800 dark:text-white font-medium">{locale === 'fr' ? consultant.experience : consultant.experienceEn}</span>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('consultants.skills')}</div>
                      <div className="flex flex-wrap gap-2">
                        {consultant.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-600/60 rounded text-xs text-slate-600 dark:text-slate-300 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="mb-6">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('consultants.certifications')}</div>
                      <div className="space-y-1">
                        {consultant.certifications.map((cert, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-ebmc-turquoise" />
                            <span className="text-slate-600 dark:text-slate-300">{cert}</span>
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
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                {t('consultants.noConsultants')}
              </div>
            )}
          </div>
        </TechSection>

        {/* Why Work Section */}
        <TechSection className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-10"
            >
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white text-center">
                {t('consultants.whyWork.title')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {whyWorkItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-ebmc-turquoise mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-lg font-medium text-ebmc-turquoise">
                {t('consultants.cta')}
              </p>
            </motion.div>
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
              <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                {locale === 'fr' ? 'Besoin d\'un expert ?' : 'Need an expert?'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                {locale === 'fr'
                  ? 'Contactez-nous pour discuter de vos besoins et trouver le consultant idéal pour votre projet.'
                  : 'Contact us to discuss your needs and find the ideal consultant for your project.'}
              </p>
              <Link href="/contact">
                <ShimmerButton>
                  <Mail className="w-4 h-4" />
                  {locale === 'fr' ? 'Nous contacter' : 'Contact us'}
                </ShimmerButton>
              </Link>
            </motion.div>
          </div>
        </TechSection>

        <Footer variant="auto" />
      </main>
    </TechBackground>
  )
}
