import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    // Get user from database to get full details including name
    const users = await getCollection('users')
    const user = await users.findOne({ _id: new ObjectId(session.userId) })

    // Base user info
    const userInfo = {
      id: session.userId,
      email: session.email,
      role: user?.role || session.role,
      name: user?.name || session.name || 'Utilisateur',
      boondManagerId: user?.boondManagerId,
      boondManagerSubdomain: user?.boondManagerSubdomain,
      authProvider: user?.authProvider
    }

    // If user has boondManagerId, fetch their linked profiles
    let consultantProfile = null
    let candidateProfile = null
    let resourceProfile = null

    if (user?.boondManagerId) {
      // Check if user is linked to a consultant profile
      const consultants = await getCollection('consultants')
      consultantProfile = await consultants.findOne({ boondManagerId: user.boondManagerId })

      // Check if user is linked to a candidate profile
      const candidates = await getCollection('candidates')
      candidateProfile = await candidates.findOne({ boondManagerId: user.boondManagerId })
    }

    // Also try to find by email if no boondManagerId match
    if (!consultantProfile && !candidateProfile && user?.email) {
      const consultants = await getCollection('consultants')
      consultantProfile = await consultants.findOne({ email: user.email })

      const candidates = await getCollection('candidates')
      candidateProfile = await candidates.findOne({ email: user.email })

      // If found by email, link the boondManagerId to the user
      if (user && (consultantProfile?.boondManagerId || candidateProfile?.boondManagerId)) {
        const linkedBoondId = consultantProfile?.boondManagerId || candidateProfile?.boondManagerId
        await users.updateOne(
          { _id: user._id },
          { $set: { boondManagerId: linkedBoondId } }
        )
        userInfo.boondManagerId = linkedBoondId
      }
    }

    // Auto-detect and update role based on linked profile
    if (user && consultantProfile && !['admin', 'commercial', 'sourceur', 'rh'].includes(userInfo.role)) {
      // User is a consultant - determine if CDI or freelance
      const contractType = consultantProfile.contractType || 'freelance'
      const newRole = contractType === 'cdi' ? 'consultant_cdi' : 'freelance'

      if (userInfo.role !== newRole) {
        await users.updateOne(
          { _id: user._id },
          { $set: { role: newRole } }
        )
        userInfo.role = newRole
      }

      resourceProfile = {
        id: consultantProfile._id?.toString(),
        boondManagerId: consultantProfile.boondManagerId,
        name: consultantProfile.name,
        title: consultantProfile.title,
        location: consultantProfile.location,
        experience: consultantProfile.experience,
        skills: consultantProfile.skills || [],
        certifications: consultantProfile.certifications || [],
        available: consultantProfile.available,
        category: consultantProfile.category
      }
    } else if (user && candidateProfile && !consultantProfile && !['admin', 'commercial', 'sourceur', 'rh'].includes(userInfo.role)) {
      // User is a candidate in the recruitment pipeline
      if (userInfo.role !== 'candidat') {
        await users.updateOne(
          { _id: user._id },
          { $set: { role: 'candidat' } }
        )
        userInfo.role = 'candidat'
      }
    }

    return NextResponse.json({
      user: userInfo,
      profile: {
        consultant: resourceProfile,
        candidate: candidateProfile ? {
          id: candidateProfile._id?.toString(),
          boondManagerId: candidateProfile.boondManagerId,
          firstName: candidateProfile.firstName,
          lastName: candidateProfile.lastName,
          title: candidateProfile.title,
          state: candidateProfile.state,
          stateLabel: candidateProfile.stateLabel,
          location: candidateProfile.location,
          skills: candidateProfile.skills || []
        } : null
      }
    })
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    // Fallback to session data if DB fails
    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        name: session.name || 'Utilisateur'
      },
      profile: {
        consultant: null,
        candidate: null
      }
    })
  }
}
