'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  Shield,
  Brain,
  Server,
  Code,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  CheckCircle,
  Sparkles,
  Zap,
  Globe,
  ChevronDown,
  Send,
  Users
} from 'lucide-react'
import {
  TextGradient,
  ShimmerButton,
  TypewriterEffect
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { useTheme } from '@/components/ThemeProvider'

const services = [
  { icon: Server, key: 'sap', gradient: 'from-ebmc-turquoise to-cyan-500' },
  { icon: Shield, key: 'security', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Brain, key: 'ai', gradient: 'from-violet-500 to-purple-500' },
  { icon: Code, key: 'dev', gradient: 'from-orange-500 to-amber-500' }
]

const stats = [
  { value: 15, suffix: '+', key: 'years' },
  { value: 200, suffix: '+', key: 'projects' },
  { value: 50, suffix: '+', key: 'experts' },
  { value: 98, suffix: '%', key: 'satisfaction' }
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      onViewportEnter={() => {
        let start = 0
        const end = value
        const duration = 2000
        const increment = end / (duration / 16)
        const timer = setInterval(() => {
          start += increment
          if (start >= end) {
            setCount(end)
            clearInterval(timer)
          } else {
            setCount(Math.floor(start))
          }
        }, 16)
      }}
      viewport={{ once: true }}
      className="text-5xl md:text-6xl font-bold"
    >
      <TextGradient animate={false}>{count}{suffix}</TextGradient>
    </motion.div>
  )
}

