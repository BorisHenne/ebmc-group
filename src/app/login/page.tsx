'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft, Sparkles, Building2, ExternalLink, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { TechBackground } from '@/components/ui/TechBackground'
import { ShimmerButton, TextGradient } from '@/components/ui/aceternity'

type AuthMode = 'standard' | 'boondmanager'

// Demo users for testing
const demoUsers = [
  { email: 'admin@ebmc-group.com', password: 'admin123', role: 'Admin', color: 'from-red-500 to-rose-500' },
  { email: 'sourceur@ebmc-group.com', password: 'sourceur123', role: 'Sourceur', color: 'from-purple-500 to-indigo-500' },
  { email: 'commercial@ebmc-group.com', password: 'commercial123', role: 'Commercial', color: 'from-blue-500 to-cyan-500' },
  { email: 'freelance@ebmc-group.com', password: 'freelance123', role: 'Freelance', color: 'from-green-500 to-emerald-500' },
  { email: 'user@ebmc-group.com', password: 'user123', role: 'User', color: 'from-slate-500 to-slate-600' },
]

export default function LoginPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<AuthMode>('boondmanager')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStandardLogin = async (e: React.FormEvent) => {
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

  const handleBoondManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/boondmanager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, subdomain: 'ui' })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion BoondManager')
        setLoading(false)
        return
      }

      router.push('/admin')
    } catch {
      setError('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setError('')
  }

  const switchMode = (mode: AuthMode) => {
    resetForm()
    setAuthMode(mode)
  }

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setAuthMode('standard')
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
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

            {/* Auth Mode Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl mb-6">
              <button
                onClick={() => switchMode('standard')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  authMode === 'standard'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => switchMode('boondmanager')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  authMode === 'boondmanager'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                BoondManager
              </button>
            </div>

            {/* Error alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
                >
                  <div className="p-1.5 rounded-full bg-red-100">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-red-600 text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {authMode === 'standard' ? (
                <motion.form
                  key="standard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleStandardLogin}
                  className="space-y-5"
                >
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
                </motion.form>
              ) : (
                <motion.form
                  key="boondmanager"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleBoondManagerLogin}
                  className="space-y-5"
                >
                  {/* BoondManager Info */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50/80 border border-blue-100 rounded-xl mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-blue-700">
                      Connectez-vous avec vos identifiants BoondManager
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email BoondManager
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ebmc-turquoise transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-ebmc-turquoise focus:ring-2 focus:ring-ebmc-turquoise/20 outline-none transition-all"
                        placeholder="vous@entreprise.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mot de passe BoondManager
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
                        Connexion BoondManager...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        Se connecter avec BoondManager
                      </>
                    )}
                  </ShimmerButton>

                  {/* BoondManager link */}
                  <div className="text-center">
                    <a
                      href="https://www.boondmanager.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-ebmc-turquoise transition"
                    >
                      Qu&apos;est-ce que BoondManager ?
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Demo Users Section - only shown in standard mode */}
            {authMode === 'standard' && (
              <div className="mt-8 pt-6 border-t border-slate-200/60">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Comptes de test</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.map((user) => (
                    <button
                      key={user.email}
                      onClick={() => fillDemoCredentials(user.email, user.password)}
                      className="group p-2.5 rounded-lg bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${user.color} flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">{user.role.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{user.role}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email.split('@')[0]}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BoondManager hint */}
            {authMode === 'boondmanager' && (
              <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
                <p className="text-slate-400 text-xs">
                  Activez l&apos;API REST dans votre profil BoondManager
                </p>
              </div>
            )}
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute -z-10 top-10 -right-20 w-40 h-40 bg-ebmc-turquoise/10 rounded-full blur-3xl" />
          <div className="absolute -z-10 -bottom-10 -left-20 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </TechBackground>
  )
}
