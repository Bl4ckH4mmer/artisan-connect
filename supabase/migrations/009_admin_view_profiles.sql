-- =====================================================
-- MIGRATION: ADMIN RLS FOR USER PROFILES
-- =====================================================
-- Allows admins to view all user profiles in the 'user_profiles' table.
-- Required for the Admin Panel > Buyers tab.

CREATE POLICY "Admins can view all user profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
