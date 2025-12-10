'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Clock, Calendar, CheckCircle, AlertCircle, ArrowRight, User, Building2,
  Briefcase, MapPin, Award, Zap, FolderKanban, Target, Mail, Phone
} from 'lucide-react'

interface UserInfo {
  id: string
  email: string
  name?: string
  role?: string
  boondManagerId?: number
  boondManagerSubdomain?: string
  authProvider?: string
}

interface ConsultantProfile {
  id: string
  boondManagerId?: number
  name: string
  title?: string
  location?: string
  experience?: string
  skills: string[]
  certifications: string[]
  available?: boolean
  category?: string
}

interface CandidateProfile {
  id: string
  boondManagerId?: number
  firstName: string
  lastName: string
  title?: string
  state: number
  stateLabel: string
  location?: string
  skills: string[]
}

interface BoondResource {
  id: number
  firstName?: string
  lastName?: string
  title?: string
  email?: string
  phone?: string
  state?: number
  stateLabel?: string
  town?: string
  country?: string
}

interface BoondProject {
  id: number
  title?: string
  reference?: string
  startDate?: string
  endDate?: string
  state?: number
}

interface FullProfile {
  user: UserInfo
  linkedProfiles: {
    consultant: ConsultantProfile | null
    candidate: CandidateProfile | null
  }
  boondManager?: {
    currentUser?: Record<string, unknown>
    resource?: BoondResource
    projects?: BoondProject[]
    positionings?: Array<{ id: number; state?: number; creationDate?: string }>
    candidate?: Record<string, unknown>
  } | null
}

interface TimesheetSummary {
  pending: number
  validated: number
  currentMonth: string
}

interface AbsenceSummary {
  pending: number
  approved: number
  remaining: number
}

// Role labels
const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  commercial: 'Commercial',
  sourceur: 'Sourceur',
  rh: 'Ressources Humaines',
  consultant_cdi: 'Consultant CDI',
  freelance: 'Freelance',
  candidat: 'Candidat',
  consultant: 'Consultant'
}

// Candidate state colors
const CANDIDATE_STATE_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-700',
  1: 'bg-slate-100 text-slate-700',
  2: 'bg-cyan-100 text-cyan-700',
  3: 'bg-purple-100 text-purple-700',
  4: 'bg-amber-100 text-amber-700',
  5: 'bg-blue-100 text-blue-700',
  6: 'bg-green-100 text-green-700',
  7: 'bg-red-100 text-red-700',
  8: 'bg-gray-100 text-gray-700'
}

