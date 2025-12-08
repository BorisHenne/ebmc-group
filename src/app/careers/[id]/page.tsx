'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, use } from 'react'
import Image from 'next/image'
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
  LogIn,
  Menu,
  X
} from 'lucide-react'
import {
  GlowingCard,
  Meteors,
  GridBackground,
  TextGradient,
  ShimmerButton,
  FloatingElements
} from '@/components/ui/aceternity'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const jobs = [
  {
    id: '1',
    title: 'Consultant SAP S/4HANA Senior',
    titleEn: 'Senior SAP S/4HANA Consultant',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    experience: '5+ ans',
    experienceEn: '5+ years',
    description: 'Accompagnez nos clients dans leur transformation digitale avec SAP S/4HANA.',
    descriptionEn: 'Support our clients in their digital transformation with SAP S/4HANA.',
    missions: [
      'Analyser les besoins métier des clients',
      'Concevoir et implémenter des solutions SAP S/4HANA',
      'Accompagner les équipes dans la conduite du changement',
      'Assurer le support et la maintenance des solutions'
    ],
    missionsEn: [
      'Analyze client business needs',
      'Design and implement SAP S/4HANA solutions',
      'Support teams in change management',
      'Provide solution support and maintenance'
    ],
    requirements: [
      '5+ ans d\'expérience en consulting SAP',
      'Certification SAP S/4HANA',
      'Excellentes compétences en communication',
      'Anglais courant'
    ],
    requirementsEn: [
      '5+ years SAP consulting experience',
      'SAP S/4HANA certification',
      'Excellent communication skills',
      'Fluent English'
    ]
  },
  {
    id: '2',
    title: 'Ingénieur Cybersécurité',
    titleEn: 'Cybersecurity Engineer',
    location: 'Paris / Remote',
    type: 'CDI',
    typeEn: 'Full-time',
    experience: '3+ ans',
    experienceEn: '3+ years',
    description: 'Protégez les systèmes de nos clients avec des solutions de sécurité avancées.',
    descriptionEn: 'Protect our clients systems with advanced security solutions.',
    missions: [
      'Auditer la sécurité des systèmes d\'information',
      'Mettre en place des solutions de protection',
      'Répondre aux incidents de sécurité',
      'Former les équipes aux bonnes pratiques'
    ],
    missionsEn: [
      'Audit information system security',
      'Implement protection solutions',
      'Respond to security incidents',
      'Train teams on best practices'
    ],
    requirements: [
      '3+ ans en cybersécurité',
      'Certifications (CISSP, CEH, OSCP)',
      'Maîtrise des outils de sécurité',
      'Veille technologique active'
    ],
    requirementsEn: [
      '3+ years in cybersecurity',
      'Certifications (CISSP, CEH, OSCP)',
      'Mastery of security tools',
      'Active technology watch'
    ]
  },
  {
    id: '3',
    title: 'Développeur Full Stack React/Node.js',
    titleEn: 'Full Stack Developer React/Node.js',
    location: 'Paris / Remote',
    type: 'CDI',
    typeEn: 'Full-time',
    experience: '2+ ans',
    experienceEn: '2+ years',
    description: 'Développez des applications web modernes avec React et Node.js.',
    descriptionEn: 'Develop modern web applications with React and Node.js.',
    missions: [
      'Développer des interfaces utilisateur avec React',
      'Créer des APIs RESTful avec Node.js',
      'Participer aux code reviews',
      'Optimiser les performances des applications'
    ],
    missionsEn: [
      'Develop user interfaces with React',
      'Create RESTful APIs with Node.js',
      'Participate in code reviews',
      'Optimize application performance'
    ],
    requirements: [
      '2+ ans en développement web',
      'Maîtrise de React et Node.js',
      'Connaissance des bases de données',
      'Méthodologies agiles'
    ],
    requirementsEn: [
      '2+ years in web development',
      'Mastery of React and Node.js',
      'Database knowledge',
      'Agile methodologies'
    ]
  },
  {
    id: '4',
    title: 'Data Scientist IA/ML',
    titleEn: 'AI/ML Data Scientist',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    experience: '3+ ans',
    experienceEn: '3+ years',
    description: 'Concevez et déployez des modèles de Machine Learning pour nos clients.',
    descriptionEn: 'Design and deploy Machine Learning models for our clients.',
    missions: [
      'Analyser et préparer les données',
      'Développer des modèles de ML',
      'Déployer les modèles en production',
      'Mesurer et améliorer les performances'
    ],
    missionsEn: [
      'Analyze and prepare data',
      'Develop ML models',
      'Deploy models to production',
      'Measure and improve performance'
    ],
    requirements: [
      '3+ ans en Data Science',
      'Maîtrise Python/R et frameworks ML',
      'Expérience en déploiement cloud',
      'Compétences en statistiques'
    ],
    requirementsEn: [
      '3+ years in Data Science',
      'Mastery of Python/R and ML frameworks',
      'Cloud deployment experience',
      'Statistics skills'
    ]
  },
  {
    id: '5',
    title: 'Chef de Projet IT',
    titleEn: 'IT Project Manager',
    location: 'Paris',
    type: 'CDI',
    typeEn: 'Full-time',
    experience: '5+ ans',
    experienceEn: '5+ years',
    description: 'Pilotez des projets de transformation digitale de bout en bout.',
    descriptionEn: 'Lead digital transformation projects end-to-end.',
    missions: [
      'Définir et planifier les projets',
      'Coordonner les équipes techniques',
      'Gérer les budgets et les délais',
      'Assurer la communication avec les stakeholders'
    ],
    missionsEn: [
      'Define and plan projects',
      'Coordinate technical teams',
      'Manage budgets and deadlines',
      'Ensure stakeholder communication'
    ],
    requirements: [
      '5+ ans en gestion de projet IT',
      'Certification PMP ou équivalent',
      'Leadership et communication',
      'Expérience en méthodologies agiles'
    ],
    requirementsEn: [
      '5+ years in IT project management',
      'PMP certification or equivalent',
      'Leadership and communication',
      'Agile methodology experience'
    ]
  }
]

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations()
  const [locale, setLocale] = useState('fr')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
  }, [])

  const job = jobs.find(j => j.id === id)

  const navItems = [
    { key: 'services', href: '/#services' },
    { key: 'about', href: '/#a-propos' },
    { key: 'careers', href: '/careers' },
    { key: 'contact', href: '/#contact' }
  ]

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

  if (!job) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{locale === 'fr' ? 'Offre non trouvée' : 'Job not found'}</h1>
          <Link href="/careers" className="text-ebmc-turquoise hover:underline">
            {t('jobs.backToList')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-4">
            <div className="flex justify-between items-center">
              <Link href="/">
                <Image src="/logo.PNG" alt="EBMC GROUP" width={140} height={40} className="h-8 w-auto" />
              </Link>

              <nav className="hidden lg:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`text-white/70 hover:text-ebmc-turquoise transition-colors ${item.key === 'careers' ? 'text-ebmc-turquoise' : ''}`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
                <LanguageSwitcher locale={locale} />
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-ebmc-turquoise transition"
                >
                  <LogIn className="w-4 h-4" />
                  {t('nav.login')}
                </Link>
              </nav>

              <div className="flex items-center gap-4 lg:hidden">
                <LanguageSwitcher locale={locale} />
                <button className="text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="lg:hidden mt-4 pt-4 border-t border-white/10"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="block py-3 text-white/70 hover:text-ebmc-turquoise transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </motion.nav>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <GridBackground>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        </GridBackground>
        <FloatingElements />
        <Meteors number={15} />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link href="/careers" className="inline-flex items-center gap-2 text-white/60 hover:text-ebmc-turquoise transition mb-8">
              <ArrowLeft className="w-4 h-4" />
              {t('jobs.backToList')}
            </Link>

            <div className="flex items-start gap-6 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-ebmc-turquoise to-cyan-400">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {locale === 'fr' ? job.title : job.titleEn}
                </h1>
                <div className="flex flex-wrap gap-4 text-lg">
                  <span className="flex items-center gap-2 text-white/60">
                    <MapPin className="w-5 h-5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2 text-white/60">
                    <Clock className="w-5 h-5" />
                    {locale === 'fr' ? job.type : job.typeEn}
                  </span>
                  <span className="flex items-center gap-2 text-white/60">
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
      <section className="relative py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-6">
                  <TextGradient>{locale === 'fr' ? 'Description du poste' : 'Job Description'}</TextGradient>
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  {locale === 'fr' ? job.description : job.descriptionEn}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">
                  <TextGradient>{locale === 'fr' ? 'Vos missions' : 'Your missions'}</TextGradient>
                </h2>
                <ul className="space-y-4">
                  {(locale === 'fr' ? job.missions : job.missionsEn).map((mission, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-ebmc-turquoise flex-shrink-0 mt-1" />
                      <span className="text-white/70">{mission}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-6">
                  <TextGradient>{locale === 'fr' ? 'Profil recherché' : 'Required profile'}</TextGradient>
                </h2>
                <ul className="space-y-4">
                  {(locale === 'fr' ? job.requirements : job.requirementsEn).map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-ebmc-turquoise flex-shrink-0 mt-1" />
                      <span className="text-white/70">{req}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="sticky top-32"
              >
                <GlowingCard className="p-8">
                  <h3 className="text-xl font-bold mb-6">
                    {locale === 'fr' ? 'Postuler à cette offre' : 'Apply to this offer'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder={locale === 'fr' ? 'Votre nom' : 'Your name'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise outline-none transition placeholder:text-white/40"
                    />
                    <input
                      type="email"
                      placeholder={locale === 'fr' ? 'Votre email' : 'Your email'}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise outline-none transition placeholder:text-white/40"
                    />
                    <input
                      type="tel"
                      placeholder={locale === 'fr' ? 'Votre téléphone' : 'Your phone'}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise outline-none transition placeholder:text-white/40"
                    />
                    <textarea
                      placeholder={locale === 'fr' ? 'Votre message / motivation' : 'Your message / motivation'}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise outline-none transition placeholder:text-white/40 resize-none"
                    />
                    <ShimmerButton type="submit" className="w-full" disabled={status === 'loading'}>
                      {status === 'loading'
                        ? (locale === 'fr' ? 'Envoi...' : 'Sending...')
                        : (locale === 'fr' ? 'Envoyer ma candidature' : 'Send my application')}
                      <Send className="w-4 h-4" />
                    </ShimmerButton>
                    {status === 'success' && (
                      <p className="text-green-400 text-center">
                        {locale === 'fr' ? 'Candidature envoyée !' : 'Application sent!'}
                      </p>
                    )}
                    {status === 'error' && (
                      <p className="text-red-400 text-center">
                        {locale === 'fr' ? 'Erreur lors de l\'envoi' : 'Error sending'}
                      </p>
                    )}
                  </form>
                </GlowingCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/">
              <Image src="/logo.PNG" alt="EBMC GROUP" width={120} height={35} className="h-8 w-auto" />
            </Link>
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} EBMC GROUP. {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
