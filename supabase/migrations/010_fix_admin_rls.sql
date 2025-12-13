-- =====================================================
-- MIGRATION: FIX ADMIN RLS POLICY
-- =====================================================
-- The previous policy attempted to read from auth.users which is restricted.
-- This update uses auth.jwt() to check user metadata directly.

-- 1. Drop the failing policy
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;

-- 2. Re-create with JWT check
CREATE POLICY "Admins can view all user profiles"
ON user_profiles
FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
