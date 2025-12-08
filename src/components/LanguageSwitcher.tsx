'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export function LanguageSwitcher({ locale }: { locale: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const switchLocale = (newLocale: string) => {
    startTransition(async () => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-1 glass rounded-full p-1">
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
              : 'text-white/60 hover:text-white'
          }`}
        >
          {lang.toUpperCase()}
        </motion.button>
      ))}
    </div>
  )
}
