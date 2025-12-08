import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { randomBytes } from 'crypto'

function generateToken(): string {
  return `ebmc_${randomBytes(32).toString('hex')}`
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const tokens = await getCollection('apiTokens')
    const allTokens = await tokens.find({}).toArray()

    // Mask tokens for display
    const maskedTokens = allTokens.map(t => ({
      ...t,
      token: t.token.substring(0, 10) + '...' + t.token.substring(t.token.length - 4)
    }))

    return NextResponse.json({ tokens: maskedTokens })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { name, permissions, expiresIn } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }

    const token = generateToken()
    const tokens = await getCollection('apiTokens')

    let expiresAt = null
    if (expiresIn) {
      const days = parseInt(expiresIn)
      if (!isNaN(days)) {
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      }
    }

    const result = await tokens.insertOne({
      name,
      token,
      permissions: permissions || ['read'],
      expiresAt,
      createdAt: new Date(),
      createdBy: session.email,
      lastUsedAt: null,
      usageCount: 0
    })

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      token // Return full token only once at creation
    })
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