function ContactForm() {
  const t = useTranslations('contact.form')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputClass = "w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-ebmc-turquoise focus:ring-2 focus:ring-ebmc-turquoise/20 outline-none transition-all"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <input
          type="text"
          placeholder={t('name')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className={inputClass}
        />
        <input
          type="email"
          placeholder={t('email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className={inputClass}
        />
      </div>
      <input
        type="text"
        placeholder={t('subject')}
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        required
        className={inputClass}
      />
      <textarea
        placeholder={t('message')}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
        rows={5}
        className={`${inputClass} resize-none`}
      />
      <ShimmerButton type="submit" className="w-full md:w-auto" disabled={status === 'loading'}>
        {status === 'loading' ? t('sending') : t('submit')}
        <Send className="w-4 h-4" />
      </ShimmerButton>
      {status === 'success' && (
        <p className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> {t('success')}
        </p>
      )}
      {status === 'error' && <p className="text-red-500 dark:text-red-400">{t('error')}</p>}
    </form>
  )
}

export default function Home() {
  const t = useTranslations()
  const { resolvedTheme } = useTheme()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  const heroWords = t.raw('hero.words') as string[]
  const features = t.raw('about.features') as string[]

  return (
    <TechBackground variant="semi-light">
      <main className="min-h-screen text-slate-800 dark:text-slate-100 overflow-hidden">
        {/* Navigation */}
        <Navigation currentPage="home" variant="auto" />

        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 max-w-7xl mx-auto px-4 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ebmc-turquoise/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-ebmc-turquoise" />
              <span className="text-sm font-medium text-ebmc-turquoise">{t('hero.badge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-slate-900 dark:text-white"
            >
              {t('hero.title')}
              <br />
              <TypewriterEffect words={heroWords} />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="#services">
                <ShimmerButton>
                  {t('hero.cta')}
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-ebmc-turquoise hover:text-ebmc-turquoise transition-all font-medium"
              >
                {t('hero.ctaSecondary')}
                <Zap className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-slate-400"
            >
              <span className="text-sm">{t('hero.scroll')}</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-12"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    <div className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">{t(`stats.${stat.key}`)}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </TechSection>

        {/* Services Section */}
        <TechSection id="services" className="py-24 md:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ebmc-turquoise/10 mb-6">
                <Globe className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm font-medium text-ebmc-turquoise">{t('services.badge')}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('services.title')} <TextGradient animate={false}>{t('services.titleHighlight')}</TextGradient>
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                {t('services.description')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="glass-card p-8 group cursor-pointer"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.gradient} mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">{t(`services.${service.key}.title`)}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{t(`services.${service.key}.description`)}</p>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 text-ebmc-turquoise hover:text-ebmc-turquoise-dark font-medium transition group-hover:gap-3"
                  >
                    {t('services.learnMore')} <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </TechSection>

        {/* About Section */}
        <TechSection id="a-propos" className="py-24 md:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ebmc-turquoise/10 mb-6">
                  <Zap className="w-4 h-4 text-ebmc-turquoise" />
                  <span className="text-sm font-medium text-ebmc-turquoise">{t('about.badge')}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                  {t('about.title')} <TextGradient animate={false}>{t('about.titleHighlight')}</TextGradient>
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  {t('about.description')}
                </p>
                <ul className="space-y-4">
                  {features.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <div className="p-1 rounded-full bg-ebmc-turquoise/20 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-ebmc-turquoise" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-300">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="glass-card p-8 space-y-6">
                  {[
                    { icon: Shield, value: '100%', label: t('about.security'), gradient: 'from-ebmc-turquoise to-cyan-500' },
                    { icon: Brain, value: '24/7', label: t('about.support'), gradient: 'from-violet-500 to-purple-500' },
                    { icon: Globe, value: 'Global', label: t('about.global'), gradient: 'from-orange-500 to-amber-500' },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${item.gradient} shadow-lg`}>
                          <item.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-slate-800 dark:text-white">{item.value}</div>
                          <div className="text-slate-500 dark:text-slate-400">{item.label}</div>
                        </div>
                      </div>
                      {index < 2 && <div className="h-px bg-slate-200/60 dark:bg-slate-700/60 mt-6" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </TechSection>

        {/* Careers CTA Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card text-center p-10 md:p-14"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-ebmc-turquoise to-cyan-500 flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                {t('careers.title')} <TextGradient animate={false}>{t('careers.titleHighlight')}</TextGradient>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                {t('careers.description')}
              </p>
              <Link href="/careers">
                <ShimmerButton>
                  {t('careers.viewOffers')}
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </Link>
            </motion.div>
          </div>
        </TechSection>

        {/* Contact Section */}
        <TechSection id="contact" className="py-24 md:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ebmc-turquoise/10 mb-6">
                <Mail className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm font-medium text-ebmc-turquoise">{t('contact.badge')}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('contact.title')} <TextGradient animate={false}>{t('contact.titleHighlight')}</TextGradient>
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                {t('contact.description')}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-5"
              >
                {[
                  { icon: Mail, key: 'email', value: 'contact@ebmcgroup.eu', href: 'mailto:contact@ebmcgroup.eu' },
                  { icon: Phone, key: 'phone', value: '+352 26 50 61', href: 'tel:+352265061' },
                  { icon: MapPin, key: 'address', value: '20 Op Zaemer, 4959 Käerjeng, Luxembourg', href: 'https://maps.google.com/?q=20+Op+Zaemer+4959+Käerjeng+Luxembourg' }
                ].map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 8 }}
                    className="flex items-center gap-5 p-5 glass-card group cursor-pointer"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-ebmc-turquoise to-cyan-500 group-hover:scale-110 transition shadow-lg">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm">{t(`contact.${item.key}`)}</div>
                      <div className="text-lg font-semibold text-slate-800 dark:text-white">{item.value}</div>
                    </div>
                  </motion.a>
                ))}

                <div className="flex gap-3 pt-4">
                  <motion.a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -3 }}
                    className="p-4 glass-card rounded-xl hover:bg-ebmc-turquoise/10 transition"
                  >
                    <Linkedin className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </motion.a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="glass-card p-8">
                  <ContactForm />
                </div>
              </motion.div>
            </div>
          </div>
        </TechSection>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <Link href="/">
                <Image
                  src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo.svg'}
                  alt="EBMC GROUP"
                  width={100}
                  height={30}
                  className="h-7 w-auto"
                />
              </Link>
              <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/careers" className="hover:text-ebmc-turquoise transition">Carrières</Link>
                <a href="#contact" className="hover:text-ebmc-turquoise transition">Contact</a>
                <Link href="/login" className="hover:text-ebmc-turquoise transition">Connexion</Link>
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                © {new Date().getFullYear()} EBMC GROUP. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </TechBackground>
  )
}
