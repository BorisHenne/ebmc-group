'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LogIn, Menu, X, Sparkles } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ShimmerButton } from '@/components/ui/aceternity'

interface NavigationProps {
  currentPage?: 'home' | 'consultants' | 'careers' | 'login'
}

export function Navigation({ currentPage = 'home' }: NavigationProps) {
  const t = useTranslations()
  const [locale, setLocale] = useState('fr')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) setLocale(match[1])
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
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.svg" alt="EBMC GROUP" width={140} height={40} className="h-8 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative group ${
                    isActive(item.key) ? 'text-ebmc-turquoise' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {t(`nav.${item.key}`)}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-ebmc-turquoise transition-all ${
                    isActive(item.key) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher locale={locale} />
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white transition"
              >
                <LogIn className="w-4 h-4" />
                {t('nav.login')}
              </Link>
              <Link href="/#contact">
                <ShimmerButton>
                  <Sparkles className="w-4 h-4" />
                  {t('nav.startProject')}
                </ShimmerButton>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-4 lg:hidden">
              <LanguageSwitcher locale={locale} />
              <button
                className="text-white p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
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
                  className={`block py-3 text-sm ${
                    isActive(item.key) ? 'text-ebmc-turquoise' : 'text-white/70'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
              <Link
                href="/login"
                className="flex items-center gap-2 py-3 text-sm text-white/70"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                {t('nav.login')}
              </Link>
            </motion.nav>
          )}
        </div>
      </div>
    </motion.header>
  )
}
