-- =====================================================
-- AUTH MODAL CONVERSION TRACKING
-- =====================================================
-- This migration creates a table to track AuthModal events
-- for analytics and conversion rate measurement.

-- Create enum for modal event types
CREATE TYPE modal_event_type AS ENUM ('modal_shown', 'modal_converted', 'modal_dismissed');

-- Create enum for conversion action
CREATE TYPE conversion_action AS ENUM ('login', 'signup');

-- Create auth_modal_events table
CREATE TABLE auth_modal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event details
  event_type modal_event_type NOT NULL,
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE SET NULL,
  
  -- Conversion details (only for modal_converted events)
  conversion_action conversion_action,
  
  -- Session tracking (anonymous until user logs in)
  session_id TEXT, -- Browser session ID for tracking anonymous users
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Set after conversion
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX idx_modal_events_type ON auth_modal_events(event_type);
CREATE INDEX idx_modal_events_artisan ON auth_modal_events(artisan_id);
CREATE INDEX idx_modal_events_created ON auth_modal_events(created_at DESC);
CREATE INDEX idx_modal_events_session ON auth_modal_events(session_id);

-- Create composite index for conversion rate queries
CREATE INDEX idx_modal_events_type_date ON auth_modal_events(event_type, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE auth_modal_events IS 'Tracks AuthModal interaction events for conversion analytics';
COMMENT ON COLUMN auth_modal_events.event_type IS 'Type of event: modal_shown, modal_converted, or modal_dismissed';
COMMENT ON COLUMN auth_modal_events.artisan_id IS 'Which artisan profile triggered the modal (if applicable)';
COMMENT ON COLUMN auth_modal_events.session_id IS 'Browser session ID for tracking anonymous user journey';
