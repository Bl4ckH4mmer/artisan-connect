-- Create favorite_artisans table
CREATE TABLE favorite_artisans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a buyer can only favorite an artisan once
    UNIQUE(buyer_id, artisan_id)
);

-- Indexes
CREATE INDEX idx_favorites_buyer ON favorite_artisans(buyer_id);
CREATE INDEX idx_favorites_artisan ON favorite_artisans(artisan_id);

-- RLS Policies
ALTER TABLE favorite_artisans ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
ON favorite_artisans FOR SELECT
USING (auth.uid() = buyer_id);

-- Users can insert their own favorites
CREATE POLICY "Users can add favorites"
ON favorite_artisans FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Users can delete their own favorites
CREATE POLICY "Users can remove favorites"
ON favorite_artisans FOR DELETE
USING (auth.uid() = buyer_id);

-- Force cache reload
NOTIFY pgrst, 'reload config';
