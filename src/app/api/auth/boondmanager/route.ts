import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createToken } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

// BoondManager API authentication
// Documentation: https://doc.boondmanager.com/api-externe/

interface BoondManagerUser {
  data: {
    id: number
    attributes: {
      firstName: string
      lastName: string
      email: string
      civility: string
      state: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, subdomain } = await request.json()

    if (!email || !password || !subdomain) {
      return NextResponse.json(
        { error: 'Email, mot de passe et sous-domaine requis' },
        { status: 400 }
      )
    }

    // Clean subdomain (remove .boondmanager.com if provided)
    const cleanSubdomain = subdomain
      .replace('.boondmanager.com', '')
      .replace('https://', '')
      .replace('http://', '')
      .trim()

    // BoondManager API URL
    const boondApiUrl = `https://${cleanSubdomain}.boondmanager.com/api`

    // Basic Auth header
    const basicAuth = Buffer.from(`${email}:${password}`).toString('base64')

    // Validate credentials by fetching current user from BoondManager
    const response = await fetch(`${boondApiUrl}/application/current-user`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Identifiants BoondManager incorrects' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: 'Erreur de connexion à BoondManager' },
        { status: response.status }
      )
    }

    const boondUser: BoondManagerUser = await response.json()

    // Extract user info
    const firstName = boondUser.data?.attributes?.firstName || ''
    const lastName = boondUser.data?.attributes?.lastName || ''
    const boondEmail = boondUser.data?.attributes?.email || email
    const boondId = boondUser.data?.id
    const fullName = `${firstName} ${lastName}`.trim() || email

    // Find or create user in our database
    const users = await getCollection('users')
    let user = await users.findOne({
      $or: [
        { email: boondEmail },
        { boondManagerId: boondId }
      ]
    })

    if (!user) {
      // Create new user from BoondManager
      const result = await users.insertOne({
        email: boondEmail,
        name: fullName,
        role: 'consultant', // Default role for BoondManager users (internal consultants)
        boondManagerId: boondId,
        boondManagerSubdomain: cleanSubdomain,
        authProvider: 'boondmanager',
        createdAt: new Date(),
        lastLogin: new Date()
      })
      user = { _id: result.insertedId, email: boondEmail, name: fullName, role: 'consultant' }
    } else {
      // Update last login and boond info
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            lastLogin: new Date(),
            boondManagerSubdomain: cleanSubdomain,
            boondManagerId: boondId,
            name: fullName
          }
        }
      )
    }

    // Create session token
    const token = await createToken(
      user._id.toString(),
      boondEmail,
      user.role || 'consultant',
      user.name || `${boondUser.data.attributes.firstName} ${boondUser.data.attributes.lastName}`
    )

    // Set cookies
    const cookieStore = await cookies()

    // Main auth token
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    // BoondManager API token (for subsequent API calls)
    cookieStore.set('boond-token', basicAuth, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    // BoondManager subdomain
    cookieStore.set('boond-subdomain', cleanSubdomain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: boondEmail,
        name: fullName,
        role: user.role || 'consultant',
        authProvider: 'boondmanager',
        boondManagerId: boondId
      }
    })

  } catch (error) {
    console.error('BoondManager auth error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion BoondManager' },
      { status: 500 }
    )
  }
}
