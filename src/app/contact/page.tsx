'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Mail,
  Phone,
  Linkedin,
  CheckCircle,
  Send,
  Building2,
  Globe
} from 'lucide-react'
import {
  TextGradient,
  ShimmerButton
} from '@/components/ui/aceternity'
import { TechBackground, TechSection } from '@/components/ui/TechBackground'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

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
        rows={6}
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

export default function ContactPage() {
  const t = useTranslations()

  return (
    <TechBackground variant="semi-light">
      <main className="min-h-screen text-slate-800 dark:text-slate-100 overflow-hidden">
        <Navigation currentPage="home" variant="auto" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ebmc-turquoise/10 mb-8">
                <Mail className="w-4 h-4 text-ebmc-turquoise" />
                <span className="text-sm font-medium text-ebmc-turquoise">{t('contact.badge')}</span>
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('contact.title')} <TextGradient animate={false}>{t('contact.titleHighlight')}</TextGradient>
              </h1>

              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                {t('contact.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Content */}
        <TechSection className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Headquarters */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-ebmc-turquoise to-cyan-500 shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-800 dark:text-white">{t('contact.headquarters.title')}</div>
                      <div className="text-slate-500 dark:text-slate-400">{t('contact.headquarters.location')}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Innovation Office */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-800 dark:text-white">{t('contact.innovation.title')}</div>
                      <div className="text-slate-500 dark:text-slate-400">{t('contact.innovation.location')}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.a
                  href="mailto:contact@ebmcgroup.eu"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 8 }}
                  className="flex items-center gap-5 p-6 glass-card group cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-ebmc-turquoise to-cyan-500 group-hover:scale-110 transition shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm">{t('contact.email')}</div>
                    <div className="text-xl font-semibold text-slate-800 dark:text-white">contact@ebmcgroup.eu</div>
                  </div>
                </motion.a>

                {/* Phone */}
                <motion.a
                  href="tel:+352265061"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 8 }}
                  className="flex items-center gap-5 p-6 glass-card group cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:scale-110 transition shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm">{t('contact.phone')}</div>
                    <div className="text-xl font-semibold text-slate-800 dark:text-white">+352 26 50 61</div>
                  </div>
                </motion.a>

                {/* Social */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex gap-3 pt-4"
                >
                  <motion.a
                    href="https://linkedin.com/company/ebmc-group"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -3 }}
                    className="p-4 glass-card rounded-xl hover:bg-ebmc-turquoise/10 transition"
                  >
                    <Linkedin className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </motion.a>
                </motion.div>
              </motion.div>

              {/* Contact Form */}
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

        <Footer variant="auto" />
      </main>
    </TechBackground>
  )
}
