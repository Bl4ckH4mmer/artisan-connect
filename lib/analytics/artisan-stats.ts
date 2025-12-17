import { createClient } from '@/lib/supabase/client';

export type StatComparison = {
    current: number;
    previous: number;
};

export type WeeklyStats = {
    profileViews: StatComparison;
    contacts: StatComparison;
    reviews: { total: number; thisWeek: number };
    avgResponseTime: string | null;
};

export async function getArtisanWeeklyStats(
    artisanId: string,
    supabase: any
): Promise<WeeklyStats> {
    const now = new Date();

    // Calculate current week range (last 7 days)
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    // Calculate previous week range (7-14 days ago)
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    // Profile Views
    const { count: currentViews } = await supabase
        .from('profile_view_events')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', artisanId)
        .gte('created_at', oneWeekAgo.toISOString());

    const { count: previousViews } = await supabase
        .from('profile_view_events')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', artisanId)
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', oneWeekAgo.toISOString());

    // Contacts
    const { count: currentContacts } = await supabase
        .from('contact_events')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', artisanId)
        .gte('created_at', oneWeekAgo.toISOString());

    const { count: previousContacts } = await supabase
        .from('contact_events')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', artisanId)
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', oneWeekAgo.toISOString());

    // Reviews
    const { count: totalReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', artisanId);

    const { count: weeklyReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', artisanId)
        .gte('created_at', oneWeekAgo.toISOString());

    return {
        profileViews: {
            current: currentViews || 0,
            previous: previousViews || 0
        },
        contacts: {
            current: currentContacts || 0,
            previous: previousContacts || 0
        },
        reviews: {
            total: totalReviews || 0,
            thisWeek: weeklyReviews || 0
        },
        avgResponseTime: null // Placeholder until messaging system
    };
}
