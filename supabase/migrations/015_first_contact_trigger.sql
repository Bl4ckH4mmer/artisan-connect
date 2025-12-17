-- =====================================================
-- TRIGGER A: FIRST CONTACT CELEBRATION
-- =====================================================

-- Table to store artisan notifications (generic system)
CREATE TABLE IF NOT EXISTS artisan_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'first_contact', 'view_drop', 'tier_upgrade'
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fetching unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_artisan_read ON artisan_notifications(artisan_id, read) WHERE read = FALSE;

-- RLS
ALTER TABLE artisan_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can view own notifications"
  ON artisan_notifications FOR SELECT
  USING (
    artisan_id IN (SELECT id FROM artisan_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Artisans can update own notifications"
  ON artisan_notifications FOR UPDATE
  USING (
    artisan_id IN (SELECT id FROM artisan_profiles WHERE user_id = auth.uid())
  );

-- Function to detect first contact
CREATE OR REPLACE FUNCTION check_first_contact()
RETURNS TRIGGER AS $$
DECLARE
  contact_count INTEGER;
BEGIN
  -- Count contacts for this artisan (ignoring the one just inserted? No, including it)
  -- Wait, if we use AFTER INSERT, count will be at least 1.
  -- If count is EXACTLY 1, then this is the first one.
  
  SELECT count(*) INTO contact_count
  FROM contact_events
  WHERE artisan_id = NEW.artisan_id;
  
  IF contact_count = 1 THEN
    -- It's the first contact! Create a notification
    INSERT INTO artisan_notifications (artisan_id, type, title, message)
    VALUES (
      NEW.artisan_id,
      'first_contact',
      '🎉 You got your first lead!',
      'Congratulations! A potential client just contacted you. Check the "Contacts" tab to follow up properly.'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_contact_event_created ON contact_events;
CREATE TRIGGER on_contact_event_created
  AFTER INSERT ON contact_events
  FOR EACH ROW
  EXECUTE FUNCTION check_first_contact();
