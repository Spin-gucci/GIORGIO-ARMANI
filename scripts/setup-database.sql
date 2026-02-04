-- Create users table for system users (master, admin, agent)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  parent_id VARCHAR,
  created_by VARCHAR,
  invitation_code TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create members table for customers
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT 'password123',
  phone TEXT,
  balance INTEGER NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  lock_reason TEXT,
  withdrawal_locked BOOLEAN NOT NULL DEFAULT false,
  withdrawal_lock_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_agent_id VARCHAR,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  credit_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id VARCHAR NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  proof_url TEXT,
  processed_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id VARCHAR NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  processed_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id VARCHAR NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  member_id VARCHAR,
  user_id VARCHAR,
  user_role TEXT,
  user_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create system_banks table
CREATE TABLE IF NOT EXISTS system_banks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  rating INTEGER NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed initial data

-- Insert master user
INSERT INTO users (id, username, password, name, email, role, is_active)
VALUES ('user-master-1', 'master@system.com', 'master123', 'Super Admin', 'master@system.com', 'master', true)
ON CONFLICT (username) DO NOTHING;

-- Insert admin user
INSERT INTO users (id, username, password, name, email, role, parent_id, created_by, is_active)
VALUES ('user-admin-1', 'admin@system.com', 'admin123', 'Administrator', 'admin@system.com', 'admin', 'user-master-1', 'user-master-1', true)
ON CONFLICT (username) DO NOTHING;

-- Insert agent user with invitation code
INSERT INTO users (id, username, password, name, email, phone, role, parent_id, created_by, invitation_code, is_active)
VALUES ('user-agent-1', 'agent@system.com', 'agent123', 'Agen Cahaya', 'agent@system.com', '+6281234567001', 'agent', 'user-admin-1', 'user-admin-1', 'CAHAYA001', true)
ON CONFLICT (username) DO NOTHING;

-- Insert second agent
INSERT INTO users (id, username, password, name, email, phone, role, parent_id, created_by, invitation_code, is_active)
VALUES ('user-agent-2', 'agent2@system.com', 'agent123', 'Agen Bintang', 'agent2@system.com', '+6281234567002', 'agent', 'user-admin-1', 'user-admin-1', 'BINTANG02', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample member
INSERT INTO members (id, name, email, password, phone, balance, status, assigned_agent_id, bank_name, bank_account_number, bank_account_name)
VALUES ('m1', 'Ahmad Rizki', 'ahmad.rizki@email.com', 'password123', '+6281234567890', 2500000, 'active', 'user-agent-1', 'BCA', '1234567890', 'Ahmad Rizki')
ON CONFLICT (email) DO NOTHING;

-- Insert sample system banks
INSERT INTO system_banks (id, bank_name, account_number, account_name, is_active, created_by)
VALUES 
  ('sb1', 'BCA', '1234567890', 'PT Koperasi Sejahtera', true, 'user-master-1'),
  ('sb2', 'BNI', '0987654321', 'PT Koperasi Sejahtera', true, 'user-master-1'),
  ('sb3', 'Mandiri', '1122334455', 'PT Koperasi Sejahtera', true, 'user-admin-1')
ON CONFLICT DO NOTHING;
