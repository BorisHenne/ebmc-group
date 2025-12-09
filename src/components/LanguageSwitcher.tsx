'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  locale: string
  variant?: 'dark' | 'light'
}

export function LanguageSwitcher({ locale, variant = 'dark' }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const isLight = variant === 'light'

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }
    startTransition(async () => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`
      router.refresh()
    })
    setIsOpen(false)
  }

  const languages = [
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ]

  const currentLang = languages.find(l => l.code === locale) || languages[0]
  const otherLang = languages.find(l => l.code !== locale) || languages[1]

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          isLight
            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-0 top-full mt-1 z-50 rounded-lg shadow-lg overflow-hidden ${
                isLight
                  ? 'bg-white border border-slate-200'
                  : 'bg-slate-800/95 backdrop-blur-sm border border-white/10'
              }`}
            >
              <button
                onClick={() => switchLocale(otherLang.code)}
                disabled={isPending}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors w-full ${
                  isLight
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{otherLang.flag}</span>
                <span>{otherLang.code === 'fr' ? 'Français' : 'English'}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
