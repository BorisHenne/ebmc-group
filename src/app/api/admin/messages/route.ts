import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const messages = await getCollection('messages')
    const allMessages = await messages.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ messages: allMessages })
  } catch (error) {
    console.error('Messages error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
