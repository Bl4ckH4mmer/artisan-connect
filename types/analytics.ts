export interface ProfileViewEvent {
    id: string;
    artisan_id: string;
    viewer_id?: string;
    source: string; // 'search', 'category', 'direct'
    created_at: string;
}

export interface UpsellImpression {
    id: string;
    user_id: string;
    trigger_type: string;
    shown_at: string;
    dismissed: boolean;
    converted: boolean;
}

export type ProfileViewData = {
    artisan_id: string;
    viewer_id?: string;
    source: string;
};

export type UpsellImpressionData = {
    user_id: string;
    trigger_type: string;
};
