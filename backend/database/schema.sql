-- ============================================================================
-- VLSI Insights Database Schema Migration: Orders & Payments
-- Run this script in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- 1. Table: orders (Stores course purchase records and payment references)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,                       -- Razorpay Order ID (e.g. order_xxx or order_sim_xxx)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,           -- Snapshot of purchased cart items
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  promo_code TEXT,
  status TEXT NOT NULL DEFAULT 'created',              -- 'created', 'paid', 'failed', 'refunded'
  payment_id TEXT,                                    -- Razorpay Payment ID upon capture
  signature TEXT,                                     -- Cryptographic verification token
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Index for fast lookup by order_id and user_id
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 2. Row Level Security for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view only their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
ON orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Deny public inserts/updates directly from client (only service_role backend can write)
DROP POLICY IF EXISTS "Service role manages orders" ON orders;
CREATE POLICY "Service role manages orders"
ON orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- 3. Table: user_enrollments (Tracks active course access granted to users)
CREATE TABLE IF NOT EXISTS user_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  order_id TEXT REFERENCES orders(order_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',               -- 'active', 'completed', 'expired'
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, program_id)
);

ALTER TABLE user_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON user_enrollments;
CREATE POLICY "Users can view own enrollments"
ON user_enrollments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages enrollments" ON user_enrollments;
CREATE POLICY "Service role manages enrollments"
ON user_enrollments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
