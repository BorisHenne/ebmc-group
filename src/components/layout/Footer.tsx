'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Linkedin } from 'lucide-react'

export function Footer() {
  const t = useTranslations()

  const navItems = [
    { key: 'services', href: '/#services' },
    { key: 'consultants', href: '/consultants' },
    { key: 'careers', href: '/careers' },
    { key: 'contact', href: '/#contact' }
  ]

  return (
    <footer className="relative py-12 px-4 border-t border-white/10 bg-black/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <Link href="/">
            <Image src="/logo.svg" alt="EBMC GROUP" width={120} height={35} className="h-8 w-auto" />
          </Link>

          {/* Nav */}
          <nav className="flex flex-wrap justify-center items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-white/60 hover:text-ebmc-turquoise transition text-sm"
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
              className="text-white/60 hover:text-ebmc-turquoise transition"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} EBMC GROUP
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
