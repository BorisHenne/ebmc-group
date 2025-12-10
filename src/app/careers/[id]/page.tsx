'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Send,
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
  experience: string
  experienceEn: string
  description: string
  descriptionEn: string
  missions: string[]
  missionsEn: string[]
  requirements: string[]
  requirementsEn: string[]
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations()
  const [locale, setLocale] = useState('fr')
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`)
      if (res.ok) {
        const data = await res.json()
        setJob(data.job)
      }
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
    fetchJob()
  }, [fetchJob])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subject: `Candidature: ${job?.title}`,
          type: 'application'
        })
      })
      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (loading) {
    return (
      <TechBackground variant="semi-light">
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-ebmc-turquoise" />
        </main>
      </TechBackground>
    )
  }

  if (!job) {
    return (
      <TechBackground variant="semi-light">
        <main className="min-h-screen text-slate-800 dark:text-slate-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">{locale === 'fr' ? 'Offre non trouvée' : 'Job not found'}</h1>
            <Link href="/careers" className="text-ebmc-turquoise hover:underline">
              {t('jobs.backToList')}
            </Link>
          </div>
        </main>
      </TechBackground>
    )
  }

  const inputClass = "w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-ebmc-turquoise focus:ring-2 focus:ring-ebmc-turquoise/20 outline-none transition-all"

  return (
    <TechBackground variant="semi-light">
      <main className="min-h-screen text-slate-800 dark:text-slate-100 overflow-hidden">
        <Navigation currentPage="careers" variant="auto" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/careers" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-ebmc-turquoise transition mb-8">
                <ArrowLeft className="w-4 h-4" />
                {t('jobs.backToList')}
              </Link>

              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-ebmc-turquoise to-cyan-400 shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                    {locale === 'fr' ? job.title : job.titleEn}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-lg">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <MapPin className="w-5 h-5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Clock className="w-5 h-5" />
                      {locale === 'fr' ? job.type : job.typeEn}
                    </span>
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Users className="w-5 h-5" />
                      {locale === 'fr' ? job.experience : job.experienceEn}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <TechSection className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Job Details */}
              <div className="lg:col-span-2 space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                    <TextGradient animate={false}>{locale === 'fr' ? 'Description du poste' : 'Job Description'}</TextGradient>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                    {locale === 'fr' ? job.description : job.descriptionEn}
                  </p>
                </motion.div>

                {job.missions && job.missions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                      <TextGradient animate={false}>{locale === 'fr' ? 'Vos missions' : 'Your missions'}</TextGradient>
                    </h2>
                    <ul className="space-y-4">
                      {(locale === 'fr' ? job.missions : job.missionsEn || job.missions).map((mission, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-ebmc-turquoise flex-shrink-0 mt-1" />
                          <span className="text-slate-600 dark:text-slate-300">{mission}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                      <TextGradient animate={false}>{locale === 'fr' ? 'Profil recherché' : 'Required profile'}</TextGradient>
                    </h2>
                    <ul className="space-y-4">
                      {(locale === 'fr' ? job.requirements : job.requirementsEn || job.requirements).map((req, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-ebmc-turquoise flex-shrink-0 mt-1" />
                          <span className="text-slate-600 dark:text-slate-300">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Application Form */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="sticky top-32"
                >
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
                      {locale === 'fr' ? 'Postuler à cette offre' : 'Apply to this offer'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="text"
                        placeholder={locale === 'fr' ? 'Votre nom' : 'Your name'}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className={inputClass}
                      />
                      <input
                        type="email"
                        placeholder={locale === 'fr' ? 'Votre email' : 'Your email'}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={inputClass}
                      />
                      <input
                        type="tel"
                        placeholder={locale === 'fr' ? 'Votre téléphone' : 'Your phone'}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                      />
                      <textarea
                        placeholder={locale === 'fr' ? 'Votre message / motivation' : 'Your message / motivation'}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className={`${inputClass} resize-none`}
                      />
                      <ShimmerButton type="submit" className="w-full" disabled={status === 'loading'}>
                        {status === 'loading'
                          ? (locale === 'fr' ? 'Envoi...' : 'Sending...')
                          : (locale === 'fr' ? 'Envoyer ma candidature' : 'Send my application')}
                        <Send className="w-4 h-4" />
                      </ShimmerButton>
                      {status === 'success' && (
                        <p className="text-emerald-600 dark:text-emerald-400 text-center">
                          {locale === 'fr' ? 'Candidature envoyée !' : 'Application sent!'}
                        </p>
                      )}
                      {status === 'error' && (
                        <p className="text-red-500 dark:text-red-400 text-center">
                          {locale === 'fr' ? 'Erreur lors de l\'envoi' : 'Error sending'}
                        </p>
                      )}
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </TechSection>

        <Footer variant="light" />
      </main>
    </TechBackground>
  )
}
