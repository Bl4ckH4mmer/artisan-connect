-- =====================================================
-- FEATURED ARTISANS
-- =====================================================
-- This migration creates a system for featuring artisans
-- on the homepage or in specific categories for promotions.

-- Create featured artisans table
CREATE TABLE featured_artisans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Feature duration
  featured_from TIMESTAMPTZ NOT NULL,
  featured_until TIMESTAMPTZ NOT NULL,
  
  -- Display settings
  position INTEGER DEFAULT 0, -- For ordering in featured carousel
  featured_location VARCHAR(50) DEFAULT 'homepage', -- 'homepage', 'category', 'search'
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (featured_until > featured_from)
);

-- Create indexes for performance
CREATE INDEX idx_featured_artisan ON featured_artisans(artisan_id);
CREATE INDEX idx_featured_active ON featured_artisans(featured_from, featured_until);
CREATE INDEX idx_featured_location ON featured_artisans(featured_location);
CREATE INDEX idx_featured_position ON featured_artisans(position);

-- Create function to get currently featured artisans
CREATE OR REPLACE FUNCTION get_featured_artisans(location_filter VARCHAR DEFAULT 'homepage')
RETURNS TABLE (
  artisan_id UUID,
  business_name VARCHAR,
  artisan_name VARCHAR,
  category artisan_category,
  rating DECIMAL,
  profile_image_url TEXT,
  featured_until TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id,
    ap.business_name,
    ap.artisan_name,
    ap.category,
    ap.rating,
    ap.profile_image_url,
    fa.featured_until
  FROM featured_artisans fa
  JOIN artisan_profiles ap ON fa.artisan_id = ap.id
  WHERE fa.featured_from <= NOW()
    AND fa.featured_until > NOW()
    AND fa.featured_location = location_filter
    AND ap.status = 'active'
  ORDER BY fa.position ASC, fa.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE featured_artisans IS 'Tracks artisans featured on homepage or categories for promotional purposes';
COMMENT ON COLUMN featured_artisans.position IS 'Display order in featured carousel (lower numbers appear first)';
COMMENT ON COLUMN featured_artisans.featured_location IS 'Where to display featured artisan (homepage, category page, search results)';
COMMENT ON FUNCTION get_featured_artisans IS 'Returns currently active featured artisans for a specific location';
