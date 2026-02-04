import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (sessionToken) {
      await sql`DELETE FROM sessions WHERE token = ${sessionToken}`
    }

    cookieStore.delete('session')

    return NextResponse.json({ message: 'Logout berhasil' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
