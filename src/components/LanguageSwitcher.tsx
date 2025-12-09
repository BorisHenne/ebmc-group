'use client'

import { useTransition, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'

interface LanguageSwitcherProps {
  locale: string
  variant?: 'dark' | 'light'
}

export function LanguageSwitcher({ locale, variant = 'dark' }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isLight = variant === 'light'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }
    setIsOpen(false)
    startTransition(() => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`
      router.refresh()
    })
  }

  const languages = [
    { code: 'fr', label: 'FR', fullLabel: 'Français' },
    { code: 'en', label: 'EN', fullLabel: 'English' },
  ]

  const currentLang = languages.find(l => l.code === locale) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
          isLight
            ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            : 'text-white/60 hover:text-white/90 hover:bg-white/5'
        } ${isPending ? 'opacity-50' : ''}`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-1 z-50 min-w-[100px] rounded-md shadow-lg py-1 ${
              isLight
                ? 'bg-white border border-slate-200'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                disabled={isPending}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                  locale === lang.code
                    ? isLight
                      ? 'bg-ebmc-turquoise/10 text-ebmc-turquoise'
                      : 'bg-ebmc-turquoise/20 text-ebmc-turquoise'
                    : isLight
                      ? 'text-slate-600 hover:bg-slate-50'
                      : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {lang.fullLabel}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
