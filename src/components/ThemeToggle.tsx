'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface ThemeToggleProps {
  variant?: 'light' | 'dark'
  showLabel?: boolean
}

export function ThemeToggle({ variant = 'light', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const themes = [
    { key: 'light' as const, icon: Sun, label: 'Clair' },
    { key: 'dark' as const, icon: Moon, label: 'Sombre' },
    { key: 'system' as const, icon: Monitor, label: 'Système' },
  ]

  const currentIndex = themes.findIndex(t => t.key === theme)

  const cycleTheme = () => {
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].key)
  }

  const CurrentIcon = themes[currentIndex]?.icon || Sun

  const baseClasses = variant === 'dark'
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'

  return (
    <motion.button
      onClick={cycleTheme}
      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${baseClasses}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Thème: ${themes[currentIndex]?.label || 'Clair'}`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <CurrentIcon className="w-5 h-5" />
      </motion.div>
      {showLabel && (
        <span className="text-sm font-medium">
          {themes[currentIndex]?.label || 'Clair'}
        </span>
      )}
    </motion.button>
  )
}

// Compact toggle for navbars
export function ThemeToggleCompact({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const baseClasses = variant === 'dark'
    ? 'bg-white/10 hover:bg-white/20'
    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-colors ${baseClasses}`}
      whileTap={{ scale: 0.95 }}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      <motion.div
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{ left: isDark ? 'calc(100% - 24px)' : '4px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.div
          key={resolvedTheme}
          initial={{ rotate: -45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-slate-700" />
          ) : (
            <Sun className="w-3 h-3 text-amber-500" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  )
}
