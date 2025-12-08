'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'
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
  SpotlightCard,
  GlowingCard,
  TextGradient,
  ShimmerButton,
  TypewriterEffect
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

const services = [
  { icon: Server, key: 'sap', gradient: 'from-cyan-500 to-blue-500' },
  { icon: Shield, key: 'security', gradient: 'from-green-500 to-emerald-500' },
  { icon: Brain, key: 'ai', gradient: 'from-purple-500 to-pink-500' },
  { icon: Code, key: 'dev', gradient: 'from-orange-500 to-red-500' }
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
      className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ebmc-turquoise to-cyan-400"
    >
      {count}{suffix}
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <input
          type="text"
          placeholder={t('name')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise outline-none transition placeholder:text-white/40 text-white"
        />
        <input
          type="email"
          placeholder={t('email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise outline-none transition placeholder:text-white/40 text-white"
        />
      </div>
      <input
        type="text"
        placeholder={t('subject')}
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        required
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise outline-none transition placeholder:text-white/40 text-white"
      />
      <textarea
        placeholder={t('message')}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
        rows={5}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise outline-none transition placeholder:text-white/40 resize-none text-white"
      />
      <ShimmerButton type="submit" className="w-full md:w-auto" disabled={status === 'loading'}>
        {status === 'loading' ? t('sending') : t('submit')}
        <Send className="w-4 h-4" />
      </ShimmerButton>
      {status === 'success' && (
        <p className="text-green-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> {t('success')}
        </p>
      )}
      {status === 'error' && <p className="text-red-400">{t('error')}</p>}
    </form>
  )
}

export default function Home() {
  const t = useTranslations()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  const heroWords = t.raw('hero.words') as string[]
  const features = t.raw('about.features') as string[]

  return (
    <TechBackground>
      <main className="min-h-screen text-white overflow-hidden">
        <Navigation currentPage="home" />

        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 max-w-7xl mx-auto px-4 text-center pt-32"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <Sparkles className="w-4 h-4 text-ebmc-turquoise" />
              <span className="text-sm text-white/80">{t('hero.badge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              {t('hero.title')}
              <br />
              <TypewriterEffect words={heroWords} />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12"
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
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:border-ebmc-turquoise/50 hover:bg-white/5 transition-all"
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
              className="flex flex-col items-center gap-2 text-white/40"
            >
              <span className="text-sm">{t('hero.scroll')}</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card p-12">
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
                    <div className="text-white/60 mt-2">{t(`stats.${stat.key}`)}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </TechSection>

        {/* Services Section */}
        <TechSection id="services" className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Globe className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm text-white/80">{t('services.badge')}</span>
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t('services.title')} <TextGradient>{t('services.titleHighlight')}</TextGradient>
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                {t('services.description')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <SpotlightCard className="h-full">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.gradient} mb-6`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{t(`services.${service.key}.title`)}</h3>
                    <p className="text-white/60 leading-relaxed">{t(`services.${service.key}.description`)}</p>
                    <motion.a
                      href="#contact"
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center gap-2 mt-6 text-ebmc-turquoise hover:text-ebmc-turquoise-light transition"
                    >
                      {t('services.learnMore')} <ArrowRight className="w-4 h-4" />
                    </motion.a>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </TechSection>

        {/* About Section */}
        <TechSection id="a-propos" className="py-32 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ebmc-turquoise/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                  <Zap className="w-4 h-4 text-ebmc-turquoise" />
                  <span className="text-sm text-white/80">{t('about.badge')}</span>
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {t('about.title')} <TextGradient>{t('about.titleHighlight')}</TextGradient>
                </h2>
                <p className="text-lg text-white/60 mb-8 leading-relaxed">
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
                      <div className="p-1 rounded-full bg-ebmc-turquoise/20 mt-1">
                        <CheckCircle className="w-4 h-4 text-ebmc-turquoise" />
                      </div>
                      <span className="text-white/80">{item}</span>
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
                <GlowingCard>
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-ebmc-turquoise to-cyan-400">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">100%</div>
                        <div className="text-white/60">{t('about.security')}</div>
                      </div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">24/7</div>
                        <div className="text-white/60">{t('about.support')}</div>
                      </div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500">
                        <Globe className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">Global</div>
                        <div className="text-white/60">{t('about.global')}</div>
                      </div>
                    </div>
                  </div>
                </GlowingCard>
              </motion.div>
            </div>
          </div>
        </TechSection>

        {/* Careers CTA Section */}
        <TechSection className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <GlowingCard className="text-center p-12">
              <Users className="w-16 h-16 text-ebmc-turquoise mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('careers.title')} <TextGradient>{t('careers.titleHighlight')}</TextGradient>
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                {t('careers.description')}
              </p>
              <Link href="/careers">
                <ShimmerButton>
                  {t('careers.viewOffers')}
                  <ArrowRight className="w-4 h-4" />
                </ShimmerButton>
              </Link>
            </GlowingCard>
          </div>
        </TechSection>

        {/* Contact Section */}
        <TechSection id="contact" className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Mail className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm text-white/80">{t('contact.badge')}</span>
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t('contact.title')} <TextGradient>{t('contact.titleHighlight')}</TextGradient>
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                {t('contact.description')}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {[
                  { icon: Mail, key: 'email', value: 'contact@ebmc-group.com', href: 'mailto:contact@ebmc-group.com' },
                  { icon: Phone, key: 'phone', value: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
                  { icon: MapPin, key: 'address', value: 'Paris, France', href: '#' }
                ].map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-6 p-6 glass-card group cursor-pointer"
                  >
                    <div className="p-4 rounded-xl bg-gradient-to-r from-ebmc-turquoise to-cyan-400 group-hover:scale-110 transition">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white/60 text-sm">{t(`contact.${item.key}`)}</div>
                      <div className="text-xl font-semibold">{item.value}</div>
                    </div>
                  </motion.a>
                ))}

                <div className="flex gap-4 pt-4">
                  <motion.a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="p-4 glass rounded-xl hover:bg-ebmc-turquoise/20 transition"
                  >
                    <Linkedin className="w-6 h-6" />
                  </motion.a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <GlowingCard className="p-8">
                  <ContactForm />
                </GlowingCard>
              </motion.div>
            </div>
          </div>
        </TechSection>

        <Footer />
      </main>
    </TechBackground>
  )
}
