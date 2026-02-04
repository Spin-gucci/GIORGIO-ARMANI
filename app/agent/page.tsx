import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { AgentDashboard } from "./agent-dashboard"

const sql = neon(process.env.DATABASE_URL!)

export default async function AgentPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "agent") {
    redirect("/")
  }

  // Get pending deposits
  const deposits = await sql`
    SELECT d.*, u.username, u.full_name
    FROM deposits d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC
    LIMIT 50
  `

  // Get pending withdrawals
  const withdrawals = await sql`
    SELECT w.*, u.username, u.full_name
    FROM withdrawals w
    JOIN users u ON w.user_id = u.id
    ORDER BY w.created_at DESC
    LIMIT 50
  `

  // Get stats
  const stats = await sql`
    SELECT 
      (SELECT COUNT(*) FROM deposits WHERE status = 'pending') as pending_deposits,
      (SELECT COUNT(*) FROM withdrawals WHERE status = 'pending') as pending_withdrawals
  `

  return (
    <AgentDashboard 
      user={user}
      deposits={deposits}
      withdrawals={withdrawals}
      stats={stats[0]}
    />
  )
}
