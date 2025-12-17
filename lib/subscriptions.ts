
import { createClient } from '@/lib/supabase/server';
import type { SubscriptionTier } from '@/types/subscription';

export const SUBSCRIPTION_PRICING = {
    free: 0,
    boost: 2500, // ₦2,500/month
    pro: 5000,   // ₦5,000/month
    guarantee: 7500 // ₦7,500/month
} as const;

/**
 * Get artisan's current subscription
 */
export async function getArtisanSubscription(artisanId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('artisan_subscriptions')
        .select('*')
        .eq('artisan_id', artisanId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching subscription:', error);
        return null;
    }

    return data;
}

/**
 * Check if artisan has an active paid subscription
 */
export async function hasActiveSubscription(artisanId: string): Promise<boolean> {
    const subscription = await getArtisanSubscription(artisanId);

    if (!subscription || subscription.tier === 'free') return false;

    // Check expiry
    if (subscription.expires_at) {
        const expiryDate = new Date(subscription.expires_at);
        const now = new Date();
        return expiryDate > now;
    }

    return true; // No expiry date = lifetime/active
}

/**
 * Check if artisan is boosted in a specific zone
 */
export async function isBoostedInZone(artisanId: string, zone: string): Promise<boolean> {
    const supabase = await createClient();

    // Cast to unknown first to avoid TS error if rpc generic not fully typed
    const { data, error } = await supabase.rpc('is_boosted_in_zone', {
        p_artisan_id: artisanId,
        p_zone: zone
    } as any);

    if (error) {
        console.error('Error checking boost status:', error);
        return false;
    }

    return data as boolean;
}

/**
 * Get artisan's active boost zones
 */
export async function getArtisanBoostZones(artisanId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('boost_zones')
        .select('*')
        .eq('artisan_id', artisanId)
        .eq('active', true);

    if (error) {
        console.error('Error fetching boost zones:', error);
        return [];
    }

    return data;
}

/**
 * Upgrade artisan to a paid tier (called by payment webhook)
 */
export async function upgradeSubscription(
    artisanId: string,
    tier: SubscriptionTier,
    paymentReference: string,
    amountPaid: number,
    durationMonths: number = 1
) {
    const supabase = await createClient();

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    const { data, error } = await supabase
        .from('artisan_subscriptions')
        .update({
            tier,
            payment_reference: paymentReference,
            amount_paid: amountPaid,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('artisan_id', artisanId)
        .select()
        .single();

    if (error) {
        console.error('Error upgrading subscription:', error);
        throw error;
    }

    return data;
}

/**
 * Add boost zone for artisan
 */
export async function addBoostZone(artisanId: string, zone: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('boost_zones')
        .insert({
            artisan_id: artisanId,
            zone,
            active: true
        })
        .select()
        .single();

    if (error) {
        // Handle unique constraint violation gracefully
        if (error.code === '23505') {
            return { success: false, message: 'Zone already added' };
        }
        throw error;
    }

    return { success: true, data };
}

/**
 * Remove boost zone
 */
export async function removeBoostZone(artisanId: string, zone: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('boost_zones')
        .delete()
        .eq('artisan_id', artisanId)
        .eq('zone', zone);

    if (error) throw error;

    return { success: true };
}
