import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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
    const banks = await sql`SELECT * FROM system_banks WHERE is_active = true ORDER BY created_at DESC`
    return NextResponse.json(banks)
  } catch (error) {
    console.error('Get banks error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user || !['master', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bankName, accountNumber, accountName } = await request.json()

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    const bank = await sql`
      INSERT INTO system_banks (bank_name, account_number, account_name)
      VALUES (${bankName}, ${accountNumber}, ${accountName})
      RETURNING *
    `

    return NextResponse.json(bank[0])
  } catch (error) {
    console.error('Create bank error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
