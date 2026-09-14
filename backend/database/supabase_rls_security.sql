-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES FOR VLSI INSIGHTS
-- Run this script in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- 1. Table: contact_submissions (Inquiries, Software Requests, Consultations)
ALTER TABLE IF EXISTS contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated visitors to submit inquiries
DROP POLICY IF EXISTS "Allow anonymous insert on contact_submissions" ON contact_submissions;
CREATE POLICY "Allow anonymous insert on contact_submissions"
ON contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Deny public reading (only service_role / dashboard admin can view student & client PII)
DROP POLICY IF EXISTS "Deny public select on contact_submissions" ON contact_submissions;
CREATE POLICY "Deny public select on contact_submissions"
ON contact_submissions
FOR SELECT
TO service_role
USING (true);

-- 2. Table: enrollment_submissions (Course Applications & Syllabus Downloads)
ALTER TABLE IF EXISTS enrollment_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated visitors to apply for cohorts
DROP POLICY IF EXISTS "Allow anonymous insert on enrollment_submissions" ON enrollment_submissions;
CREATE POLICY "Allow anonymous insert on enrollment_submissions"
ON enrollment_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Deny public reading (only service_role / dashboard admin can view applicant PII)
DROP POLICY IF EXISTS "Deny public select on enrollment_submissions" ON enrollment_submissions;
CREATE POLICY "Deny public select on enrollment_submissions"
ON enrollment_submissions
FOR SELECT
TO service_role
USING (true);

-- 3. Table: profiles (Student Profiles)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile row
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
