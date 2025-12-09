'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Linkedin } from 'lucide-react'

interface FooterProps {
  variant?: 'dark' | 'light' | 'auto'
}

export function Footer({ variant = 'auto' }: FooterProps) {
  const t = useTranslations()
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()

    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  // For auto variant, use current theme; otherwise use specified variant
  const effectiveVariant = variant === 'auto' ? (isDarkMode ? 'dark' : 'light') : variant
  const isLight = effectiveVariant === 'light'

  const navItems = [
    { key: 'services', href: '/#services' },
    { key: 'consultants', href: '/consultants' },
    { key: 'careers', href: '/careers' },
    { key: 'contact', href: '/#contact' }
  ]

  return (
    <footer className={`relative py-12 px-4 border-t ${
      isLight
        ? 'border-slate-200/60 bg-white/30'
        : 'border-white/10 bg-black/20'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <Link href="/">
            <Image
              src={effectiveVariant === 'dark' ? '/logo-dark.svg' : '/logo.svg'}
              alt="EBMC GROUP"
              width={120}
              height={35}
              className="h-8 w-auto"
            />
          </Link>

          {/* Nav */}
          <nav className="flex flex-wrap justify-center items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-sm transition ${
                  isLight
                    ? 'text-slate-500 hover:text-ebmc-turquoise'
                    : 'text-white/60 hover:text-ebmc-turquoise'
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          {/* Social + Copyright */}
          <div className="flex items-center gap-6">
            <a
              href="https://linkedin.com/company/ebmc-group"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition ${
                isLight
                  ? 'text-slate-500 hover:text-ebmc-turquoise'
                  : 'text-white/60 hover:text-ebmc-turquoise'
              }`}
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
              © {new Date().getFullYear()} EBMC GROUP
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
