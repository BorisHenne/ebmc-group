'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Building,
  ArrowRight,
  CheckCircle,
  Server,
  Cloud,
  Shield,
  Target,
  Award
} from 'lucide-react'
import {
  TextGradient,
  ShimmerButton
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

const poleIcons = [
  { icon: Server, gradient: 'from-ebmc-turquoise to-cyan-500' },
  { icon: Cloud, gradient: 'from-violet-500 to-purple-500' },
  { icon: Shield, gradient: 'from-emerald-500 to-teal-500' }
]

export default function AboutPage() {
  const t = useTranslations()

  const poles = t.raw('about.poles') as string[]
  const commitments = t.raw('about.commitments.items') as string[]

  return (
    <TechBackground variant="semi-light">
      <main className="min-h-screen text-slate-800 dark:text-slate-100 overflow-hidden">
        <Navigation currentPage="home" variant="auto" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ebmc-turquoise/10 mb-8">
                <Building className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm font-medium text-ebmc-turquoise">{t('about.badge')}</span>
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('about.title')}
                <br />
                <TextGradient animate={false}>{t('about.titleHighlight')}</TextGradient>
              </h1>

              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                {t('about.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Poles Section */}
        <TechSection className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {poles.map((pole, index) => {
                const iconData = poleIcons[index]
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 text-center group"
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${iconData.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <iconData.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{pole}</h3>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </TechSection>

        {/* Vision Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 md:p-14"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-ebmc-turquoise to-cyan-500 shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {t('about.vision.title')}
                </h2>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('about.vision.description')}
              </p>
            </motion.div>
          </div>
        </TechSection>

        {/* Commitments Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 md:p-14"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {t('about.commitments.title')}
                </h2>
              </div>
              <ul className="space-y-4">
                {commitments.map((commitment, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-1 rounded-full bg-ebmc-turquoise/20 mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-ebmc-turquoise" />
                    </div>
                    <span className="text-lg text-slate-600 dark:text-slate-300">{commitment}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </TechSection>

        {/* Tagline Section */}
        <TechSection className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 text-center"
            >
              <p className="text-xl md:text-2xl font-semibold text-ebmc-turquoise">
                {t('about.tagline')}
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
                <Building className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                {t('contact.title')} <TextGradient animate={false}>{t('contact.titleHighlight')}</TextGradient>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                {t('contact.description')}
              </p>
              <Link href="/contact">
                <ShimmerButton>
                  {t('hero.ctaSecondary')}
                  <ArrowRight className="w-4 h-4" />
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
