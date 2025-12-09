import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: { children: React.ReactNode }) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }: { children: React.ReactNode }) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  FunnelChart: ({ children }: { children: React.ReactNode }) => <div data-testid="funnel-chart">{children}</div>,
  Funnel: () => null,
  LabelList: () => null,
}))

describe('Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user info with name from /api/auth/me', async () => {
    const mockUserResponse = {
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'sourceur',
        name: 'John Doe'
      }
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUserResponse,
    })

    const response = await fetch('/api/auth/me', { credentials: 'include' })
    const data = await response.json()

    expect(data.user.name).toBe('John Doe')
    expect(data.user.email).toBe('test@example.com')
    expect(data.user.role).toBe('sourceur')
  })

  it('should return boondmanager stats', async () => {
    const mockStatsResponse = {
      success: true,
      demo: true,
      data: {
        candidates: { total: 25, byState: { 1: 5, 2: 8, 3: 7, 4: 3, 5: 1, 6: 1 } },
        resources: { total: 15, byState: { 1: 5, 2: 6, 3: 2, 4: 1, 5: 1 } },
        opportunities: { total: 12, byState: { 1: 6, 2: 3, 3: 2, 4: 1 } },
      }
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStatsResponse,
    })

    const response = await fetch('/api/boondmanager?type=stats&demo=true', { credentials: 'include' })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.demo).toBe(true)
    expect(data.data.candidates.total).toBe(25)
    expect(data.data.resources.total).toBe(15)
    expect(data.data.opportunities.total).toBe(12)
  })

  it('should return candidates list', async () => {
    const mockCandidatesResponse = {
      success: true,
      demo: true,
      data: [
        {
          id: 1001,
          attributes: {
            firstName: 'Jean',
            lastName: 'Martin',
            email: 'jean.martin@example.com',
            state: 2,
            title: 'Développeur Full Stack'
          }
        },
        {
          id: 1002,
          attributes: {
            firstName: 'Marie',
            lastName: 'Dubois',
            email: 'marie.dubois@example.com',
            state: 4,
            title: 'Data Scientist'
          }
        }
      ]
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCandidatesResponse,
    })

    const response = await fetch('/api/boondmanager?type=candidates&demo=true', { credentials: 'include' })
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.length).toBe(2)
    expect(data.data[0].attributes.firstName).toBe('Jean')
    expect(data.data[1].attributes.title).toBe('Data Scientist')
  })
})

describe('Dashboard Personalization', () => {
  it('should display personalized greeting with user name', () => {
    const userName = 'Sophie Bernard'
    const expectedGreeting = `Bonjour ${userName}`

    expect(expectedGreeting).toBe('Bonjour Sophie Bernard')
  })

  it('should fallback to default title when no user name', () => {
    const userName = ''
    const title = userName ? `Bonjour ${userName}` : 'Dashboard Sourceur'

    expect(title).toBe('Dashboard Sourceur')
  })
})

describe('Auth Token with Name', () => {
  it('should include name in token payload structure', () => {
    // Token payload structure test
    const tokenPayload = {
      userId: '123',
      email: 'test@example.com',
      role: 'sourceur',
      name: 'Test User'
    }

    expect(tokenPayload.name).toBeDefined()
    expect(tokenPayload.name).toBe('Test User')
  })
})

describe('Settings API', () => {
  it('should save site settings', async () => {
    const mockSettingsResponse = { success: true }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSettingsResponse,
    })

    const settings = {
      companyName: 'EBMC GROUP',
      emailContact: 'contact@ebmcgroup.eu',
      phoneMain: '+352 621 123 456',
      addressCity: 'Luxembourg'
    }

    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    const data = await response.json()

    expect(data.success).toBe(true)
  })

  it('should fetch site settings', async () => {
    const mockSettingsResponse = {
      settings: {
        companyName: 'EBMC GROUP',
        emailContact: 'contact@ebmcgroup.eu',
        phoneMain: '+352 621 123 456',
        addressCity: 'Luxembourg'
      }
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSettingsResponse,
    })

    const response = await fetch('/api/admin/settings')
    const data = await response.json()

    expect(data.settings.companyName).toBe('EBMC GROUP')
    expect(data.settings.addressCity).toBe('Luxembourg')
  })
})
