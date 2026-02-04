import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { DashboardClient } from "./dashboard-client"

const sql = neon(process.env.DATABASE_URL!)

export default async function DashboardPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "customer") {
    redirect("/")
  }

  // Get user's transactions
  const deposits = await sql`
    SELECT * FROM deposits 
    WHERE user_id = ${user.id} 
    ORDER BY created_at DESC 
    LIMIT 10
  `

  const withdrawals = await sql`
    SELECT * FROM withdrawals 
    WHERE user_id = ${user.id} 
    ORDER BY created_at DESC 
    LIMIT 10
  `

  // Get products
  const products = await sql`
    SELECT * FROM products 
    WHERE is_active = true 
    ORDER BY name
  `

  // Get system banks
  const systemBanks = await sql`
    SELECT * FROM system_banks 
    WHERE is_active = true
  `

  return (
    <DashboardClient 
      user={user} 
      deposits={deposits} 
      withdrawals={withdrawals}
      products={products}
      systemBanks={systemBanks}
    />
  )
}
