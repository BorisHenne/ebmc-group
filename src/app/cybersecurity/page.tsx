'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Shield,
  ArrowRight,
  CheckCircle,
  Search,
  FileCheck,
  AlertTriangle,
  Lock,
  Users
} from 'lucide-react'
import {
  TextGradient,
  ShimmerButton
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

const sections = [
  { key: 'audit', icon: Search, gradient: 'from-emerald-500 to-teal-500' },
  { key: 'compliance', icon: FileCheck, gradient: 'from-blue-500 to-indigo-500' },
  { key: 'detection', icon: AlertTriangle, gradient: 'from-orange-500 to-red-500' },
  { key: 'architecture', icon: Lock, gradient: 'from-violet-500 to-purple-500' },
  { key: 'awareness', icon: Users, gradient: 'from-pink-500 to-rose-500' }
]

export default function CybersecurityPage() {
  const t = useTranslations()

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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 mb-8">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">{t('cybersecurity.badge')}</span>
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('cybersecurity.title')}
                <br />
                <TextGradient animate={false}>{t('cybersecurity.titleHighlight')}</TextGradient>
              </h1>

              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                {t('cybersecurity.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sections Grid */}
        <TechSection className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => {
                const items = t.raw(`cybersecurity.${section.key}.items`) as string[]
                return (
                  <motion.div
                    key={section.key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${section.gradient} shadow-lg`}>
                        <section.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {t(`cybersecurity.${section.key}.title`)}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {items.map((item, itemIndex) => (
                        <motion.li
                          key={itemIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                          viewport={{ once: true }}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )
              })}
            </div>
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
              <p className="text-xl md:text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {t('cybersecurity.tagline')}
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
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
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
