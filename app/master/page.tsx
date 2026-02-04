import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { MasterDashboard } from "./master-dashboard"

const sql = neon(process.env.DATABASE_URL!)

export default async function MasterPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "master") {
    redirect("/")
  }

  // Get all users
  const users = await sql`
    SELECT id, username, full_name, role, is_active, balance, phone, created_at
    FROM users 
    ORDER BY created_at DESC
  `

  // Get all deposits
  const deposits = await sql`
    SELECT d.*, u.username, u.full_name
    FROM deposits d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC
    LIMIT 50
  `

  // Get all withdrawals
  const withdrawals = await sql`
    SELECT w.*, u.username, u.full_name
    FROM withdrawals w
    JOIN users u ON w.user_id = u.id
    ORDER BY w.created_at DESC
    LIMIT 50
  `

  // Get products
  const products = await sql`SELECT * FROM products ORDER BY created_at DESC`

  // Get system banks
  const systemBanks = await sql`SELECT * FROM system_banks ORDER BY created_at DESC`

  // Get stats
  const stats = await sql`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
      (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
      (SELECT COUNT(*) FROM users WHERE role = 'agent') as total_agents,
      (SELECT COALESCE(SUM(amount), 0) FROM deposits WHERE status = 'approved') as total_deposits,
      (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE status = 'approved') as total_withdrawals,
      (SELECT COUNT(*) FROM deposits WHERE status = 'pending') as pending_deposits,
      (SELECT COUNT(*) FROM withdrawals WHERE status = 'pending') as pending_withdrawals
  `

  return (
    <MasterDashboard 
      user={user}
      users={users}
      deposits={deposits}
      withdrawals={withdrawals}
      products={products}
      systemBanks={systemBanks}
      stats={stats[0]}
    />
  )
}
