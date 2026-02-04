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
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let deposits
    if (user.role === 'customer') {
      deposits = await sql`
        SELECT d.*, u.username, u.full_name 
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        WHERE d.user_id = ${user.id}
        ORDER BY d.created_at DESC
      `
    } else {
      deposits = await sql`
        SELECT d.*, u.username, u.full_name 
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        ORDER BY d.created_at DESC
      `
    }

    return NextResponse.json(deposits)
  } catch (error) {
    console.error('Get deposits error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, bankId } = await request.json()

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: 'Minimal deposit Rp 10.000' }, { status: 400 })
    }

    if (!bankId) {
      return NextResponse.json({ error: 'Pilih bank tujuan' }, { status: 400 })
    }

    const deposit = await sql`
      INSERT INTO deposits (user_id, amount, bank_id, status)
      VALUES (${user.id}, ${amount}, ${bankId}, 'pending')
      RETURNING *
    `

    return NextResponse.json(deposit[0])
  } catch (error) {
    console.error('Create deposit error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
