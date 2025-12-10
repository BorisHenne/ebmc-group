import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// State labels for display
const CANDIDATE_STATES: Record<number, string> = {
  0: 'Nouveau',
  1: 'A qualifier',
  2: 'Qualifie',
  3: 'En cours',
  4: 'Entretien',
  5: 'Proposition',
  6: 'Embauche',
  7: 'Refuse',
  8: 'Archive'
}

const RESOURCE_STATES: Record<number, string> = {
  0: 'Non defini',
  1: 'Disponible',
  2: 'En mission',
  3: 'Intercontrat',
  4: 'Indisponible',
  5: 'Sorti'
}

/**
 * GET /api/user/profile
 * Returns the current user's full profile with linked BoondManager data
 * Fetches real-time data from BoondManager API if user is connected
 */
export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  }

  try {
    const users = await getCollection('users')
    const user = await users.findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 })
    }

    // Get linked profiles from MongoDB
    const consultants = await getCollection('consultants')
    const candidates = await getCollection('candidates')

    let consultantProfile = null
    let candidateProfile = null

    if (user.boondManagerId) {
      consultantProfile = await consultants.findOne({ boondManagerId: user.boondManagerId })
      candidateProfile = await candidates.findOne({ boondManagerId: user.boondManagerId })
    }

    // Also try by email
    if (!consultantProfile && !candidateProfile && user.email) {
      consultantProfile = await consultants.findOne({ email: user.email })
      candidateProfile = await candidates.findOne({ email: user.email })
    }

    // Try to fetch real-time data from BoondManager if connected
    let boondData: {
      currentUser?: Record<string, unknown>
      resource?: Record<string, unknown>
      projects?: Array<Record<string, unknown>>
      positionings?: Array<Record<string, unknown>>
      candidate?: Record<string, unknown>
    } | null = null
    const cookieStore = await cookies()
    const boondToken = cookieStore.get('boond-token')?.value
    const boondSubdomain = cookieStore.get('boond-subdomain')?.value || user.boondManagerSubdomain

    if (boondToken && boondSubdomain && user.boondManagerId) {
      try {
        // Fetch current user data from BoondManager
        const boondApiUrl = `https://${boondSubdomain}.boondmanager.com/api`

        const currentUserRes = await fetch(`${boondApiUrl}/application/current-user`, {
          headers: {
            'Authorization': `Basic ${boondToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (currentUserRes.ok) {
          const currentUser = await currentUserRes.json()
          boondData = {
            currentUser: {
              id: currentUser.data?.id,
              firstName: currentUser.data?.attributes?.firstName,
              lastName: currentUser.data?.attributes?.lastName,
              email: currentUser.data?.attributes?.email,
              state: currentUser.data?.attributes?.state
            }
          }

          // Try to fetch resource data (if user is a resource/consultant)
          try {
            const resourceRes = await fetch(`${boondApiUrl}/resources/${user.boondManagerId}`, {
              headers: {
                'Authorization': `Basic ${boondToken}`,
                'Content-Type': 'application/json'
              }
            })

            if (resourceRes.ok) {
              const resourceData = await resourceRes.json()
              const attrs = resourceData.data?.attributes || {}

              boondData.resource = {
                id: resourceData.data?.id,
                firstName: attrs.firstName,
                lastName: attrs.lastName,
                title: attrs.title,
                email: attrs.email,
                phone: attrs.phone1,
                state: attrs.state,
                stateLabel: RESOURCE_STATES[attrs.state] || 'Inconnu',
                town: attrs.town,
                country: attrs.country,
                agency: resourceData.data?.relationships?.agency?.data?.id,
                manager: resourceData.data?.relationships?.manager?.data?.id
              }

              // Fetch active projects/missions
              const projectsRes = await fetch(`${boondApiUrl}/resources/${user.boondManagerId}/projects?maxResults=10`, {
                headers: {
                  'Authorization': `Basic ${boondToken}`,
                  'Content-Type': 'application/json'
                }
              })

              if (projectsRes.ok) {
                const projectsData = await projectsRes.json()
                boondData.projects = (projectsData.data || []).map((p: { id: number; attributes: Record<string, unknown> }) => ({
                  id: p.id,
                  title: p.attributes?.title,
                  reference: p.attributes?.reference,
                  startDate: p.attributes?.startDate,
                  endDate: p.attributes?.endDate,
                  state: p.attributes?.state
                }))
              }

              // Fetch positionings (job applications)
              const positioningsRes = await fetch(`${boondApiUrl}/resources/${user.boondManagerId}/positionings?maxResults=10`, {
                headers: {
                  'Authorization': `Basic ${boondToken}`,
                  'Content-Type': 'application/json'
                }
              })

              if (positioningsRes.ok) {
                const positioningsData = await positioningsRes.json()
                boondData.positionings = (positioningsData.data || []).map((p: { id: number; attributes: Record<string, unknown> }) => ({
                  id: p.id,
                  state: p.attributes?.state,
                  creationDate: p.attributes?.creationDate
                }))
              }
            }
          } catch (resourceError) {
            console.error('Error fetching resource data:', resourceError)
          }

          // Try to fetch candidate data (if user is a candidate)
          if (!boondData.resource && candidateProfile?.boondManagerId) {
            try {
              const candidateRes = await fetch(`${boondApiUrl}/candidates/${candidateProfile.boondManagerId}`, {
                headers: {
                  'Authorization': `Basic ${boondToken}`,
                  'Content-Type': 'application/json'
                }
              })

              if (candidateRes.ok) {
                const candidateData = await candidateRes.json()
                const attrs = candidateData.data?.attributes || {}

                boondData.candidate = {
                  id: candidateData.data?.id,
                  firstName: attrs.firstName,
                  lastName: attrs.lastName,
                  title: attrs.title,
                  email: attrs.email,
                  phone: attrs.phone1,
                  state: attrs.state,
                  stateLabel: CANDIDATE_STATES[attrs.state] || 'Inconnu',
                  town: attrs.town,
                  country: attrs.country
                }
              }
            } catch (candidateError) {
              console.error('Error fetching candidate data:', candidateError)
            }
          }
        }
      } catch (boondError) {
        console.error('Error fetching BoondManager data:', boondError)
      }
    }

    // Build profile response
    const profile = {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        boondManagerId: user.boondManagerId,
        boondManagerSubdomain: user.boondManagerSubdomain,
        authProvider: user.authProvider,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      linkedProfiles: {
        consultant: consultantProfile ? {
          id: consultantProfile._id.toString(),
          boondManagerId: consultantProfile.boondManagerId,
          name: consultantProfile.name,
          title: consultantProfile.title,
          location: consultantProfile.location,
          experience: consultantProfile.experience,
          skills: consultantProfile.skills || [],
          certifications: consultantProfile.certifications || [],
          available: consultantProfile.available,
          category: consultantProfile.category
        } : null,
        candidate: candidateProfile ? {
          id: candidateProfile._id.toString(),
          boondManagerId: candidateProfile.boondManagerId,
          firstName: candidateProfile.firstName,
          lastName: candidateProfile.lastName,
          title: candidateProfile.title,
          state: candidateProfile.state,
          stateLabel: candidateProfile.stateLabel || CANDIDATE_STATES[candidateProfile.state] || 'Inconnu',
          location: candidateProfile.location,
          skills: candidateProfile.skills || []
        } : null
      },
      boondManager: boondData
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Error in /api/user/profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation du profil' },
      { status: 500 }
    )
  }
}
