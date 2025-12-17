export type SubscriptionTier = 'free' | 'boost' | 'pro' | 'guarantee';

export interface ArtisanSubscription {
    id: string;
    artisan_id: string;
    tier: SubscriptionTier;
    started_at: string;
    expires_at: string | null;
    auto_renew: boolean;
    payment_reference: string | null;
    amount_paid: number | null;
    created_at: string;
    updated_at: string;
}

export interface BoostZone {
    id: string;
    artisan_id: string;
    zone: string;
    active: boolean;
    created_at: string;
}

export interface SubscriptionHistory {
    id: string;
    artisan_id: string;
    from_tier: SubscriptionTier | null;
    to_tier: SubscriptionTier;
    changed_at: string;
    reason: string | null;
    payment_reference: string | null;
}
