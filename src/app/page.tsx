'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'
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
  Menu,
  X
} from 'lucide-react'
import {
  SpotlightCard,
  GlowingCard,
  Meteors,
  GridBackground,
  TextGradient,
  ShimmerButton,
  TypewriterEffect,
  FloatingElements
} from '@/components/ui/aceternity'

const services = [
  {
    icon: Server,
    title: 'SAP & ERP',
    description: 'Expertise complète sur les solutions SAP S/4HANA, implémentation et optimisation de vos processus métier.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Shield,
    title: 'Cybersécurité',
    description: 'Protection de vos systèmes et données avec des solutions de sécurité avancées et conformité RGPD.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Brain,
    title: 'Intelligence Artificielle',
    description: 'Intégration de solutions IA pour automatiser et optimiser vos opérations business.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Code,
    title: 'Développement',
    description: 'Création d&apos;applications sur mesure avec les technologies modernes (React, Node.js, Cloud).',
    gradient: 'from-orange-500 to-red-500'
  }
]

const stats = [
  { value: 15, suffix: '+', label: 'Années d\'expérience' },
  { value: 200, suffix: '+', label: 'Projets réalisés' },
  { value: 50, suffix: '+', label: 'Experts certifiés' },
  { value: 98, suffix: '%', label: 'Clients satisfaits' }
]

const features = [
  'Expertise reconnue en SAP et technologies cloud',
  'Équipe d\'experts certifiés et passionnés',
  'Accompagnement personnalisé de A à Z',
  'Solutions innovantes et durables'
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
        <div>
          <input
            type="text"
            placeholder="Votre nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise outline-none transition placeholder:text-white/40"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Votre email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise outline-none transition placeholder:text-white/40"
          />
        </div>
      </div>
      <div>
        <input
          type="text"
          placeholder="Sujet"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise outline-none transition placeholder:text-white/40"
        />
      </div>
      <div>
        <textarea
          placeholder="Votre message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={5}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-ebmc-turquoise focus:ring-1 focus:ring-ebmc-turquoise outline-none transition placeholder:text-white/40 resize-none"
        />
      </div>
      <ShimmerButton type="submit" className="w-full md:w-auto" disabled={status === 'loading'}>
        {status === 'loading' ? 'Envoi...' : 'Envoyer le message'}
        <Send className="w-4 h-4" />
      </ShimmerButton>
      {status === 'success' && (
        <p className="text-green-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Message envoyé avec succès !
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-400">Erreur lors de l&apos;envoi. Veuillez réessayer.</p>
      )}
    </form>
  )
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <Image src="/logo.png" alt="EBMC GROUP" width={140} height={40} className="h-8 w-auto" />
              </motion.div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                {['Services', 'À propos', 'Contact'].map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-').replace('à', 'a')}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-white/70 hover:text-ebmc-turquoise transition-colors relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ebmc-turquoise transition-all group-hover:w-full" />
                  </motion.a>
                ))}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <ShimmerButton>
                    <Sparkles className="w-4 h-4" />
                    Démarrer un projet
                  </ShimmerButton>
                </motion.div>
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-white p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="md:hidden mt-4 pt-4 border-t border-white/10"
              >
                {['Services', 'À propos', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-').replace('à', 'a')}`}
                    className="block py-3 text-white/70 hover:text-ebmc-turquoise transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </motion.nav>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GridBackground>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        </GridBackground>
        <FloatingElements />
        <Meteors number={30} />

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
            <span className="text-sm text-white/80">Transformation Digitale & Innovation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Votre partenaire en
            <br />
            <TypewriterEffect words={['SAP & ERP', 'Cybersécurité', 'Intelligence Artificielle', 'Cloud & DevOps']} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12"
          >
            EBMC GROUP accompagne les entreprises dans leur évolution numérique
            avec des solutions innovantes et sur mesure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <ShimmerButton>
              Découvrir nos services
              <ArrowRight className="w-4 h-4" />
            </ShimmerButton>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:border-ebmc-turquoise/50 hover:bg-white/5 transition-all"
            >
              Prendre rendez-vous
              <Zap className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
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
            <span className="text-sm">Scroll</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
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
                  <div className="text-white/60 mt-2">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-32 px-4">
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
              <span className="text-sm text-white/80">Nos expertises</span>
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Des solutions <TextGradient>sur mesure</TextGradient>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Nous combinons expertise technique et vision stratégique pour transformer vos défis en opportunités.
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
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-white/60 leading-relaxed" dangerouslySetInnerHTML={{ __html: service.description }} />
                  <motion.a
                    href="#contact"
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center gap-2 mt-6 text-ebmc-turquoise hover:text-ebmc-turquoise-light transition"
                  >
                    En savoir plus <ArrowRight className="w-4 h-4" />
                  </motion.a>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="a-propos" className="relative py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ebmc-turquoise/5 to-transparent" />
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
                <span className="text-sm text-white/80">Pourquoi nous choisir</span>
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                L&apos;excellence au service de votre <TextGradient>transformation</TextGradient>
              </h2>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                Depuis plus de 15 ans, nous accompagnons les entreprises de toutes tailles
                dans leur transformation digitale. Notre équipe d&apos;experts certifiés
                vous garantit des solutions sur mesure et un accompagnement personnalisé.
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
              className="relative"
            >
              <GlowingCard>
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-ebmc-turquoise to-cyan-400">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">100%</div>
                      <div className="text-white/60">Sécurité garantie</div>
                    </div>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">24/7</div>
                      <div className="text-white/60">Support disponible</div>
                    </div>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">Global</div>
                      <div className="text-white/60">Présence internationale</div>
                    </div>
                  </div>
                </div>
              </GlowingCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-32 px-4">
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
              <span className="text-sm text-white/80">Contact</span>
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Démarrons votre <TextGradient>projet</TextGradient>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Discutons de vos besoins et trouvons ensemble la solution idéale pour votre entreprise.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {[
                { icon: Mail, title: 'Email', value: 'contact@ebmcgroup.eu', href: 'mailto:contact@ebmcgroup.eu' },
                { icon: Phone, title: 'Téléphone', value: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
                { icon: MapPin, title: 'Adresse', value: 'Paris, France', href: '#' }
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
                    <div className="text-white/60 text-sm">{item.title}</div>
                    <div className="text-xl font-semibold">{item.value}</div>
                  </div>
                </motion.a>
              ))}

              {/* Social */}
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

            {/* Contact Form */}
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
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <Image src="/logo.png" alt="EBMC GROUP" width={120} height={35} className="h-8 w-auto" />
            </motion.div>

            <nav className="flex items-center gap-8">
              {['Services', 'À propos', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-').replace('à', 'a')}`}
                  className="text-white/60 hover:text-ebmc-turquoise transition text-sm"
                >
                  {item}
                </a>
              ))}
            </nav>

            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} EBMC GROUP. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
