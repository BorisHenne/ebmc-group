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

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        name: user?.name || session.name || 'Utilisateur'
      }
    })
  } catch {
    // Fallback to session data if DB fails
    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        name: session.name || 'Utilisateur'
      }
    })
  }
}
