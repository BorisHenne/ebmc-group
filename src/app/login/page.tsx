'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { TechBackground } from '@/components/ui/TechBackground'
import { ShimmerButton, TextGradient } from '@/components/ui/aceternity'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        setLoading(false)
        return
      }

      router.push('/admin')
    } catch {
      setError('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  return (
    <TechBackground variant="light">
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-ebmc-turquoise transition mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 md:p-10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <Image
                  src="/logo.svg"
                  alt="EBMC GROUP"
                  width={140}
                  height={42}
                  className="mx-auto mb-6"
                />
              </Link>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ebmc-turquoise/10 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-ebmc-turquoise" />
                <span className="text-xs font-medium text-ebmc-turquoise">Administration</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                <TextGradient animate={false}>Connexion</TextGradient>
              </h1>
              <p className="text-slate-500 mt-2 text-sm">Accédez au backoffice EBMC GROUP</p>
            </div>

            {/* Error alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
              >
                <div className="p-1.5 rounded-full bg-red-100">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-red-600 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ebmc-turquoise transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-ebmc-turquoise focus:ring-2 focus:ring-ebmc-turquoise/20 outline-none transition-all"
                    placeholder="admin@ebmc-group.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ebmc-turquoise transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-ebmc-turquoise focus:ring-2 focus:ring-ebmc-turquoise/20 outline-none transition-all"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <ShimmerButton
                type="submit"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </ShimmerButton>
            </form>

            {/* Footer hint */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
              <p className="text-slate-400 text-xs">
                Première connexion ? Utilisez <span className="text-slate-600">admin@ebmc-group.com</span>
              </p>
            </div>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute -z-10 top-10 -right-20 w-40 h-40 bg-ebmc-turquoise/10 rounded-full blur-3xl" />
          <div className="absolute -z-10 -bottom-10 -left-20 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </TechBackground>
  )
}
