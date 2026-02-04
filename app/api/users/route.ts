import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)

async function getUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) return null

  const sessions = await sql`
    SELECT u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
  `

  return sessions.length > 0 ? sessions[0] : null
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user || !['master', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await sql`
      SELECT id, username, full_name, role, is_active, balance, phone, created_at
      FROM users 
      ORDER BY created_at DESC
    `

    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user || !['master', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, password, fullName, role, phone } = await request.json()

    if (!username || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    // Check existing username
    const existing = await sql`SELECT id FROM users WHERE username = ${username}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    // Only master can create admin
    if (role === 'admin' && user.role !== 'master') {
      return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await sql`
      INSERT INTO users (username, password, full_name, role, phone)
      VALUES (${username}, ${hashedPassword}, ${fullName}, ${role}, ${phone || null})
      RETURNING id, username, full_name, role, is_active, balance, phone, created_at
    `

    return NextResponse.json(newUser[0])
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
