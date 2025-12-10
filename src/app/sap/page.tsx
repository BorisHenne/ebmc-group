'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Server,
  ArrowRight,
  CheckCircle,
  Layers,
  Database,
  Settings,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import {
  TextGradient,
  ShimmerButton
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

const domainIcons = [
  { icon: TrendingUp, gradient: 'from-ebmc-turquoise to-cyan-500' },
  { icon: Layers, gradient: 'from-violet-500 to-purple-500' },
  { icon: Database, gradient: 'from-emerald-500 to-teal-500' },
  { icon: Settings, gradient: 'from-orange-500 to-amber-500' },
  { icon: Server, gradient: 'from-pink-500 to-rose-500' },
  { icon: Shield, gradient: 'from-blue-500 to-indigo-500' },
  { icon: Zap, gradient: 'from-yellow-500 to-orange-500' }
]

export default function SAPPage() {
  const t = useTranslations()

  const domains = t.raw('sap.domains.items') as string[]
  const benefits = t.raw('sap.benefits.items') as string[]

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
                <Server className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm font-medium text-ebmc-turquoise">{t('sap.badge')}</span>
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('sap.title')}
                <br />
                <TextGradient animate={false}>{t('sap.titleHighlight')}</TextGradient> {t('sap.subtitle')}
              </h1>

              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                {t('sap.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Domains Section */}
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
                {t('sap.domains.title')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domains.map((domain, index) => {
                const iconData = domainIcons[index % domainIcons.length]
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 group"
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${iconData.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <iconData.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{domain}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </TechSection>

        {/* Benefits Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 md:p-14"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                  {t('sap.benefits.title')}
                </h2>
              </div>

              <ul className="space-y-4 mb-10">
                {benefits.map((benefit, index) => (
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
                    <span className="text-lg text-slate-600 dark:text-slate-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="text-center text-xl font-semibold text-ebmc-turquoise"
              >
                {t('sap.tagline')}
              </motion.p>
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
                <Server className="w-8 h-8 text-white" />
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
