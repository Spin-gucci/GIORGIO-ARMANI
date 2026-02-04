import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null })
    }

    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.username, u.full_name, u.role, u.is_active, u.balance, u.phone, u.created_at as user_created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      cookieStore.delete('session')
      return NextResponse.json({ user: null })
    }

    const session = sessions[0]
    
    return NextResponse.json({
      user: {
        id: session.user_id,
        username: session.username,
        fullName: session.full_name,
        role: session.role,
        isActive: session.is_active,
        balance: session.balance,
        phone: session.phone,
        createdAt: session.user_created_at
      }
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null })
  }
}
