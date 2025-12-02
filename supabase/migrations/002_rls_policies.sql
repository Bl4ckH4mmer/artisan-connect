-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE artisan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ARTISAN PROFILES POLICIES
-- =====================================================

-- Public can view approved artisan profiles
CREATE POLICY "Public can view approved artisan profiles"
ON artisan_profiles
FOR SELECT
USING (status = 'active' AND is_verified = TRUE);

-- Artisans can view their own profile (any status)
CREATE POLICY "Artisans can view own profile"
ON artisan_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Artisans can insert their own profile
CREATE POLICY "Artisans can create own profile"
ON artisan_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Artisans can update their own profile (except verification fields)
CREATE POLICY "Artisans can update own profile"
ON artisan_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Prevent artisans from self-verifying
  is_verified = (SELECT is_verified FROM artisan_profiles WHERE id = artisan_profiles.id) AND
  status = (SELECT status FROM artisan_profiles WHERE id = artisan_profiles.id)
);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON artisan_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Admins can update any profile (for verification)
CREATE POLICY "Admins can update any profile"
ON artisan_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- CONTACT EVENTS POLICIES
-- =====================================================

-- Users can create contact events
CREATE POLICY "Users can create contact events"
ON contact_events
FOR INSERT
WITH CHECK (auth.uid() = buyer_user_id);

-- Users can view their own contact events
CREATE POLICY "Users can view own contact events"
ON contact_events
FOR SELECT
USING (auth.uid() = buyer_user_id);

-- Artisans can view contact events for their profile
CREATE POLICY "Artisans can view their contact events"
ON contact_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM artisan_profiles
    WHERE id = contact_events.artisan_id
    AND user_id = auth.uid()
  )
);

-- Admins can view all contact events
CREATE POLICY "Admins can view all contact events"
ON contact_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- REVIEWS POLICIES
-- =====================================================

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews"
ON reviews
FOR SELECT
USING (status = 'approved');

-- Users can view their own reviews (any status)
CREATE POLICY "Users can view own reviews"
ON reviews
FOR SELECT
USING (auth.uid() = buyer_user_id);

-- Users can create reviews (must have contact event)
CREATE POLICY "Users can create reviews"
ON reviews
FOR INSERT
WITH CHECK (
  auth.uid() = buyer_user_id AND
  EXISTS (
    SELECT 1 FROM contact_events
    WHERE id = contact_event_id
    AND buyer_user_id = auth.uid()
  )
);

-- Users can update their own pending reviews
CREATE POLICY "Users can update own pending reviews"
ON reviews
FOR UPDATE
USING (auth.uid() = buyer_user_id AND status = 'pending')
WITH CHECK (auth.uid() = buyer_user_id AND status = 'pending');

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
ON reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Admins can update any review (for moderation)
CREATE POLICY "Admins can update any review"
ON reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
ON reviews
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);
