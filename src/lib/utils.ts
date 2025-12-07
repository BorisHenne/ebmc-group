import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine class names with Tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date in French locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(d)
}

/**
 * Format relative time (e.g., "il y a 2 jours")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
  return `Il y a ${Math.floor(diffDays / 365)} ans`
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format salary range
 */
export function formatSalaryRange(
  min?: number,
  max?: number,
  currency: string = 'EUR',
  period: string = 'yearly'
): string | null {
  if (!min && !max) return null

  const periodLabel = period === 'yearly' ? '/an' : period === 'monthly' ? '/mois' : ''
  const curr = currency.toUpperCase() === 'EUR' ? '€' : currency

  if (min && max) {
    return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')}${curr}${periodLabel}`
  }
  if (min) {
    return `À partir de ${min.toLocaleString('fr-FR')}${curr}${periodLabel}`
  }
  return `Jusqu'à ${max?.toLocaleString('fr-FR')}${curr}${periodLabel}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

/**
 * Slugify text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if we're on the server
 */
export const isServer = typeof window === 'undefined'

/**
 * Check if we're in development mode
 */
export const isDev = process.env.NODE_ENV === 'development'

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Une erreur inattendue est survenue'
}
