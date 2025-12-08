import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const users = await getCollection('users')
    const messages = await getCollection('messages')

    const usersCount = await users.countDocuments()
    const messagesCount = await messages.countDocuments()

    return NextResponse.json({
      users: usersCount,
      messages: messagesCount,
      visits: 0 // À implémenter avec analytics
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
