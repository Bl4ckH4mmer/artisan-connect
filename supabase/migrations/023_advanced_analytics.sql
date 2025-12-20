-- Migration: 023_advanced_analytics
-- Description: Adds strategic analytics RPCs (Recruitment Alert, Search Success, Churn Risk, Force Boost).

-- 1. Recruitment Alert Engine (Hot Zones)
-- Detects "pockets of frustration": >10 searches in 48h with <3 results vs threshold.
CREATE OR REPLACE FUNCTION get_recruitment_alerts(
    min_searches INTEGER DEFAULT 10,
    max_results INTEGER DEFAULT 3,
    hours_lookback INTEGER DEFAULT 48
)
RETURNS TABLE (
    zone_category TEXT,
    search_volume BIGINT,
    avg_results NUMERIC,
    alert_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(query, category) as zone_category,
        COUNT(*) as search_volume,
        ROUND(AVG(results_count), 2) as avg_results,
        CASE 
            WHEN AVG(results_count) = 0 THEN 'CRITICAL'
            ELSE 'HIGH'
        END as alert_level
    FROM public.search_logs
    WHERE created_at > (NOW() - (hours_lookback || ' hours')::INTERVAL)
    GROUP BY zone_category
    HAVING COUNT(*) >= min_searches AND AVG(results_count) <= max_results
    ORDER BY search_volume DESC;
END;
$$;


-- 2. Search Success Rate
-- Returns simple ratio of (Total Contacts / Total Searches) * 100 for the period.
CREATE OR REPLACE FUNCTION get_search_success_rate(
    days_lookback INTEGER DEFAULT 30
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_searches BIGINT;
    total_contacts BIGINT;
BEGIN
    SELECT COUNT(*) INTO total_searches
    FROM public.search_logs
    WHERE created_at > (NOW() - (days_lookback || ' days')::INTERVAL);

    SELECT COUNT(*) INTO total_contacts
    FROM public.contact_events
    WHERE created_at > (NOW() - (days_lookback || ' days')::INTERVAL);

    IF total_searches = 0 THEN
        RETURN 0;
    ELSE
        RETURN ROUND((total_contacts::NUMERIC / total_searches::NUMERIC) * 100, 1);
    END IF;
END;
$$;


-- 3. Churn Risk Watchlist
-- Identifies PRO/BOOST artisans with low contact volume (<2 in 14 days).
CREATE OR REPLACE FUNCTION get_churn_risk_artisans(
    min_contacts INTEGER DEFAULT 2,
    days_lookback INTEGER DEFAULT 14
)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    tier TEXT,
    contact_count BIGINT,
    days_since_last_contact INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.business_name,
        s.tier,
        COUNT(c.id) as contact_count,
        EXTRACT(DAY FROM (NOW() - MAX(c.created_at)))::INTEGER as days_since_last_contact
    FROM public.artisan_profiles a
    JOIN public.artisan_subscriptions s ON a.id = s.artisan_id
    LEFT JOIN public.contact_events c ON a.id = c.artisan_id 
        AND c.created_at > (NOW() - (days_lookback || ' days')::INTERVAL)
    WHERE s.status = 'active'
      AND s.tier IN ('boost', 'pro')
    GROUP BY a.id, a.business_name, s.tier
    HAVING COUNT(c.id) < min_contacts
    ORDER BY contact_count ASC, tier DESC;
END;
$$;


-- 4. Force Boost Action
-- Grant temporary 'boost' tier (or extend existing) for 48 hours to help struggling artisans.
-- Warning: This overrides existing subscription expiry.
CREATE OR REPLACE FUNCTION force_boost_artisan(
    p_artisan_id UUID,
    duration_hours INTEGER DEFAULT 48
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.artisan_subscriptions
    SET 
        -- Upgrade to 'boost' if purely 'free', otherwise keep existing tier (e.g. 'pro')
        tier = CASE WHEN tier = 'free' THEN 'boost' ELSE tier END,
        expires_at = (NOW() + (duration_hours || ' hours')::INTERVAL),
        updated_at = NOW()
    WHERE artisan_id = p_artisan_id;
END;
$$;
