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
    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`
    return NextResponse.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user || !['master', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, price, description } = await request.json()

    if (!name || !price) {
      return NextResponse.json({ error: 'Name dan price harus diisi' }, { status: 400 })
    }

    const product = await sql`
      INSERT INTO products (name, price, description)
      VALUES (${name}, ${price}, ${description || null})
      RETURNING *
    `

    return NextResponse.json(product[0])
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
