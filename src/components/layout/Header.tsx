'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, ChevronDown, Sun, Moon, 
  Server, Monitor, Shield, Brain, Users, Mail 
} from 'lucide-react'
import { useTheme } from 'next-themes'

const expertises = [
  { 
    name: 'SAP', 
    href: '/sap', 
    icon: Server,
    description: 'ECC, S/4HANA, RISE, BTP',
  },
  { 
    name: 'ICT', 
    href: '/ict', 
    icon: Monitor,
    description: 'Cloud, Dev, Data & IA',
  },
  { 
    name: 'Cybersécurité', 
    href: '/cybersecurity', 
    icon: Shield,
    description: 'SOC, Audit, Conformité',
  },
  { 
    name: 'IA Générative', 
    href: '/ai', 
    icon: Brain,
    description: 'Copilotes & Automation',
  },
]

const navLinks = [
  { name: 'Expertises', href: '#', hasDropdown: true },
  { name: 'Pourquoi EBMC', href: '/why-ebmc' },
  { name: 'Carrières', href: '/careers' },
  { name: 'Contact', href: '/contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
    setIsDropdownOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileOpen
          ? 'bg-background/80 backdrop-blur-xl border-b'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DB5B5] to-[#249292] flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <div className="absolute inset-0 rounded-xl bg-[#2DB5B5] blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
            </div>
            <span className="font-bold text-xl hidden sm:block">
              EBMC <span className="text-[#2DB5B5]">GROUP</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      ['/sap', '/ict', '/cybersecurity', '/ai'].includes(pathname)
                        ? 'text-[#2DB5B5]'
                        : 'text-foreground'
                    }`}
                  >
                    {link.name}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-72 p-2 rounded-xl bg-card border shadow-xl"
                      >
                        {expertises.map((exp) => (
                          <Link
                            key={exp.name}
                            href={exp.href}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted ${
                              pathname === exp.href ? 'bg-[#2DB5B5]/10' : ''
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-[#2DB5B5]/10 text-[#2DB5B5]">
                              <exp.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{exp.name}</div>
                              <div className="text-sm text-muted-foreground">{exp.description}</div>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                    pathname === link.href ? 'text-[#2DB5B5]' : 'text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}

            {/* CTA Button */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2DB5B5] text-white text-sm font-medium hover:bg-[#249292] transition-colors"
            >
              <Mail className="h-4 w-4" />
              Nous contacter
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* Expertises */}
              <div className="pb-4 border-b">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  Expertises
                </div>
                {expertises.map((exp) => (
                  <Link
                    key={exp.name}
                    href={exp.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      pathname === exp.href
                        ? 'bg-[#2DB5B5]/10 text-[#2DB5B5]'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <exp.icon className="h-5 w-5" />
                    <span className="font-medium">{exp.name}</span>
                  </Link>
                ))}
              </div>

              {/* Other Links */}
              {navLinks.filter((l) => !l.hasDropdown).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-3 rounded-lg font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-[#2DB5B5]/10 text-[#2DB5B5]'
                      : 'hover:bg-muted'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile CTA */}
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-[#2DB5B5] text-white font-medium"
              >
                <Mail className="h-4 w-4" />
                Nous contacter
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
