-- Rename buyer_user_id to buyer_id to match code and types
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contact_events' AND column_name = 'buyer_user_id'
    ) THEN
        ALTER TABLE public.contact_events RENAME COLUMN buyer_user_id TO buyer_id;
    END IF;
END $$;

-- Contact Events Table - Alter existing
ALTER TABLE public.contact_events 
ADD COLUMN IF NOT EXISTS artisan_category TEXT,
ADD COLUMN IF NOT EXISTS artisan_location TEXT;

-- RLS policies for contact_events
ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contact_events' AND policyname = 'Enable insert for everyone'
    ) THEN
        CREATE POLICY "Enable insert for everyone" ON public.contact_events
          FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contact_events' AND policyname = 'Artisans can see their own contact events'
    ) THEN
        CREATE POLICY "Artisans can see their own contact events" ON public.contact_events
          FOR SELECT USING (auth.uid() IN (SELECT user_id FROM artisan_profiles WHERE id = artisan_id));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contact_events' AND policyname = 'Buyers can see their own contact events'
    ) THEN
        CREATE POLICY "Buyers can see their own contact events" ON public.contact_events
          FOR SELECT USING (auth.uid() = buyer_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contact_events' AND policyname = 'Admins can view all contact events'
    ) THEN
        CREATE POLICY "Admins can view all contact events" ON public.contact_events
        FOR SELECT USING (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        );
    END IF;
END $$;


-- Profile View Events (New)
CREATE TABLE IF NOT EXISTS public.profile_view_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID REFERENCES public.artisan_profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable for anonymous
  source TEXT, -- 'search', 'category', 'direct'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Profile View Events
ALTER TABLE public.profile_view_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profile_view_events' AND policyname = 'Enable insert for everyone'
    ) THEN
        CREATE POLICY "Enable insert for everyone" ON public.profile_view_events
        FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profile_view_events' AND policyname = 'Artisans can see their own profile views'
    ) THEN
        CREATE POLICY "Artisans can see their own profile views" ON public.profile_view_events
        FOR SELECT USING (auth.uid() IN (SELECT user_id FROM artisan_profiles WHERE id = artisan_id));
    END IF;
  
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profile_view_events' AND policyname = 'Admins can view all profile views'
    ) THEN
        CREATE POLICY "Admins can view all profile views" ON public.profile_view_events
        FOR SELECT USING (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        );
    END IF;
END $$;


-- Upsell Impressions (prevent spam)
CREATE TABLE IF NOT EXISTS public.upsell_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT, -- 'boost_after_contact', 'pro_toolkit', etc.
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dismissed BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE
);

-- RLS for Upsell Impressions
ALTER TABLE public.upsell_impressions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'upsell_impressions' AND policyname = 'Users can only see their own impressions'
    ) THEN
        CREATE POLICY "Users can only see their own impressions" ON public.upsell_impressions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'upsell_impressions' AND policyname = 'Users can insert their own impressions'
    ) THEN
        CREATE POLICY "Users can insert their own impressions" ON public.upsell_impressions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'upsell_impressions' AND policyname = 'Users can update their own impressions'
    ) THEN
        CREATE POLICY "Users can update their own impressions" ON public.upsell_impressions
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
