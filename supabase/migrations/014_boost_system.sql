-- =====================================================
-- ARTISAN BOOST SYSTEM - DATABASE SCHEMA
-- =====================================================

-- 1. Subscription Tiers Table
CREATE TABLE IF NOT EXISTS artisan_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE UNIQUE,
  tier TEXT CHECK (tier IN ('free', 'boost', 'pro', 'guarantee')) DEFAULT 'free' NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_reference TEXT, -- Paystack/Flutterwave transaction ref
  amount_paid DECIMAL(10,2), -- Store historical pricing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Boost Zones Table (geographic targeting)
CREATE TABLE IF NOT EXISTS boost_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  zone TEXT NOT NULL, -- 'Banana Island', 'Victoria Island', etc.
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(artisan_id, zone) -- One artisan can boost in multiple zones
);

-- 3. Subscription History (audit trail)
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  from_tier TEXT,
  to_tier TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT, -- 'upgrade', 'downgrade', 'expired', 'payment_failed'
  payment_reference TEXT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_artisan ON artisan_subscriptions(artisan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON artisan_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON artisan_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_boost_zones_artisan ON boost_zones(artisan_id);
CREATE INDEX IF NOT EXISTS idx_boost_zones_zone ON boost_zones(zone);
CREATE INDEX IF NOT EXISTS idx_boost_zones_active ON boost_zones(zone, active) WHERE active = TRUE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE artisan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Artisans can view their own subscription
CREATE POLICY "Artisans can view own subscription"
  ON artisan_subscriptions FOR SELECT
  USING (
    artisan_id IN (SELECT id FROM artisan_profiles WHERE user_id = auth.uid())
  );

-- Artisans can view their own boost zones
CREATE POLICY "Artisans can view own boost zones"
  ON boost_zones FOR SELECT
  USING (
    artisan_id IN (SELECT id FROM artisan_profiles WHERE user_id = auth.uid())
  );

-- Only service role can modify subscriptions (payment webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON artisan_subscriptions FOR ALL
  USING ((auth.jwt()->>'role' = 'service_role'));

CREATE POLICY "Service role can manage boost zones"
  ON boost_zones FOR ALL
  USING ((auth.jwt()->>'role' = 'service_role'));

-- Artisans can view their subscription history
CREATE POLICY "Artisans can view own history"
  ON subscription_history FOR SELECT
  USING (
    artisan_id IN (SELECT id FROM artisan_profiles WHERE user_id = auth.uid())
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to automatically create free tier on artisan signup
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO artisan_subscriptions (artisan_id, tier)
  VALUES (NEW.id, 'free')
  ON CONFLICT (artisan_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create subscription when artisan is created
DROP TRIGGER IF EXISTS on_artisan_created ON artisan_profiles;
CREATE TRIGGER on_artisan_created
  AFTER INSERT ON artisan_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Function to log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.tier IS DISTINCT FROM NEW.tier THEN
    INSERT INTO subscription_history (artisan_id, from_tier, to_tier, reason)
    VALUES (NEW.artisan_id, OLD.tier, NEW.tier, 'manual_update');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Log all tier changes
DROP TRIGGER IF EXISTS on_subscription_updated ON artisan_subscriptions;
CREATE TRIGGER on_subscription_updated
  AFTER UPDATE ON artisan_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();

-- =====================================================
-- UTILITY FUNCTIONS (for your Next.js API)
-- =====================================================

-- Check if artisan has active boost in a specific zone
CREATE OR REPLACE FUNCTION is_boosted_in_zone(p_artisan_id UUID, p_zone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM artisan_subscriptions s
    JOIN boost_zones bz ON s.artisan_id = bz.artisan_id
    WHERE s.artisan_id = p_artisan_id
      AND s.tier IN ('boost', 'pro', 'guarantee')
      AND (s.expires_at IS NULL OR s.expires_at > NOW())
      AND bz.zone = p_zone
      AND bz.active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all active boosted artisans in a zone
CREATE OR REPLACE FUNCTION get_boosted_artisans(p_zone TEXT)
RETURNS TABLE (artisan_id UUID, tier TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT s.artisan_id, s.tier
  FROM artisan_subscriptions s
  JOIN boost_zones bz ON s.artisan_id = bz.artisan_id
  WHERE s.tier IN ('boost', 'pro', 'guarantee')
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
    AND bz.zone = p_zone
    AND bz.active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
