
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define types for the joined data structure
type SubscriptionData = {
    tier: string;
    expires_at: string | null;
}

type BoostZoneData = {
    zone: string;
    active: boolean;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const sortBy = searchParams.get('sortBy') || 'rating';

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Helper to build base selection
    const selectQuery = `
    *,
    artisan_subscriptions (
      tier,
      expires_at
    ),
    boost_zones (
      zone,
      active
    )
  `;

    // Query 1: Artisans RESIDING in the location
    let localQuery = supabase
        .from('artisan_profiles')
        .select(selectQuery)
        .eq('status', 'active'); // approved -> active

    if (category) localQuery = localQuery.eq('category', category);
    if (location) localQuery = localQuery.eq('estate_zone', location);

    // Query 2: Artisans MODIFYING visibility via BOOST ZONES
    // Only relevant if filtering by location
    let boostedQuery: any = null;
    if (location) {
        boostedQuery = supabase
            .from('artisan_profiles')
            .select(`
        *,
        artisan_subscriptions!inner (
          tier,
          expires_at
        ),
        boost_zones!inner (
           zone,
           active
        )
      `)
            .eq('status', 'active')
            .eq('boost_zones.zone', location)
            .eq('boost_zones.active', true)
        // Must have active subscription effectively (checked via inner join + JS filter later, 
        // but strictly we should check tier != free here to optimize. 
        // Supabase filter on joined table syntax is limited. Using inner join ensures existence record).
        // Also filter category if present
    }

    if (boostedQuery && category) {
        boostedQuery = boostedQuery.eq('category', category);
    }

    // Execute queries in parallel
    const [localRes, boostedRes] = await Promise.all([
        localQuery,
        location ? boostedQuery : Promise.resolve({ data: [], error: null })
    ]);

    if (localRes.error) {
        console.error('Local Search error:', localRes.error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    const localArtisans = localRes.data || [];
    const boostedArtisans = boostedRes?.data || [];

    // Merge and Deduplicate (by ID)
    const allArtisansMap = new Map();
    [...localArtisans, ...boostedArtisans].forEach(a => {
        allArtisansMap.set(a.id, a);
    });
    const artisans = Array.from(allArtisansMap.values());

    // LOG SEARCH (Fire and forget)
    // We don't await this to keep search fast
    supabase.from('search_logs').insert({
        query: location ? `${category || 'all'} in ${location}` : category, // simplistic query representation
        category: category,
        results_count: artisans.length,
        // user_id is hard to get here without auth headers, 
        // but for market gap aggregating, anonymous logs are fine.
    }).then(({ error }) => {
        if (error) console.error('Search Log Error:', error);
    });

    // =====================================================
    // BOOST RANKING ALGORITHM
    // =====================================================

    const now = new Date();

    const rankedArtisans = artisans
        .map(artisan => {
            const subscription = (Array.isArray(artisan.artisan_subscriptions) ? artisan.artisan_subscriptions[0] : artisan.artisan_subscriptions) as SubscriptionData | undefined;
            const boostZones = (artisan.boost_zones || []) as BoostZoneData[];

            const hasActiveBoost = subscription &&
                subscription.tier !== 'free' &&
                (!subscription.expires_at || new Date(subscription.expires_at) > now);

            // Strict check: Is this artisan boosted SPECIFICALLY for the searched location?
            // If user searched "Lekki", and this artisan is here ONLY because of Boost Zone "Lekki", 
            // then is_boosted_in_location is TRUE.
            // If user searched "Lekki", and artisan LIVES in Lekki (localQuery), do they have boost?
            const isBoostedInLocation = !!(location && hasActiveBoost &&
                boostZones.some(bz => bz.zone === location && bz.active));

            return {
                ...artisan,
                subscription_tier: subscription?.tier || 'free',
                is_boosted: hasActiveBoost,
                is_boosted_in_location: isBoostedInLocation,
                artisan_subscriptions: undefined,
                boost_zones: undefined
            };
        })
        .sort((a, b) => {
            // PRIORITY 1: Boosted + Verified in searched location
            if (a.is_boosted_in_location && a.is_verified && !b.is_boosted_in_location) return -1;
            if (b.is_boosted_in_location && b.is_verified && !a.is_boosted_in_location) return 1;

            // PRIORITY 2: Boosted anywhere
            if (a.is_boosted && !b.is_boosted) return -1;
            if (b.is_boosted && !a.is_boosted) return 1;

            // PRIORITY 3: Verified status
            if (a.is_verified && !b.is_verified) return -1;
            if (b.is_verified && !a.is_verified) return 1;

            // PRIORITY 4: User-selected sort
            switch (sortBy) {
                case 'reviews':
                    return (b.total_reviews || 0) - (a.total_reviews || 0);
                case 'contacts':
                    return (b.total_contacts || 0) - (a.total_contacts || 0);
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'rating':
                default:
                    if (b.rating === a.rating) {
                        return (b.total_reviews || 0) - (a.total_reviews || 0);
                    }
                    return (b.rating || 0) - (a.rating || 0);
            }
        });

    return NextResponse.json({
        artisans: rankedArtisans,
        total: rankedArtisans.length,
        filters: { category, location, sortBy }
    });
}
