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
  Star
} from 'lucide-react'
import {
  SpotlightCard,
  TextGradient,
  ShimmerButton
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

// Mock data - Ces données peuvent être remplacées par l'API BoondManager
const consultants = [
  {
    id: 1,
    name: 'Alexandre Martin',
    title: 'Consultant SAP Senior',
    titleEn: 'Senior SAP Consultant',
    location: 'Paris',
    experience: '12 ans',
    experienceEn: '12 years',
    category: 'sap',
    available: true,
    skills: ['SAP S/4HANA', 'SAP FI/CO', 'SAP MM', 'ABAP'],
    certifications: ['SAP S/4HANA Certified', 'PMP'],
    image: null
  },
  {
    id: 2,
    name: 'Sophie Dubois',
    title: 'Experte Cybersécurité',
    titleEn: 'Cybersecurity Expert',
    location: 'Lyon',
    experience: '8 ans',
    experienceEn: '8 years',
    category: 'security',
    available: true,
    skills: ['Pentest', 'SIEM', 'SOC', 'ISO 27001'],
    certifications: ['CISSP', 'CEH', 'OSCP'],
    image: null
  },
  {
    id: 3,
    name: 'Thomas Bernard',
    title: 'Architecte Cloud & DevOps',
    titleEn: 'Cloud & DevOps Architect',
    location: 'Paris / Remote',
    experience: '10 ans',
    experienceEn: '10 years',
    category: 'dev',
    available: false,
    skills: ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'CI/CD'],
    certifications: ['AWS Solutions Architect', 'Azure Expert'],
    image: null
  },
  {
    id: 4,
    name: 'Marie Leroy',
    title: 'Data Scientist Senior',
    titleEn: 'Senior Data Scientist',
    location: 'Paris',
    experience: '7 ans',
    experienceEn: '7 years',
    category: 'data',
    available: true,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Spark'],
    certifications: ['Google ML Engineer', 'AWS ML Specialty'],
    image: null
  },
  {
    id: 5,
    name: 'Pierre Moreau',
    title: 'Consultant SAP FI/CO',
    titleEn: 'SAP FI/CO Consultant',
    location: 'Nantes',
    experience: '6 ans',
    experienceEn: '6 years',
    category: 'sap',
    available: true,
    skills: ['SAP FI', 'SAP CO', 'S/4HANA Finance'],
    certifications: ['SAP FI Certified'],
    image: null
  },
  {
    id: 6,
    name: 'Camille Petit',
    title: 'Développeuse Full Stack',
    titleEn: 'Full Stack Developer',
    location: 'Bordeaux / Remote',
    experience: '5 ans',
    experienceEn: '5 years',
    category: 'dev',
    available: true,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    certifications: ['AWS Developer Associate'],
    image: null
  }
]

export default function ConsultantsPage() {
  const t = useTranslations()
  const [locale, setLocale] = useState('fr')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
  }, [])

  const filteredConsultants = filter === 'all'
    ? consultants
    : consultants.filter(c => c.category === filter)

  return (
    <TechBackground>
      <main className="min-h-screen text-white overflow-hidden">
        <Navigation currentPage="consultants" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <Star className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm text-white/80">{t('consultants.badge')}</span>
              </span>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                {t('consultants.title')} <TextGradient>{t('consultants.titleHighlight')}</TextGradient>
              </h1>

              <p className="text-xl text-white/60 max-w-2xl mx-auto">
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
                  className={`px-6 py-2 rounded-full transition-all ${
                    filter === cat
                      ? 'bg-ebmc-turquoise text-white'
                      : 'glass text-white/70 hover:text-white'
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredConsultants.map((consultant, index) => (
                <motion.div
                  key={consultant.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <SpotlightCard className="h-full">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ebmc-turquoise to-cyan-400 flex items-center justify-center flex-shrink-0">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-1 truncate">{consultant.name}</h3>
                        <p className="text-ebmc-turquoise text-sm mb-2">
                          {locale === 'fr' ? consultant.title : consultant.titleEn}
                        </p>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <MapPin className="w-4 h-4" />
                          {consultant.location}
                        </div>
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4 ${
                      consultant.available
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${consultant.available ? 'bg-green-400' : 'bg-orange-400'}`} />
                      {consultant.available ? t('consultants.available') : t('consultants.unavailable')}
                    </div>

                    {/* Experience */}
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                      <Briefcase className="w-4 h-4" />
                      <span>{t('consultants.experience')}: </span>
                      <span className="text-white">{locale === 'fr' ? consultant.experience : consultant.experienceEn}</span>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="text-sm text-white/60 mb-2">{t('consultants.skills')}</div>
                      <div className="flex flex-wrap gap-2">
                        {consultant.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/80"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="mb-6">
                      <div className="text-sm text-white/60 mb-2">{t('consultants.certifications')}</div>
                      <div className="space-y-1">
                        {consultant.certifications.map((cert, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-ebmc-turquoise" />
                            <span className="text-white/80">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Button */}
                    {consultant.available && (
                      <a href={`mailto:contact@ebmc-group.com?subject=Contact consultant: ${consultant.name}`}>
                        <ShimmerButton className="w-full">
                          <Mail className="w-4 h-4" />
                          {t('consultants.contact')}
                        </ShimmerButton>
                      </a>
                    )}
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>

            {filteredConsultants.length === 0 && (
              <div className="text-center py-12 text-white/60">
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
              className="glass rounded-2xl p-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                {locale === 'fr' ? 'Besoin d\'un expert ?' : 'Need an expert?'}
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
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

        <Footer />
      </main>
    </TechBackground>
  )
}
