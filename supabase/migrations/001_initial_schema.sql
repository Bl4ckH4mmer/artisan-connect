-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for artisan categories
CREATE TYPE artisan_category AS ENUM (
  'Electrician',
  'Plumber',
  'Mechanic (Auto)',
  'Generator Repair',
  'AC Technician',
  'Carpenter',
  'Painter',
  'Tiler',
  'Bricklayer',
  'Welder',
  'Roofer',
  'Cleaner',
  'Hairstylist',
  'Tailor'
);

-- Create enum for artisan status
CREATE TYPE artisan_status AS ENUM ('pending', 'active', 'suspended');

-- Create enum for verification method
CREATE TYPE verification_method AS ENUM ('nin', 'phone_call', 'in_person');

-- Create enum for contact type
CREATE TYPE contact_type AS ENUM ('whatsapp', 'call');

-- Create enum for review status
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- =====================================================
-- ARTISAN PROFILES TABLE
-- =====================================================
CREATE TABLE artisan_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core Identity
  business_name VARCHAR(255) NOT NULL,
  artisan_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  whatsapp_number VARCHAR(20),
  
  -- Service Details
  category artisan_category NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  bio TEXT,
  
  -- Location (Hyper-local)
  estate_zone VARCHAR(100) NOT NULL,
  city VARCHAR(100) DEFAULT 'Arepo',
  state VARCHAR(100) DEFAULT 'Ogun',
  coordinates JSONB, -- {lat: number, lng: number}
  
  -- Media
  profile_image_url TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  
  -- Verification & Status
  is_verified BOOLEAN DEFAULT FALSE,
  status artisan_status DEFAULT 'pending',
  verification_method verification_method,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Metrics (calculated fields)
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  total_contacts INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  CHECK (experience_years >= 0)
);

-- Create index for search performance
CREATE INDEX idx_artisan_category ON artisan_profiles(category);
CREATE INDEX idx_artisan_status ON artisan_profiles(status);
CREATE INDEX idx_artisan_estate_zone ON artisan_profiles(estate_zone);
CREATE INDEX idx_artisan_rating ON artisan_profiles(rating DESC);
CREATE INDEX idx_artisan_verified ON artisan_profiles(is_verified);

-- =====================================================
-- CONTACT EVENTS TABLE
-- =====================================================
CREATE TABLE contact_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE NOT NULL,
  contact_type contact_type NOT NULL,
  contacted_at TIMESTAMPTZ DEFAULT NOW(),
  review_requested_at TIMESTAMPTZ,
  review_submitted BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for contact events
CREATE INDEX idx_contact_buyer ON contact_events(buyer_user_id);
CREATE INDEX idx_contact_artisan ON contact_events(artisan_id);
CREATE INDEX idx_contact_date ON contact_events(contacted_at DESC);
CREATE INDEX idx_contact_review_pending ON contact_events(review_submitted) WHERE review_submitted = FALSE;

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_event_id UUID REFERENCES contact_events(id) ON DELETE SET NULL,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_verified_hire BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  status review_status DEFAULT 'pending',
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints: One review per contact event
  UNIQUE(contact_event_id)
);

-- Create indexes for reviews
CREATE INDEX idx_review_artisan ON reviews(artisan_id);
CREATE INDEX idx_review_buyer ON reviews(buyer_user_id);
CREATE INDEX idx_review_status ON reviews(status);
CREATE INDEX idx_review_created ON reviews(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update artisan rating when review is approved
CREATE OR REPLACE FUNCTION update_artisan_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if review status changed to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE artisan_profiles
    SET 
      rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE artisan_id = NEW.artisan_id AND status = 'approved'
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE artisan_id = NEW.artisan_id AND status = 'approved'
      ),
      updated_at = NOW()
    WHERE id = NEW.artisan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating after review approval
CREATE TRIGGER trigger_update_artisan_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_artisan_rating();

-- Function to increment contact count
CREATE OR REPLACE FUNCTION increment_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artisan_profiles
  SET 
    total_contacts = total_contacts + 1,
    updated_at = NOW()
  WHERE id = NEW.artisan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment contact count
CREATE TRIGGER trigger_increment_contact_count
AFTER INSERT ON contact_events
FOR EACH ROW
EXECUTE FUNCTION increment_contact_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_artisan_updated_at
BEFORE UPDATE ON artisan_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_review_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
