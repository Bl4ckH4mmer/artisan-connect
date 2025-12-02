-- =====================================================
-- ARTISAN PROFILE ENHANCEMENTS
-- =====================================================
-- This migration adds admin management fields to artisan_profiles
-- for better tracking, documentation, and manual onboarding.

-- Add admin management columns
ALTER TABLE artisan_profiles 
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS document_urls JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for last active tracking
CREATE INDEX IF NOT EXISTS idx_artisan_last_active ON artisan_profiles(last_active_at DESC);

-- Create index for onboarded_by
CREATE INDEX IF NOT EXISTS idx_artisan_onboarded_by ON artisan_profiles(onboarded_by);

-- Add comments for documentation
COMMENT ON COLUMN artisan_profiles.admin_notes IS 'Internal notes visible only to admins (e.g., verification details, special circumstances)';
COMMENT ON COLUMN artisan_profiles.document_urls IS 'JSONB object containing verification document URLs (e.g., {nin: "url", license: "url"})';
COMMENT ON COLUMN artisan_profiles.last_active_at IS 'Timestamp of last artisan activity (login, profile update, etc.)';
COMMENT ON COLUMN artisan_profiles.onboarded_by IS 'Admin user ID who manually onboarded this artisan (NULL if self-registered)';
