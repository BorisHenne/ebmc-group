// Types for Offers collection
// Based on src/collections/Offers.ts

export type Offer = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  description: unknown // Rich text
  category: 'sap' | 'ict' | 'cybersecurity' | 'ai' | 'management' | 'other'
  type: 'cdi' | 'cdd' | 'freelance' | 'internship' | 'apprenticeship'
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
  location: string
  country: 'luxembourg' | 'france' | 'belgium' | 'spain' | 'germany'
  remote?: 'onsite' | 'hybrid' | 'remote' | 'flexible' | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: 'eur' | 'chf' | 'usd' | null
  salaryPeriod?: 'hourly' | 'daily' | 'monthly' | 'yearly' | null
  salaryVisible?: boolean | null
  benefits?: Array<{
    benefit?: string | null
    id?: string | null
  }> | null
  skills?: Array<{
    skill: string
    required?: boolean | null
    id?: string | null
  }> | null
  languages?: Array<{
    language?: 'french' | 'english' | 'german' | 'spanish' | 'luxembourgish' | null
    level?: 'basic' | 'intermediate' | 'fluent' | 'native' | null
    id?: string | null
  }> | null
  requirements?: unknown | null // Rich text
  featured?: boolean | null
  publishedAt?: string | null
  expiresAt?: string | null
  applicationCount?: number | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: string | null
  } | null
  boondId?: string | null
  boondSyncedAt?: string | null
  _status?: 'draft' | 'published' | null
  createdAt: string
  updatedAt: string
}
