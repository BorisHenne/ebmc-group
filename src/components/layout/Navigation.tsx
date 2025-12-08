'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LogIn, Menu, X, ArrowRight } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface NavigationProps {
  currentPage?: 'home' | 'consultants' | 'careers' | 'login'
}

export function Navigation({ currentPage = 'home' }: NavigationProps) {
  const t = useTranslations()
  const [locale, setLocale] = useState('fr')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { key: 'services', href: '/#services', isAnchor: true },
    { key: 'consultants', href: '/consultants', isAnchor: false },
    { key: 'careers', href: '/careers', isAnchor: false },
    { key: 'contact', href: '/#contact', isAnchor: true }
  ]

  const isActive = (key: string) => {
    if (key === 'consultants' && currentPage === 'consultants') return true
    if (key === 'careers' && currentPage === 'careers') return true
    return false
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0d1117]/90 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20'
            : 'bg-[#0d1117]/60 backdrop-blur-md border border-white/5'
        }`}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-ebmc-turquoise/20 to-cyan-500/10 border border-ebmc-turquoise/30 group-hover:border-ebmc-turquoise/50 transition-all">
              <span className="text-ebmc-turquoise font-bold text-lg">E</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-semibold text-lg tracking-tight">EBMC</span>
              <span className="text-ebmc-turquoise font-semibold text-lg tracking-tight ml-1">GROUP</span>
            </div>
          </Link>

          {/* Desktop Nav - Center */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center bg-white/5 rounded-full p-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive(item.key)
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t(`nav.${item.key}`)}
                  {isActive(item.key) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-ebmc-turquoise/20 to-cyan-500/10 rounded-full -z-10"
                    />
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher locale={locale} />

            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xl:inline">{t('nav.login')}</span>
            </Link>

            <Link
              href="/#contact"
              className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ebmc-turquoise to-cyan-400 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-ebmc-turquoise/25 transition-all duration-300"
            >
              {t('nav.startProject')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher locale={locale} />
            <button
              className="p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mt-2 bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl"
          >
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.key)
                      ? 'text-ebmc-turquoise bg-ebmc-turquoise/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                {t('nav.login')}
              </Link>
              <Link
                href="/#contact"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-ebmc-turquoise to-cyan-400 text-white text-sm font-medium rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.startProject')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
