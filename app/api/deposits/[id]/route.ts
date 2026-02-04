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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user || !['master', 'admin', 'agent'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get deposit
    const deposits = await sql`SELECT * FROM deposits WHERE id = ${id}`
    if (deposits.length === 0) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    const deposit = deposits[0]

    if (deposit.status !== 'pending') {
      return NextResponse.json({ error: 'Deposit sudah diproses' }, { status: 400 })
    }

    // Update deposit status
    await sql`UPDATE deposits SET status = ${status}, processed_by = ${user.id}, processed_at = NOW() WHERE id = ${id}`

    // If approved, add balance to user
    if (status === 'approved') {
      await sql`UPDATE users SET balance = balance + ${deposit.amount} WHERE id = ${deposit.user_id}`
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update deposit error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
