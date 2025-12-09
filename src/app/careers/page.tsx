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
  Globe,
  Loader2
} from 'lucide-react'
import {
  TextGradient,
  ShimmerButton
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

interface Job {
  id: string
  title: string
  titleEn: string
  location: string
  type: string
  typeEn: string
  category: string
  experience: string
  experienceEn: string
  description: string
  descriptionEn: string
}

const benefits = [
  { icon: Rocket, key: 'tech', gradient: 'from-cyan-500 to-blue-500', bgLight: 'bg-cyan-50' },
  { icon: GraduationCap, key: 'training', gradient: 'from-green-500 to-emerald-500', bgLight: 'bg-green-50' },
  { icon: Coffee, key: 'flexible', gradient: 'from-purple-500 to-pink-500', bgLight: 'bg-purple-50' },
  { icon: Heart, key: 'team', gradient: 'from-red-500 to-orange-500', bgLight: 'bg-red-50' },
  { icon: Sparkles, key: 'career', gradient: 'from-yellow-500 to-amber-500', bgLight: 'bg-yellow-50' },
  { icon: Globe, key: 'salary', gradient: 'from-ebmc-turquoise to-cyan-400', bgLight: 'bg-cyan-50' }
]

export default function CareersPage() {
  const t = useTranslations()
  const [locale, setLocale] = useState('fr')
  const [filter, setFilter] = useState('all')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const benefitTexts = t.raw('careers.benefits') as string[]

  const filteredJobs = filter === 'all'
    ? jobs
    : jobs.filter(job => job.category === filter)

  return (
    <TechBackground variant="auto">
      <main className="min-h-screen text-slate-800 dark:text-slate-100 overflow-hidden">
        <Navigation currentPage="careers" variant="auto" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ebmc-turquoise/10 mb-8">
                <Users className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm font-medium text-ebmc-turquoise">{t('careers.badge')}</span>
              </span>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('careers.title')} <TextGradient animate={false}>{t('careers.titleHighlight')}</TextGradient>
              </h1>

              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
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
                  whileHover={{ y: -4 }}
                  className="glass-card p-6 cursor-pointer group"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{benefitTexts[index]}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 dark:text-white">
                {t('careers.openPositions')}
              </h2>

              {/* Filters */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {['all', 'tech', 'consulting', 'management'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-6 py-2.5 rounded-full transition-all font-medium ${
                      filter === cat
                        ? 'bg-ebmc-turquoise text-white shadow-lg shadow-ebmc-turquoise/30'
                        : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {t(`jobs.filters.${cat}`)}
                  </button>
                ))}
              </div>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 cursor-pointer"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-ebmc-turquoise to-cyan-400 shadow-lg">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">
                              {locale === 'fr' ? job.title : job.titleEn}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                              {locale === 'fr' ? job.description : job.descriptionEn}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <MapPin className="w-4 h-4" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <Clock className="w-4 h-4" />
                                {locale === 'fr' ? job.type : job.typeEn}
                              </span>
                              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <Users className="w-4 h-4" />
                                {locale === 'fr' ? job.experience : job.experienceEn}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/careers/${job.id}`}>
                          <button className="px-6 py-3 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition font-medium">
                            {t('jobs.details')}
                          </button>
                        </Link>
                        <ShimmerButton>
                          {t('jobs.apply')}
                          <ArrowRight className="w-4 h-4" />
                        </ShimmerButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && filteredJobs.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                {t('jobs.noJobs')}
              </div>
            )}
          </div>
        </TechSection>

        {/* Spontaneous Application */}
        <TechSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card text-center p-12"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-ebmc-turquoise to-cyan-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{t('careers.spontaneous')}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                {t('careers.spontaneousDesc')}
              </p>
              <a href="mailto:careers@ebmcgroup.eu">
                <ShimmerButton>
                  {t('careers.apply')}
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </a>
            </motion.div>
          </div>
        </TechSection>

        <Footer variant="auto" />
      </main>
    </TechBackground>
  )
}
