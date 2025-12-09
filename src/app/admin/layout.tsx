'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  Shield,
  Webhook,
  Key,
  BookOpen,
  ChevronRight,
  Database
} from 'lucide-react'
import { LightBackground } from '@/components/ui/TechBackground'

interface User {
  id: string
  email: string
  role: string
}

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', color: 'from-ebmc-turquoise to-cyan-500' },
  { href: '/admin/jobs', icon: Briefcase, label: 'Offres d\'emploi', color: 'from-blue-500 to-indigo-500' },
  { href: '/admin/consultants', icon: UserCheck, label: 'Consultants', color: 'from-purple-500 to-pink-500' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Messages', color: 'from-green-500 to-emerald-500' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs', color: 'from-orange-500 to-amber-500' },
  { href: '/admin/roles', icon: Shield, label: 'Rôles', color: 'from-red-500 to-rose-500' },
  { href: '/admin/webhooks', icon: Webhook, label: 'Webhooks', color: 'from-violet-500 to-purple-500' },
  { href: '/admin/api-tokens', icon: Key, label: 'Tokens API', color: 'from-yellow-500 to-orange-500' },
  { href: '/admin/demo-data', icon: Database, label: 'Données démo', color: 'from-emerald-500 to-teal-500' },
  { href: '/admin/docs', icon: BookOpen, label: 'Documentation', color: 'from-teal-500 to-cyan-500' },
  { href: '/admin/settings', icon: Settings, label: 'Paramètres', color: 'from-slate-500 to-slate-600' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setUser(data.user)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
  }

  if (loading) {
    return (
      <LightBackground>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ebmc-turquoise to-cyan-400 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <p className="text-slate-600 font-medium">Chargement...</p>
          </motion.div>
        </div>
      </LightBackground>
    )
  }

  return (
    <LightBackground>
      <div className="min-h-screen">
        {/* Mobile menu button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-3 glass-card rounded-xl shadow-lg"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-slate-700" />
          ) : (
            <Menu className="w-5 h-5 text-slate-700" />
          )}
        </motion.button>

        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || typeof window !== 'undefined') && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -280 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 left-0 z-40 w-72 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              }`}
            >
              <div className="h-full m-4 glass-card rounded-2xl flex flex-col overflow-hidden">
                {/* Logo */}
                <div className="p-6 border-b border-slate-200/50">
                  <Link href="/admin" className="flex items-center gap-3">
                    <Image
                      src="/logo.svg"
                      alt="EBMC GROUP"
                      width={120}
                      height={36}
                      className="h-9 w-auto"
                    />
                  </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                  {menuItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-ebmc-turquoise/20'
                              : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${
                            isActive
                              ? 'bg-white/20'
                              : 'bg-gradient-to-r ' + item.color + ' bg-clip-padding'
                          }`}>
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white'}`} />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-slate-200/50">
                  <div className="flex items-center gap-3 mb-4 px-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-ebmc-turquoise to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-medium truncate">{user?.email}</p>
                      <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
                  >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-medium text-sm">Déconnexion</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="lg:ml-80 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4 pt-20 lg:pt-6 lg:p-8"
          >
            {children}
          </motion.div>
        </main>

        {/* Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </LightBackground>
  )
}
