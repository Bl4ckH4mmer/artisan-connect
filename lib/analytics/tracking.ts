import { createClient } from '@/lib/supabase/client'; // Assuming client existence or using logic to get it? 
// Actually the plan says "helper functions". Usually we pass supabase client or create it.
// `trackContactEvent` takes supabase instance. I should follow that pattern or use a client if available.
// checking imports in contact-tracking.ts... none for supabase. It takes it as arg.
// I'll assume passing supabase client for consistency or cleaner dependency injection.

import { ProfileViewData, UpsellImpressionData } from '@/types/analytics';

export async function trackProfileView(
    data: ProfileViewData,
    supabase: any
) {
    try {
        const { error } = await supabase
            .from('profile_views')
            .insert({
                artisan_id: data.artisan_id,
                viewer_id: data.viewer_id, // nullable
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error tracking profile view:', JSON.stringify(error, null, 2));
    }
}

export async function canShowUpsell(
    userId: string,
    triggerType: string,
    supabase: any
): Promise<boolean> {
    try {
        // Logic: check recent impressions
        // Plan: 'Upsell impression logic prevents showing same trigger within 7 days'

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
            .from('upsell_impressions')
            .select('id')
            .eq('user_id', userId)
            .eq('trigger_type', triggerType)
            .gte('shown_at', sevenDaysAgo.toISOString())
            .limit(1);

        if (error) {
            console.error('Error checking upsell history:', error);
            return false; // Fail safe: don't show if error
        }

        // If data found, it means we showed it recently -> return false.
        // data is array. if length > 0, return false.
        return data && data.length === 0;

    } catch (error) {
        console.error('Error in canShowUpsell:', error);
        return false;
    }
}

export async function trackUpsellImpression(
    data: UpsellImpressionData,
    supabase: any
) {
    try {
        const { error } = await supabase
            .from('upsell_impressions')
            .insert({
                user_id: data.user_id,
                trigger_type: data.trigger_type
            });

        if (error) console.error('Error tracking upsell impression:', error);
    } catch (e) {
        console.error('Error tracking upsell impression:', e);
    }
}
