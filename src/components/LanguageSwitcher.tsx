'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface LanguageSwitcherProps {
  locale: string
  variant?: 'dark' | 'light'
}

export function LanguageSwitcher({ locale, variant = 'dark' }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isLight = variant === 'light'

  const switchLocale = (newLocale: string) => {
    startTransition(async () => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`
      router.refresh()
    })
  }

  return (
    <div className={`flex items-center gap-1 rounded-full p-1 ${
      isLight
        ? 'bg-slate-100 border border-slate-200'
        : 'bg-white/10 backdrop-blur-sm border border-white/20'
    }`}>
      {['fr', 'en'].map((lang) => (
        <motion.button
          key={lang}
          onClick={() => switchLocale(lang)}
          disabled={isPending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            locale === lang
              ? 'bg-ebmc-turquoise text-white'
              : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-white/70 hover:text-white'
          }`}
        >
          {lang.toUpperCase()}
        </motion.button>
      ))}
    </div>
  )
}
