-- =====================================================
-- MIGRATION: DUAL ROLE SUPPORT
-- =====================================================
-- Replaces single 'role' enum with boolean flags to support
-- users being both Buyers and Artisans simultaneously.

-- 1. Create new columns
ALTER TABLE user_profiles
ADD COLUMN is_buyer BOOLEAN DEFAULT true,
ADD COLUMN is_artisan BOOLEAN DEFAULT false,
ADD COLUMN is_admin BOOLEAN DEFAULT false,
ADD COLUMN active_role user_role DEFAULT 'buyer';

-- 2. Migrate existing data (if any)
-- If role was 'artisan', set is_artisan = true.
-- is_buyer defaults to true, which is safe as artisans can be buyers.
UPDATE user_profiles
SET 
  is_artisan = (role = 'artisan'),
  is_admin = (role = 'admin'),
  active_role = role;

-- 3. Drop old column
-- We keep the user_role type for 'active_role' usage, 
-- but remove the restrictive 'role' column.
ALTER TABLE user_profiles
DROP COLUMN role;

-- 4. Update Policies
-- We need to update policies to check flags instead of the role column
-- But technically, "Users can read own profile" relies on auth.uid() = user_id
-- so that specific policy is safe.
-- However, we might want to add role-based index
DROP INDEX IF EXISTS idx_user_profiles_role;
CREATE INDEX idx_user_profiles_metrics ON user_profiles(is_buyer, is_artisan);

-- 5. Update Signup Trigger
-- Modify the handle_new_user function to set flags instead of role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, is_buyer, full_name, active_role)
  VALUES (
    NEW.id,
    true, -- Always start as buyer
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'buyer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
