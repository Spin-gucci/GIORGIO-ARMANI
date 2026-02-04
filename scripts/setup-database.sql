-- Create users table (for master, admin, agent)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  parent_id UUID,
  created_by UUID,
  invitation_code TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create members table (customers)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  assigned_agent_id UUID,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  credit_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  proof_url TEXT,
  processed_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  processed_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  member_id UUID,
  user_id UUID,
  user_role TEXT,
  user_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  rating INTEGER NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create system_banks table
CREATE TABLE IF NOT EXISTS system_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed master user (only if not exists)
INSERT INTO users (id, username, password, name, email, role, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'master@system.com', 'master123', 'Super Admin', 'master@system.com', 'master', true)
ON CONFLICT (username) DO NOTHING;

-- Seed admin user
INSERT INTO users (id, username, password, name, email, role, parent_id, created_by, is_active)
VALUES ('00000000-0000-0000-0000-000000000002', 'admin@system.com', 'admin123', 'Administrator', 'admin@system.com', 'admin', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (username) DO NOTHING;

-- Seed agent user with invitation code
INSERT INTO users (id, username, password, name, email, phone, role, parent_id, created_by, invitation_code, is_active)
VALUES ('00000000-0000-0000-0000-000000000003', 'agent@system.com', 'agent123', 'Agen Cahaya', 'agent@system.com', '+6281234567001', 'agent', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'CAHAYA001', true)
ON CONFLICT (username) DO NOTHING;

-- Seed sample member
INSERT INTO members (id, name, email, password, phone, balance, status, assigned_agent_id, bank_name, bank_account_number, bank_account_name)
VALUES ('00000000-0000-0000-0000-000000000101', 'Ahmad Rizki', 'ahmad.rizki@email.com', 'password123', '+6281234567890', 2500000, 'active', '00000000-0000-0000-0000-000000000003', 'BCA', '1234567890', 'Ahmad Rizki')
ON CONFLICT (email) DO NOTHING;

-- Seed system banks
INSERT INTO system_banks (bank_name, account_number, account_name, is_active, created_by)
VALUES 
  ('BCA', '1234567890', 'PT Giorgio Armani Indonesia', true, '00000000-0000-0000-0000-000000000001'),
  ('BNI', '0987654321', 'PT Giorgio Armani Indonesia', true, '00000000-0000-0000-0000-000000000001'),
  ('Mandiri', '1122334455', 'PT Giorgio Armani Indonesia', true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Seed products
INSERT INTO products (name, price, category, rating, reviews, is_active, created_by)
VALUES 
  ('Giorgio Armani Acqua di Gio', 1599000, 'Parfum', 48, 120, true, '00000000-0000-0000-0000-000000000001'),
  ('Armani Code', 1899000, 'Parfum', 47, 95, true, '00000000-0000-0000-0000-000000000001'),
  ('Emporio Armani Watch', 5999000, 'Aksesoris', 49, 85, true, '00000000-0000-0000-0000-000000000001'),
  ('Armani Exchange Bag', 3299000, 'Tas', 46, 150, true, '00000000-0000-0000-0000-000000000001'),
  ('Giorgio Armani Sunglasses', 4599000, 'Aksesoris', 48, 78, true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
