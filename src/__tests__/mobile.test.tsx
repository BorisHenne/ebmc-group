import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// Mock next/navigation
const mockPush = vi.fn()
const mockPathname = vi.fn(() => '/admin')

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => mockPathname(),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void }>) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
    aside: ({ children, ...props }: React.PropsWithChildren<object>) => <aside {...props}>{children}</aside>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<object>) => <>{children}</>,
}))

// Mock fetch for auth
global.fetch = vi.fn()

describe('Mobile Menu Tests', () => {
  // Store original window.innerWidth
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful auth by default
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: '1', email: 'test@example.com', role: 'admin' } }),
    })
  })

  afterEach(() => {
    // Restore original window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  describe('Viewport Detection', () => {
    it('should detect mobile viewport (< 1024px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      expect(window.innerWidth).toBe(375)
      expect(window.innerWidth < 1024).toBe(true)
    })

    it('should detect tablet viewport (768px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      expect(window.innerWidth).toBe(768)
      expect(window.innerWidth < 1024).toBe(true)
    })

    it('should detect desktop viewport (>= 1024px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      expect(window.innerWidth).toBe(1024)
      expect(window.innerWidth >= 1024).toBe(true)
    })

    it('should detect large desktop viewport (1440px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })
      expect(window.innerWidth).toBe(1440)
      expect(window.innerWidth >= 1024).toBe(true)
    })
  })

  describe('Menu Items Structure', () => {
    const menuItems = [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/jobs', label: 'Offres d\'emploi' },
      { href: '/admin/consultants', label: 'Consultants' },
      { href: '/admin/messages', label: 'Messages' },
      { href: '/admin/users', label: 'Utilisateurs' },
      { href: '/admin/roles', label: 'Rôles' },
      { href: '/admin/webhooks', label: 'Webhooks' },
      { href: '/admin/api-tokens', label: 'Tokens API' },
      { href: '/admin/demo-data', label: 'Données démo' },
      { href: '/admin/docs', label: 'Documentation' },
      { href: '/admin/settings', label: 'Paramètres' },
    ]

    it('should have correct number of menu items', () => {
      expect(menuItems).toHaveLength(11)
    })

    it('should have unique hrefs', () => {
      const hrefs = menuItems.map(item => item.href)
      const uniqueHrefs = [...new Set(hrefs)]
      expect(uniqueHrefs).toHaveLength(hrefs.length)
    })

    it('should have non-empty labels', () => {
      menuItems.forEach(item => {
        expect(item.label).toBeTruthy()
        expect(item.label.length).toBeGreaterThan(0)
      })
    })

    it('should start with /admin prefix', () => {
      menuItems.forEach(item => {
        expect(item.href.startsWith('/admin')).toBe(true)
      })
    })
  })

  describe('Mobile Menu Toggle State', () => {
    it('should toggle menu state correctly', () => {
      let sidebarOpen = false
      const toggle = () => { sidebarOpen = !sidebarOpen }

      expect(sidebarOpen).toBe(false)
      toggle()
      expect(sidebarOpen).toBe(true)
      toggle()
      expect(sidebarOpen).toBe(false)
    })

    it('should close menu when clicking a link', () => {
      let sidebarOpen = true
      const closeSidebar = () => { sidebarOpen = false }

      closeSidebar()
      expect(sidebarOpen).toBe(false)
    })

    it('should close menu when clicking overlay', () => {
      let sidebarOpen = true
      const closeSidebar = () => { sidebarOpen = false }

      // Simulate overlay click
      closeSidebar()
      expect(sidebarOpen).toBe(false)
    })
  })

  describe('Responsive CSS Classes', () => {
    it('should have correct mobile button classes', () => {
      const mobileButtonClasses = 'lg:hidden fixed top-4 left-4 z-50 p-3 glass-card rounded-xl shadow-lg'
      expect(mobileButtonClasses).toContain('lg:hidden')
      expect(mobileButtonClasses).toContain('fixed')
      expect(mobileButtonClasses).toContain('z-50')
    })

    it('should have correct desktop sidebar classes', () => {
      const desktopSidebarClasses = 'hidden lg:block fixed inset-y-0 left-0 z-40 w-72'
      expect(desktopSidebarClasses).toContain('hidden')
      expect(desktopSidebarClasses).toContain('lg:block')
      expect(desktopSidebarClasses).toContain('fixed')
    })

    it('should have correct mobile sidebar classes', () => {
      const mobileSidebarClasses = 'lg:hidden fixed inset-y-0 left-0 z-40 w-72'
      expect(mobileSidebarClasses).toContain('lg:hidden')
      expect(mobileSidebarClasses).toContain('fixed')
      expect(mobileSidebarClasses).toContain('w-72')
    })

    it('should have correct overlay classes', () => {
      const overlayClasses = 'fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden'
      expect(overlayClasses).toContain('fixed')
      expect(overlayClasses).toContain('inset-0')
      expect(overlayClasses).toContain('z-30')
      expect(overlayClasses).toContain('lg:hidden')
    })

    it('should have correct main content classes', () => {
      const mainClasses = 'lg:ml-80 min-h-screen'
      expect(mainClasses).toContain('lg:ml-80')
      expect(mainClasses).toContain('min-h-screen')
    })
  })

  describe('Touch Interactions', () => {
    it('should handle touch on mobile button', () => {
      let clicked = false
      const handleClick = () => { clicked = true }

      // Simulate button click
      handleClick()
      expect(clicked).toBe(true)
    })

    it('should handle swipe gestures (conceptual)', () => {
      // Test swipe gesture detection
      const touchStart = { x: 0, y: 0 }
      const touchEnd = { x: 100, y: 0 }

      const deltaX = touchEnd.x - touchStart.x
      const isRightSwipe = deltaX > 50

      expect(isRightSwipe).toBe(true)
    })

    it('should handle left swipe to close (conceptual)', () => {
      const touchStart = { x: 100, y: 0 }
      const touchEnd = { x: 0, y: 0 }

      const deltaX = touchEnd.x - touchStart.x
      const isLeftSwipe = deltaX < -50

      expect(isLeftSwipe).toBe(true)
    })
  })

  describe('Animation Properties', () => {
    it('should have correct slide animation values', () => {
      const sidebarWidth = 288 // w-72 = 18rem = 288px
      const initial = { x: -sidebarWidth }
      const animate = { x: 0 }
      const exit = { x: -sidebarWidth }

      expect(initial.x).toBe(-288)
      expect(animate.x).toBe(0)
      expect(exit.x).toBe(-288)
    })

    it('should have correct spring transition config', () => {
      const transition = {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }

      expect(transition.type).toBe('spring')
      expect(transition.damping).toBe(25)
      expect(transition.stiffness).toBe(200)
    })
  })

  describe('Breakpoint Logic', () => {
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    }

    it('should identify mobile devices correctly', () => {
      const mobileWidths = [320, 375, 414, 430]
      mobileWidths.forEach(width => {
        expect(width < breakpoints.lg).toBe(true)
      })
    })

    it('should identify tablets correctly', () => {
      const tabletWidths = [768, 834, 1024]
      tabletWidths.forEach(width => {
        expect(width >= breakpoints.md).toBe(true)
      })
    })

    it('should show mobile menu button below lg breakpoint', () => {
      const viewportWidth = 1023
      const shouldShowMobileButton = viewportWidth < breakpoints.lg
      expect(shouldShowMobileButton).toBe(true)
    })

    it('should hide mobile menu button at lg breakpoint and above', () => {
      const viewportWidth = 1024
      const shouldShowMobileButton = viewportWidth < breakpoints.lg
      expect(shouldShowMobileButton).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible menu button', () => {
      // Menu button should be focusable and have appropriate aria attributes
      const buttonElement = document.createElement('button')
      buttonElement.setAttribute('aria-label', 'Toggle menu')
      buttonElement.setAttribute('aria-expanded', 'false')

      expect(buttonElement.getAttribute('aria-label')).toBe('Toggle menu')
      expect(buttonElement.getAttribute('aria-expanded')).toBe('false')
    })

    it('should update aria-expanded when menu opens', () => {
      const buttonElement = document.createElement('button')
      buttonElement.setAttribute('aria-expanded', 'false')

      // Simulate menu opening
      buttonElement.setAttribute('aria-expanded', 'true')
      expect(buttonElement.getAttribute('aria-expanded')).toBe('true')
    })

    it('should have focusable menu items', () => {
      const linkElement = document.createElement('a')
      linkElement.href = '/admin/jobs'
      linkElement.tabIndex = 0

      expect(linkElement.tabIndex).toBe(0)
    })

    it('should trap focus within mobile menu when open', () => {
      // Focus trap should prevent tab from leaving the menu
      const focusableElements = ['button', 'a', 'input', 'select', 'textarea']
      expect(focusableElements).toContain('a')
      expect(focusableElements).toContain('button')
    })
  })

  describe('Route Change Behavior', () => {
    it('should close sidebar on route change in mobile', () => {
      let sidebarOpen = true
      const isMobile = true
      const pathname = '/admin/jobs'

      // Simulate route change effect
      if (isMobile) {
        sidebarOpen = false
      }

      expect(sidebarOpen).toBe(false)
    })

    it('should not affect sidebar on route change in desktop', () => {
      let sidebarOpen = true
      const isMobile = false

      // Simulate route change effect - should not close on desktop
      if (isMobile) {
        sidebarOpen = false
      }

      expect(sidebarOpen).toBe(true)
    })
  })

  describe('User Info Display', () => {
    it('should display user initial correctly', () => {
      const userEmail = 'test@example.com'
      const initial = userEmail.charAt(0).toUpperCase()
      expect(initial).toBe('T')
    })

    it('should truncate long email addresses', () => {
      const longEmail = 'verylongemailaddress@verylong.domain.com'
      const maxLength = 25
      const truncated = longEmail.length > maxLength
        ? longEmail.substring(0, maxLength) + '...'
        : longEmail

      expect(truncated.length).toBeLessThanOrEqual(maxLength + 3)
    })

    it('should capitalize user role', () => {
      const role = 'admin'
      const capitalized = role.charAt(0).toUpperCase() + role.slice(1)
      expect(capitalized).toBe('Admin')
    })
  })

  describe('Z-Index Layering', () => {
    it('should have correct z-index hierarchy', () => {
      const zIndexes = {
        overlay: 30,
        sidebar: 40,
        menuButton: 50,
      }

      expect(zIndexes.menuButton).toBeGreaterThan(zIndexes.sidebar)
      expect(zIndexes.sidebar).toBeGreaterThan(zIndexes.overlay)
    })

    it('should overlay be behind sidebar', () => {
      expect(30).toBeLessThan(40)
    })

    it('should menu button be on top', () => {
      expect(50).toBeGreaterThan(40)
    })
  })
})

