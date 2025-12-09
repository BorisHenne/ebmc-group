import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { getCollection } from './mongodb'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export interface User {
  _id?: string
  email: string
  password: string
  name: string
  role: 'admin' | 'sourceur' | 'commercial' | 'consultant' | 'freelance'
  createdAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: string, email: string, role: string, name: string): Promise<string> {
  return new SignJWT({ userId, email, role, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; email: string; role: string; name?: string }
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) return null

  return verifyToken(token)
}

export async function createUser(email: string, password: string, name: string, role: 'admin' | 'sourceur' | 'commercial' | 'consultant' | 'freelance' = 'consultant') {
  const users = await getCollection('users')

  const existingUser = await users.findOne({ email })
  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà')
  }

  const hashedPassword = await hashPassword(password)

  const result = await users.insertOne({
    email,
    password: hashedPassword,
    name,
    role,
    createdAt: new Date()
  })

  return result.insertedId
}

export async function findUserByEmail(email: string) {
  const users = await getCollection('users')
  return users.findOne({ email })
}

export async function initAdminUser() {
  const users = await getCollection('users')
  const adminExists = await users.findOne({ role: 'admin' })

  if (!adminExists) {
    await createUser(
      'admin@ebmc-group.com',
      'admin123',
      'Administrateur',
      'admin'
    )
    console.log('Admin user created: admin@ebmc-group.com / admin123')
  }
}
