import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password diperlukan' }, { status: 400 })
    }

    const users = await sql`SELECT * FROM users WHERE username = ${username}`
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Akun Anda tidak aktif' }, { status: 403 })
    }

    // Create session token
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `

    const cookieStore = await cookies()
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Login berhasil'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