export default function FreelancePortalPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [timesheetSummary, setTimesheetSummary] = useState<TimesheetSummary>({
    pending: 0,
    validated: 0,
    currentMonth: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  })
  const [absenceSummary, setAbsenceSummary] = useState<AbsenceSummary>({
    pending: 0,
    approved: 0,
    remaining: 25
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch full user profile
        const profileRes = await fetch('/api/user/profile', { credentials: 'include' })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.success) {
            setProfile(profileData.profile)
            setUser(profileData.profile.user)
          }
        }

        // Fallback to basic user info if profile fetch fails
        if (!user) {
          const userRes = await fetch('/api/auth/me', { credentials: 'include' })
          if (userRes.ok) {
            const userData = await userRes.json()
            setUser(userData.user)
          }
        }

        // If user has BoondManager ID, fetch their CRA/absence data
        const currentUser = profile?.user || user
        if (currentUser?.boondManagerId) {
          // Fetch timesheet summary
          const timesheetRes = await fetch('/api/freelance/timesheets/summary', { credentials: 'include' })
          if (timesheetRes.ok) {
            const timesheetData = await timesheetRes.json()
            setTimesheetSummary(timesheetData)
          }

          // Fetch absence summary
          const absenceRes = await fetch('/api/freelance/absences/summary', { credentials: 'include' })
          if (absenceRes.ok) {
            const absenceData = await absenceRes.json()
            setAbsenceSummary(absenceData)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cards = [
    {
      title: 'Mes CRA',
      description: 'Saisissez et soumettez vos comptes rendus d\'activité',
      icon: Clock,
      href: '/admin/freelance/timesheets',
      color: 'from-blue-500 to-indigo-500',
      stats: [
        { label: 'En attente', value: timesheetSummary.pending, icon: AlertCircle },
        { label: 'Validés', value: timesheetSummary.validated, icon: CheckCircle },
      ]
    },
    {
      title: 'Mes Absences',
      description: 'Gérez vos demandes de congés et absences',
      icon: Calendar,
      href: '/admin/freelance/absences',
      color: 'from-purple-500 to-pink-500',
      stats: [
        { label: 'En attente', value: absenceSummary.pending, icon: AlertCircle },
        { label: 'Jours restants', value: absenceSummary.remaining, icon: CheckCircle },
      ]
    },
  ]

  // Get consultant or candidate profile
  const consultantProfile = profile?.linkedProfiles?.consultant
  const candidateProfile = profile?.linkedProfiles?.candidate
  const boondResource = profile?.boondManager?.resource
  const boondProjects = profile?.boondManager?.projects || []
  const isCandidate = user?.role === 'candidat'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ebmc-turquoise"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className={`p-3 rounded-xl bg-gradient-to-r ${isCandidate ? 'from-purple-500 to-pink-500' : 'from-green-500 to-emerald-500'} shadow-lg`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bienvenue, {user?.name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isCandidate ? 'Espace Candidat' : 'Portail Consultant'} EBMC GROUP
            </p>
          </div>
        </motion.div>

        {/* Role badge and BoondManager connection status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl w-fit ${
              isCandidate
                ? 'bg-purple-50 border border-purple-200'
                : 'bg-teal-50 border border-teal-200'
            }`}
          >
            {isCandidate ? <Target className="w-4 h-4 text-purple-600" /> : <Briefcase className="w-4 h-4 text-teal-600" />}
            <span className={`text-sm font-medium ${isCandidate ? 'text-purple-700' : 'text-teal-700'}`}>
              {ROLE_LABELS[user?.role || ''] || user?.role}
            </span>
          </motion.div>

          {/* BoondManager connection status */}
          {user?.boondManagerId ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl w-fit"
            >
              <Building2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                Connecte a BoondManager ({user.boondManagerSubdomain})
              </span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl w-fit"
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                Compte non lie a BoondManager
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Profile Card - Consultant or Candidate */}
      {(consultantProfile || candidateProfile || boondResource) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-ebmc-turquoise" />
            Mon Profil
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Basic Info */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fonction</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {boondResource?.title || consultantProfile?.title || candidateProfile?.title || 'Non renseigne'}
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {boondResource?.town || boondResource?.country || consultantProfile?.location || candidateProfile?.location || 'Non renseigne'}
                </span>
              </div>

              {/* Contact info from BoondManager */}
              {boondResource && (
                <div className="space-y-2">
                  {boondResource.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{boondResource.email}</span>
                    </div>
                  )}
                  {boondResource.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{boondResource.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Candidate state */}
              {isCandidate && candidateProfile && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Statut candidature</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${CANDIDATE_STATE_COLORS[candidateProfile.state] || 'bg-gray-100 text-gray-700'}`}>
                    {candidateProfile.stateLabel}
                  </span>
                </div>
              )}

              {/* Consultant availability */}
              {!isCandidate && (consultantProfile || boondResource) && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Statut</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    boondResource?.state === 2
                      ? 'bg-blue-100 text-blue-700'
                      : consultantProfile?.available || boondResource?.state === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {boondResource?.stateLabel || (consultantProfile?.available ? 'Disponible' : 'Non disponible')}
                  </span>
                </div>
              )}

              {/* Experience */}
              {consultantProfile?.experience && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Experience: {consultantProfile.experience}</span>
                </div>
              )}
            </div>

            {/* Right: Skills & Certifications */}
            <div className="space-y-4">
              {/* Skills */}
              {((consultantProfile?.skills && consultantProfile.skills.length > 0) ||
                (candidateProfile?.skills && candidateProfile.skills.length > 0)) && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Competences</p>
                  <div className="flex flex-wrap gap-2">
                    {(consultantProfile?.skills || candidateProfile?.skills || []).slice(0, 8).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-ebmc-turquoise/10 text-ebmc-turquoise rounded-lg text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {consultantProfile?.certifications && consultantProfile.certifications.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {consultantProfile.certifications.slice(0, 6).map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm flex items-center gap-1"
                      >
                        <Award className="w-3 h-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Projects/Missions */}
      {boondProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-purple-500" />
            Mes Missions
          </h2>
          <div className="space-y-3">
            {boondProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{project.title || 'Mission sans titre'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {project.reference && <span className="mr-3">Ref: {project.reference}</span>}
                    {project.startDate && <span>Du {new Date(project.startDate).toLocaleDateString('fr-FR')}</span>}
                    {project.endDate && <span> au {new Date(project.endDate).toLocaleDateString('fr-FR')}</span>}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.state === 1 ? 'bg-blue-100 text-blue-700' :
                  project.state === 2 ? 'bg-green-100 text-green-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {project.state === 0 ? 'En preparation' :
                   project.state === 1 ? 'En cours' :
                   project.state === 2 ? 'Termine' : 'Annule'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Stats - Only show for consultants, not candidates */}
      {!isCandidate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-ebmc-turquoise to-cyan-500 rounded-2xl p-6 mb-8 text-white"
        >
          <h2 className="text-lg font-semibold mb-4 opacity-90">Resume du mois - {timesheetSummary.currentMonth}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80">CRA en attente</p>
              <p className="text-3xl font-bold">{timesheetSummary.pending}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80">CRA valides</p>
              <p className="text-3xl font-bold">{timesheetSummary.validated}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80">Absences en attente</p>
              <p className="text-3xl font-bold">{absenceSummary.pending}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80">Jours de conges</p>
              <p className="text-3xl font-bold">{absenceSummary.remaining}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Candidate Status Card */}
      {isCandidate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-8 text-white"
        >
          <h2 className="text-lg font-semibold mb-4 opacity-90">Votre Candidature</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80">Statut actuel</p>
              <p className="text-xl font-bold">{candidateProfile?.stateLabel || 'En cours'}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80">Profil complete</p>
              <p className="text-xl font-bold">
                {((candidateProfile?.skills?.length || 0) > 0 && candidateProfile?.title) ? 'Oui' : 'A completer'}
              </p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80">Prochaine etape</p>
              <p className="text-xl font-bold">
                {candidateProfile?.state === 4 ? 'Entretien' :
                 candidateProfile?.state === 5 ? 'Proposition' :
                 candidateProfile?.state === 6 ? 'Embauche !' : 'En attente'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Link href={card.href}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-ebmc-turquoise group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{card.description}</p>

                <div className="flex gap-4">
                  {card.stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <stat.icon className={`w-4 h-4 ${stat.label.includes('attente') ? 'text-amber-500' : 'text-green-500'}`} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">{stat.value}</span> {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gray-50 dark:bg-slate-800 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Besoin d&apos;aide ?</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Pour toute question concernant vos CRA ou vos absences, contactez votre gestionnaire RH ou envoyez un email à{' '}
          <a href="mailto:rh@ebmcgroup.eu" className="text-ebmc-turquoise hover:underline">
            rh@ebmcgroup.eu
          </a>
        </p>
      </motion.div>
    </div>
  )
}
