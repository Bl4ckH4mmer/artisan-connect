export interface Review {
    id: string;
    artisan_id: string;
    buyer_user_id: string;
    contact_event_id?: string;

    // Review Content
    rating: number; // 1-5
    comment: string;
    is_verified_hire: boolean;

    // Moderation
    status: ReviewStatus;
    moderated_by?: string;
    moderated_at?: string;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewFormData {
    artisan_id: string;
    contact_event_id?: string;
    rating: number;
    comment: string;
    is_verified_hire: boolean;
}

export interface ReviewWithBuyer extends Review {
    buyer_name?: string;
    buyer_phone?: string;
}
