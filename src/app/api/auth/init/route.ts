import { NextResponse } from 'next/server'
import { initAdminUser } from '@/lib/auth'

export async function POST() {
  try {
    await initAdminUser()
    return NextResponse.json({ success: true, message: 'Admin initialized' })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation' },
      { status: 500 }
    )
  }
}