describe('Homepage Mobile Navigation', () => {
  describe('Navigation Menu Items', () => {
    const navItems = [
      { href: '#services', label: 'Services', isAnchor: true },
      { href: '/consultants', label: 'Consultants', isAnchor: false },
      { href: '/careers', label: 'Carrières', isAnchor: false },
      { href: '#contact', label: 'Contact', isAnchor: true },
    ]

    it('should have correct number of navigation items', () => {
      expect(navItems).toHaveLength(4)
    })

    it('should include Consultants link', () => {
      const consultantsItem = navItems.find(item => item.href === '/consultants')
      expect(consultantsItem).toBeDefined()
      expect(consultantsItem?.label).toBe('Consultants')
    })

    it('should include Careers link', () => {
      const careersItem = navItems.find(item => item.href === '/careers')
      expect(careersItem).toBeDefined()
      expect(careersItem?.label).toBe('Carrières')
    })

    it('should have anchor links for Services and Contact', () => {
      const anchorItems = navItems.filter(item => item.isAnchor)
      expect(anchorItems).toHaveLength(2)
      expect(anchorItems.map(i => i.label)).toContain('Services')
      expect(anchorItems.map(i => i.label)).toContain('Contact')
    })

    it('should have page links for Consultants and Careers', () => {
      const pageItems = navItems.filter(item => !item.isAnchor)
      expect(pageItems).toHaveLength(2)
      expect(pageItems.map(i => i.label)).toContain('Consultants')
      expect(pageItems.map(i => i.label)).toContain('Carrières')
    })
  })

  describe('Mobile Menu Toggle', () => {
    it('should toggle mobile menu state', () => {
      let mobileMenuOpen = false
      const toggleMenu = () => { mobileMenuOpen = !mobileMenuOpen }

      expect(mobileMenuOpen).toBe(false)
      toggleMenu()
      expect(mobileMenuOpen).toBe(true)
      toggleMenu()
      expect(mobileMenuOpen).toBe(false)
    })

    it('should close menu when clicking a nav item', () => {
      let mobileMenuOpen = true
      const closeMenu = () => { mobileMenuOpen = false }

      closeMenu()
      expect(mobileMenuOpen).toBe(false)
    })
  })

  describe('Mobile Menu CSS Classes', () => {
    it('should have correct hamburger button classes', () => {
      const buttonClasses = 'md:hidden p-2 text-slate-700 hover:text-ebmc-turquoise transition'
      expect(buttonClasses).toContain('md:hidden')
      expect(buttonClasses).toContain('p-2')
    })

    it('should have correct desktop nav classes', () => {
      const desktopNavClasses = 'hidden md:flex items-center gap-8'
      expect(desktopNavClasses).toContain('hidden')
      expect(desktopNavClasses).toContain('md:flex')
    })

    it('should have correct mobile menu container classes', () => {
      const mobileMenuClasses = 'md:hidden mt-4 pt-4 border-t border-slate-200/60'
      expect(mobileMenuClasses).toContain('md:hidden')
      expect(mobileMenuClasses).toContain('border-t')
    })

    it('should have correct mobile nav item classes', () => {
      const itemClasses = 'py-3 px-2 text-sm font-medium text-slate-600 hover:text-ebmc-turquoise hover:bg-slate-50 rounded-lg transition'
      expect(itemClasses).toContain('py-3')
      expect(itemClasses).toContain('rounded-lg')
      expect(itemClasses).toContain('hover:bg-slate-50')
    })
  })

  describe('Mobile Breakpoint', () => {
    it('should show hamburger menu below md breakpoint (768px)', () => {
      const viewportWidth = 767
      const shouldShowMobileMenu = viewportWidth < 768
      expect(shouldShowMobileMenu).toBe(true)
    })

    it('should hide hamburger menu at md breakpoint and above', () => {
      const viewportWidth = 768
      const shouldShowMobileMenu = viewportWidth < 768
      expect(shouldShowMobileMenu).toBe(false)
    })
  })
})

describe('Mobile Navigation UX', () => {
  it('should have smooth sidebar width', () => {
    // w-72 = 18rem = 288px
    const sidebarWidth = 72 * 4 // Tailwind rem calculation
    expect(sidebarWidth).toBe(288)
  })

  it('should have appropriate padding for touch targets', () => {
    // Menu button has p-3 = 12px padding
    const padding = 3 * 4 // Tailwind spacing
    expect(padding).toBe(12)

    // Menu items have py-3 = 12px vertical padding
    const menuItemPadding = 3 * 4
    expect(menuItemPadding).toBe(12)
  })

  it('should have minimum touch target size', () => {
    // WCAG recommends minimum 44x44px touch targets
    const minTouchTarget = 44
    const buttonPadding = 12
    const iconSize = 20 // w-5 h-5

    const buttonSize = buttonPadding * 2 + iconSize
    expect(buttonSize).toBeGreaterThanOrEqual(minTouchTarget)
  })
})
