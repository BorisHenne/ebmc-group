import { NextRequest, NextResponse } from 'next/server'
import { getSession, createUser } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const users = await getCollection('users')
    const allUsers = await users.find({}, { projection: { password: 0 } }).toArray()

    return NextResponse.json({ users: allUsers })
  } catch (error) {
    console.error('Users error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { email, password, name, role } = await request.json()

    await createUser(email, password, name, role)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
