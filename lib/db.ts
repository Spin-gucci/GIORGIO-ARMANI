import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Types
export type UserRole = 'master' | 'admin' | 'agent' | 'customer'

export interface User {
  id: string
  username: string
  password: string
  name: string
  email: string | null
  phone: string | null
  role: UserRole
  parent_id: string | null
  created_by: string | null
  invitation_code: string | null
  is_active: boolean
  created_at: Date
}

export interface Member {
  id: string
  name: string
  email: string
  password: string
  phone: string | null
  balance: number
  is_locked: boolean
  lock_reason: string | null
  withdrawal_locked: boolean
  withdrawal_lock_reason: string | null
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  assigned_agent_id: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  credit_score: number
  created_at: Date
}

export interface Deposit {
  id: string
  member_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  proof_url: string | null
  processed_by: string | null
  created_at: Date
  processed_at: Date | null
}

export interface Withdrawal {
  id: string
  member_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  bank_name: string | null
  account_number: string | null
  account_name: string | null
  processed_by: string | null
  created_at: Date
  processed_at: Date | null
}

export interface Notification {
  id: string
  member_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  created_at: Date
}

export interface ActivityLog {
  id: string
  action: string
  description: string
  member_id: string | null
  user_id: string | null
  user_role: string | null
  user_name: string | null
  created_at: Date
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  image_url: string | null
  rating: number
  reviews: number
  is_active: boolean
  created_by: string | null
  created_at: Date
}

export interface SystemBank {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  is_active: boolean
  created_by: string | null
  created_at: Date
}
