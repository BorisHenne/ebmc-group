'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  Users,
  Sparkles,
  GraduationCap,
  Heart,
  Rocket,
  Coffee,
  Globe
} from 'lucide-react'
import {
  SpotlightCard,
  GlowingCard,
  TextGradient,
  ShimmerButton
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

const jobs = [
  {
    id: 1,
    title: 'Consultant SAP S/4HANA Senior',
    titleEn: 'Senior SAP S/4HANA Consultant',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'consulting',
    experience: '5+ ans',
    experienceEn: '5+ years',
    description: 'Accompagnez nos clients dans leur transformation digitale avec SAP S/4HANA.',
    descriptionEn: 'Support our clients in their digital transformation with SAP S/4HANA.'
  },
  {
    id: 2,
    title: 'Ingénieur Cybersécurité',
    titleEn: 'Cybersecurity Engineer',
    location: 'Paris / Remote',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'tech',
    experience: '3+ ans',
    experienceEn: '3+ years',
    description: 'Protégez les systèmes de nos clients avec des solutions de sécurité avancées.',
    descriptionEn: 'Protect our clients systems with advanced security solutions.'
  },
  {
    id: 3,
    title: 'Développeur Full Stack React/Node.js',
    titleEn: 'Full Stack Developer React/Node.js',
    location: 'Paris / Remote',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'tech',
    experience: '2+ ans',
    experienceEn: '2+ years',
    description: 'Développez des applications web modernes avec React et Node.js.',
    descriptionEn: 'Develop modern web applications with React and Node.js.'
  },
  {
    id: 4,
    title: 'Data Scientist IA/ML',
    titleEn: 'AI/ML Data Scientist',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'tech',
    experience: '3+ ans',
    experienceEn: '3+ years',
    description: 'Concevez et déployez des modèles de Machine Learning pour nos clients.',
    descriptionEn: 'Design and deploy Machine Learning models for our clients.'
  },
  {
    id: 5,
    title: 'Chef de Projet IT',
    titleEn: 'IT Project Manager',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    category: 'management',
    experience: '5+ ans',
    experienceEn: '5+ years',
    description: 'Pilotez des projets de transformation digitale de bout en bout.',
    descriptionEn: 'Lead digital transformation projects end-to-end.'
  }
]

const benefits = [
  { icon: Rocket, key: 'tech', color: 'from-cyan-500 to-blue-500' },
  { icon: GraduationCap, key: 'training', color: 'from-green-500 to-emerald-500' },
  { icon: Coffee, key: 'flexible', color: 'from-purple-500 to-pink-500' },
  { icon: Heart, key: 'team', color: 'from-red-500 to-orange-500' },
  { icon: Sparkles, key: 'career', color: 'from-yellow-500 to-amber-500' },
  { icon: Globe, key: 'salary', color: 'from-ebmc-turquoise to-cyan-400' }
]

export default function CareersPage() {
  const t = useTranslations()
  const [locale, setLocale] = useState('fr')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
  }, [])

  const benefitTexts = t.raw('careers.benefits') as string[]

  const filteredJobs = filter === 'all'
    ? jobs
    : jobs.filter(job => job.category === filter)

  return (
    <TechBackground>
      <main className="min-h-screen text-white overflow-hidden">
        <Navigation currentPage="careers" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <Users className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm text-white/80">{t('careers.badge')}</span>
              </span>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                {t('careers.title')} <TextGradient>{t('careers.titleHighlight')}</TextGradient>
              </h1>

              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                {t('careers.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('careers.whyJoin')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <SpotlightCard className="h-full">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.color} mb-4`}>
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white/80">{benefitTexts[index]}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </TechSection>

        {/* Jobs Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                {t('careers.openPositions')}
              </h2>

              {/* Filters */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {['all', 'tech', 'consulting', 'management'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-6 py-2 rounded-full transition-all ${
                      filter === cat
                        ? 'bg-ebmc-turquoise text-white'
                        : 'glass text-white/70 hover:text-white'
                    }`}
                  >
                    {t(`jobs.filters.${cat}`)}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlowingCard className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-ebmc-turquoise to-cyan-400">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold mb-2">
                              {locale === 'fr' ? job.title : job.titleEn}
                            </h3>
                            <p className="text-white/60 mb-4">
                              {locale === 'fr' ? job.description : job.descriptionEn}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-2 text-white/60">
                                <MapPin className="w-4 h-4" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-2 text-white/60">
                                <Clock className="w-4 h-4" />
                                {locale === 'fr' ? job.type : job.typeEn}
                              </span>
                              <span className="flex items-center gap-2 text-white/60">
                                <Users className="w-4 h-4" />
                                {locale === 'fr' ? job.experience : job.experienceEn}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/careers/${job.id}`}>
                          <button className="px-6 py-3 rounded-full glass text-white/70 hover:text-white transition">
                            {t('jobs.details')}
                          </button>
                        </Link>
                        <ShimmerButton>
                          {t('jobs.apply')}
                          <ArrowRight className="w-4 h-4" />
                        </ShimmerButton>
                      </div>
                    </div>
                  </GlowingCard>
                </motion.div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 text-white/60">
                {t('jobs.noJobs')}
              </div>
            )}
          </div>
        </TechSection>

        {/* Spontaneous Application */}
        <TechSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <GlowingCard className="text-center p-12">
              <Sparkles className="w-16 h-16 text-ebmc-turquoise mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">{t('careers.spontaneous')}</h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                {t('careers.spontaneousDesc')}
              </p>
              <a href="mailto:careers@ebmc-group.com">
                <ShimmerButton>
                  {t('careers.apply')}
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </a>
            </GlowingCard>
          </div>
        </TechSection>

        <Footer />
      </main>
    </TechBackground>
  )
}
