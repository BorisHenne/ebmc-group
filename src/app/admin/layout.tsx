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
  Kanban,
  LucideIcon
} from 'lucide-react'
import { LightBackground } from '@/components/ui/TechBackground'
import { hasPermission, RolePermissions, ROLE_LABELS, ROLE_COLORS, RoleType } from '@/lib/roles'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/components/ThemeProvider'

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

interface MenuSection {
  title: string
  items: MenuItem[]
}

// Menu organized by sections
const menuSections: MenuSection[] = [
  {
    title: 'Tableau de bord',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', color: 'from-ebmc-turquoise to-cyan-500', permission: 'dashboard' },
      { href: '/admin/sourceur', icon: Target, label: 'Mon espace', color: 'from-purple-500 to-pink-500', permission: 'sourceurDashboard' },
      { href: '/admin/commercial', icon: BarChart3, label: 'Mon espace', color: 'from-blue-500 to-indigo-500', permission: 'commercialDashboard' },
    ]
  },
  {
    title: 'Recrutement',
    items: [
      { href: '/admin/recrutement', icon: Kanban, label: 'Parcours candidats', color: 'from-indigo-500 to-violet-500', permission: 'recruitment' },
      { href: '/admin/scraper', icon: Search, label: 'Recherche CVs', color: 'from-cyan-500 to-blue-500', permission: 'scraper' },
    ]
  },
  {
    title: 'Donnees',
    items: [
      { href: '/admin/jobs', icon: Briefcase, label: 'Offres', color: 'from-blue-500 to-indigo-500', permission: 'jobs' },
      { href: '/admin/consultants', icon: UserCheck, label: 'Consultants', color: 'from-purple-500 to-pink-500', permission: 'consultants' },
      { href: '/admin/messages', icon: MessageSquare, label: 'Messages', color: 'from-green-500 to-emerald-500', permission: 'messages' },
    ]
  },
  {
    title: 'BoondManager',
    items: [
      { href: '/admin/boondmanager', icon: Database, label: 'Gestion BDD', color: 'from-amber-500 to-orange-500', permission: 'boondManager' },
    ]
  },
  {
    title: 'Administration',
    items: [
      { href: '/admin/users', icon: Users, label: 'Utilisateurs', color: 'from-orange-500 to-amber-500', permission: 'users' },
      { href: '/admin/roles', icon: Shield, label: 'Roles', color: 'from-red-500 to-rose-500', permission: 'roles' },
      { href: '/admin/webhooks', icon: Webhook, label: 'Webhooks', color: 'from-violet-500 to-purple-500', permission: 'webhooks' },
      { href: '/admin/api-tokens', icon: Key, label: 'Tokens API', color: 'from-yellow-500 to-orange-500', permission: 'apiTokens' },
      { href: '/admin/demo-data', icon: Database, label: 'Donnees demo', color: 'from-emerald-500 to-teal-500', permission: 'demoData' },
      { href: '/admin/settings', icon: Settings, label: 'Parametres', color: 'from-slate-500 to-slate-600', permission: 'settings' },
    ]
  },
  {
    title: 'Aide',
    items: [
      { href: '/admin/docs', icon: BookOpen, label: 'Documentation', color: 'from-teal-500 to-cyan-500', permission: 'docs' },
    ]
  }
]

// Freelance portal menu sections
const freelanceMenuSections: MenuSection[] = [
  {
    title: 'Mon espace',
    items: [
      { href: '/admin/freelance', icon: LayoutDashboard, label: 'Tableau de bord', color: 'from-green-500 to-emerald-500', permission: 'freelancePortal' },
      { href: '/admin/freelance/timesheets', icon: Clock, label: 'Mes CRA', color: 'from-blue-500 to-indigo-500', permission: 'freelancePortal' },
      { href: '/admin/freelance/absences', icon: Calendar, label: 'Mes absences', color: 'from-purple-500 to-pink-500', permission: 'freelancePortal' },
    ]
  }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Filter menu sections based on user role
  const filteredMenuSections = useMemo(() => {
    if (!user) return []

    const role = user.role as RoleType

    // Freelance and Consultant CDI users see freelance portal
    if (role === 'freelance' || role === 'consultant') {
      return freelanceMenuSections
    }

    // Other users see filtered menu based on permissions
    return menuSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => hasPermission(role, item.permission))
      }))
      .filter(section => section.items.length > 0)
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
      // Freelance and Consultant CDI go to freelance portal
      if ((role === 'freelance' || role === 'consultant') && !pathname.startsWith('/admin/freelance')) {
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

  const renderSidebar = (mobile = false) => {
    let itemIndex = 0

    return (
    <div className="h-full m-4 glass-card rounded-2xl flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <Link href={(user?.role === 'freelance' || user?.role === 'consultant') ? '/admin/freelance' : '/admin'} className="flex items-center gap-3">
          <Image
            src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo.svg'}
            alt="EBMC GROUP"
            width={120}
            height={36}
            className="h-9 w-auto"
          />
        </Link>
      </div>

      {/* Navigation with sections */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {filteredMenuSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
            {/* Section title */}
            <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {section.title}
            </h3>
            {/* Section items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/admin/freelance' && pathname.startsWith(item.href))
                const currentIndex = itemIndex++
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: currentIndex * 0.03 }}
                  >
                    <Link
                      href={item.href}
                      onClick={mobile ? () => setSidebarOpen(false) : undefined}
                      className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-ebmc-turquoise/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
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
            </div>
          </div>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${roleColor} rounded-full flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 dark:text-slate-100 text-sm font-medium truncate">{user?.name || user?.email}</p>
            <p className={`text-xs font-medium bg-gradient-to-r ${roleColor} bg-clip-text text-transparent`}>
              {roleLabel}
            </p>
          </div>
          <ThemeToggle variant="light" />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-medium text-sm">Deconnexion</span>
        </button>
      </div>
    </div>
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
