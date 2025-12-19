-- Migration: Soft Account Deletion System

-- 1. Add status and deletion tracking to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMPTZ;

-- 2. Create RPC to request account deletion (Soft Delete)
CREATE OR REPLACE FUNCTION request_account_deletion()
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Update user_profiles
  UPDATE public.user_profiles
  SET 
    status = 'deactivated',
    deletion_requested_at = NOW(),
    scheduled_deletion_at = NOW() + INTERVAL '30 days'
  WHERE user_id = v_user_id;

  -- Update artisan_profiles if exists
  -- maximize safety by setting to 'suspended'
  UPDATE public.artisan_profiles
  SET status = 'suspended'
  WHERE user_id = v_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Create RPC to cancel deletion (Recovery)
CREATE OR REPLACE FUNCTION cancel_account_deletion()
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Restore user_profile
  UPDATE public.user_profiles
  SET 
    status = 'active',
    deletion_requested_at = NULL,
    scheduled_deletion_at = NULL
  WHERE user_id = v_user_id;

  -- Note: We do NOT automatically restore artisan_profile status to 'active'
  -- to prevent bypassing bans. User must explicitly re-activate or contact support.
  -- However, we can set it to 'pending' to allow them to go through checks again if needed
  -- or just leave it 'suspended' and let them toggle it in dashboard if logic allows.
  -- For now, leaving it untouched is safest/cleanest, assuming 'suspended' means they can't be searched.
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
