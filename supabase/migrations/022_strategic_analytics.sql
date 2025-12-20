-- Migration: 022_strategic_analytics
-- Description: Adds tables for tracking search intent and profile visibility, plus analytics RPCs.

-- 1. Search Logs Table
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- Nullable for anonymous searches
    query TEXT,
    category TEXT,
    results_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profile Views Table
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES public.artisan_profiles(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id), -- Nullable for anonymous views
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all search logs" ON public.search_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can view all profile views" ON public.profile_views
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND is_admin = true)
    );

-- Public can insert (logging actions)
CREATE POLICY "Public can insert search logs" ON public.search_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert profile views" ON public.profile_views
    FOR INSERT WITH CHECK (true);


-- 3. Analytics RPC: Get Market Gap (High Demand / Low Supply)
-- Returns queries with high volume but low result counts
CREATE OR REPLACE FUNCTION get_market_gap(
    min_searches INTEGER DEFAULT 5,
    max_results INTEGER DEFAULT 3
)
RETURNS TABLE (
    search_term TEXT,
    search_count BIGINT,
    avg_results NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(category, query) as search_term,
        COUNT(*) as search_count,
        ROUND(AVG(results_count), 1) as avg_results
    FROM public.search_logs
    WHERE created_at > (NOW() - INTERVAL '30 days')
      AND (category IS NOT NULL OR query IS NOT NULL)
    GROUP BY search_term
    HAVING COUNT(*) >= min_searches AND AVG(results_count) <= max_results
    ORDER BY search_count DESC;
END;
$$;

-- 4. Analytics RPC: Get Tier ROI (Performance by Subscription Tier)
-- Aggregates views and contacts by tier
CREATE OR REPLACE FUNCTION get_tier_roi()
RETURNS TABLE (
    tier TEXT,
    avg_views NUMERIC,
    avg_contacts NUMERIC,
    total_artisans BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(s.plan_type, 'free') as tier,
        ROUND(AVG(COALESCE(v.view_count, 0)), 1) as avg_views,
        ROUND(AVG(COALESCE(c.contact_count, 0)), 1) as avg_contacts,
        COUNT(a.id) as total_artisans
    FROM public.artisan_profiles a
    LEFT JOIN public.subscriptions s ON a.id = s.artisan_id AND s.status = 'active'
    LEFT JOIN (
        SELECT artisan_id, COUNT(*) as view_count 
        FROM public.profile_views 
        WHERE created_at > (NOW() - INTERVAL '30 days')
        GROUP BY artisan_id
    ) v ON a.id = v.artisan_id
    LEFT JOIN (
        SELECT artisan_id, COUNT(*) as contact_count 
        FROM public.contact_events 
        WHERE created_at > (NOW() - INTERVAL '30 days')
        GROUP BY artisan_id
    ) c ON a.id = c.artisan_id
    GROUP BY tier;
END;
$$;
