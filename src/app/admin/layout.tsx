'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
  Database,
  Clock,
  Calendar,
  Search,
  Target,
  BarChart3,
  LucideIcon
} from 'lucide-react'
import { LightBackground } from '@/components/ui/TechBackground'
import { hasPermission, RolePermissions, ROLE_LABELS, ROLE_COLORS, RoleType } from '@/lib/roles'

interface User {
  id: string
  email: string
  name?: string
  role: string
  boondManagerId?: number
  boondManagerSubdomain?: string
}

interface MenuItem {
  href: string
  icon: LucideIcon
  label: string
  color: string
  permission: keyof RolePermissions
}

// All possible menu items
const allMenuItems: MenuItem[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', color: 'from-ebmc-turquoise to-cyan-500', permission: 'dashboard' },
  { href: '/admin/sourceur', icon: Target, label: 'Dashboard Sourceur', color: 'from-purple-500 to-pink-500', permission: 'sourceurDashboard' },
  { href: '/admin/commercial', icon: BarChart3, label: 'Dashboard Commercial', color: 'from-blue-500 to-indigo-500', permission: 'commercialDashboard' },
  { href: '/admin/scraper', icon: Search, label: 'Recherche CVs', color: 'from-indigo-500 to-purple-500', permission: 'scraper' },
  { href: '/admin/jobs', icon: Briefcase, label: 'Offres d\'emploi', color: 'from-blue-500 to-indigo-500', permission: 'jobs' },
  { href: '/admin/consultants', icon: UserCheck, label: 'Consultants', color: 'from-purple-500 to-pink-500', permission: 'consultants' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Messages', color: 'from-green-500 to-emerald-500', permission: 'messages' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs', color: 'from-orange-500 to-amber-500', permission: 'users' },
  { href: '/admin/roles', icon: Shield, label: 'Rôles', color: 'from-red-500 to-rose-500', permission: 'roles' },
  { href: '/admin/webhooks', icon: Webhook, label: 'Webhooks', color: 'from-violet-500 to-purple-500', permission: 'webhooks' },
  { href: '/admin/api-tokens', icon: Key, label: 'Tokens API', color: 'from-yellow-500 to-orange-500', permission: 'apiTokens' },
  { href: '/admin/demo-data', icon: Database, label: 'Donnees demo', color: 'from-emerald-500 to-teal-500', permission: 'demoData' },
  { href: '/admin/docs', icon: BookOpen, label: 'Documentation', color: 'from-teal-500 to-cyan-500', permission: 'docs' },
  { href: '/admin/settings', icon: Settings, label: 'Parametres', color: 'from-slate-500 to-slate-600', permission: 'settings' },
]

// Freelance portal menu items
const freelanceMenuItems: MenuItem[] = [
  { href: '/admin/freelance', icon: LayoutDashboard, label: 'Mon espace', color: 'from-green-500 to-emerald-500', permission: 'freelancePortal' },
  { href: '/admin/freelance/timesheets', icon: Clock, label: 'Mes CRA', color: 'from-blue-500 to-indigo-500', permission: 'freelancePortal' },
  { href: '/admin/freelance/absences', icon: Calendar, label: 'Mes absences', color: 'from-purple-500 to-pink-500', permission: 'freelancePortal' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (!user) return []

    const role = user.role as RoleType

    // Freelance users only see freelance portal
    if (role === 'freelance') {
      return freelanceMenuItems
    }

    // Other users see filtered menu based on permissions
    return allMenuItems.filter(item => hasPermission(role, item.permission))
  }, [user])

  // Handle resize to detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setUser(data.user)

      // Redirect users to their role-specific dashboard
      const role = data.user.role
      if (role === 'freelance' && !pathname.startsWith('/admin/freelance')) {
        router.push('/admin/freelance')
      } else if (role === 'sourceur' && pathname === '/admin') {
        router.push('/admin/sourceur')
      } else if (role === 'commercial' && pathname === '/admin') {
        router.push('/admin/commercial')
      }
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router, pathname])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
  }

  // Get role display info
  const roleLabel = user ? (ROLE_LABELS[user.role as RoleType] || user.role) : ''
  const roleColor = user ? (ROLE_COLORS[user.role as RoleType] || 'from-slate-500 to-slate-600') : ''

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

  const renderSidebar = (mobile = false) => (
    <div className="h-full m-4 glass-card rounded-2xl flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/50">
        <Link href={user?.role === 'freelance' ? '/admin/freelance' : '/admin'} className="flex items-center gap-3">
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
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/admin/freelance' && pathname.startsWith(item.href))
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={mobile ? () => setSidebarOpen(false) : undefined}
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
          <div className={`w-10 h-10 bg-gradient-to-r ${roleColor} rounded-full flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 text-sm font-medium truncate">{user?.name || user?.email}</p>
            <p className={`text-xs font-medium bg-gradient-to-r ${roleColor} bg-clip-text text-transparent`}>
              {roleLabel}
            </p>
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
  )

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

        {/* Desktop Sidebar - Always visible on lg+ */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-72">
          {renderSidebar()}
        </aside>

        {/* Mobile Sidebar - Animated */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 z-40 w-72"
            >
              {renderSidebar(true)}
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
