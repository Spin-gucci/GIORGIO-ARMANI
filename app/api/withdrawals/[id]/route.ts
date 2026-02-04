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

    // Get withdrawal
    const withdrawals = await sql`SELECT * FROM withdrawals WHERE id = ${id}`
    if (withdrawals.length === 0) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    const withdrawal = withdrawals[0]

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Withdrawal sudah diproses' }, { status: 400 })
    }

    // Check balance if approving
    if (status === 'approved') {
      const users = await sql`SELECT balance FROM users WHERE id = ${withdrawal.user_id}`
      const balance = parseFloat(users[0].balance)
      if (balance < parseFloat(withdrawal.amount)) {
        return NextResponse.json({ error: 'Saldo user tidak mencukupi' }, { status: 400 })
      }

      // Deduct balance
      await sql`UPDATE users SET balance = balance - ${withdrawal.amount} WHERE id = ${withdrawal.user_id}`
    }

    // Update withdrawal status
    await sql`UPDATE withdrawals SET status = ${status}, processed_by = ${user.id}, processed_at = NOW() WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update withdrawal error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
