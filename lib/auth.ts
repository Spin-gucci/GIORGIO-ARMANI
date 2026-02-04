import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const sql = neon(process.env.DATABASE_URL!)

export type UserRole = 'master' | 'admin' | 'agent' | 'customer'

export interface User {
  id: number
  username: string
  fullName: string
  role: UserRole
  isActive: boolean
  balance: string
  phone: string | null
  createdAt: string
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return null
    }

    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.username, u.full_name, u.role, u.is_active, u.balance, u.phone, u.created_at as user_created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    const session = sessions[0]
    
    return {
      id: session.user_id,
      username: session.username,
      fullName: session.full_name,
      role: session.role,
      isActive: session.is_active,
      balance: session.balance,
      phone: session.phone,
      createdAt: session.user_created_at
    }
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<User> {
  const user = await getSession()
  
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN')
  }

  return user
}
