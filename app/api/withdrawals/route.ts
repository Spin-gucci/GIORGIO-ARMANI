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

    let withdrawals
    if (user.role === 'customer') {
      withdrawals = await sql`
        SELECT w.*, u.username, u.full_name 
        FROM withdrawals w
        JOIN users u ON w.user_id = u.id
        WHERE w.user_id = ${user.id}
        ORDER BY w.created_at DESC
      `
    } else {
      withdrawals = await sql`
        SELECT w.*, u.username, u.full_name 
        FROM withdrawals w
        JOIN users u ON w.user_id = u.id
        ORDER BY w.created_at DESC
      `
    }

    return NextResponse.json(withdrawals)
  } catch (error) {
    console.error('Get withdrawals error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, bankName, accountNumber, accountName } = await request.json()

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: 'Minimal penarikan Rp 10.000' }, { status: 400 })
    }

    const balance = parseFloat(user.balance)
    if (amount > balance) {
      return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 400 })
    }

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: 'Lengkapi semua data bank' }, { status: 400 })
    }

    const withdrawal = await sql`
      INSERT INTO withdrawals (user_id, amount, bank_name, account_number, account_name, status)
      VALUES (${user.id}, ${amount}, ${bankName}, ${accountNumber}, ${accountName}, 'pending')
      RETURNING *
    `

    return NextResponse.json(withdrawal[0])
  } catch (error) {
    console.error('Create withdrawal error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
