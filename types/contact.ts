export interface ContactEvent {
    id: string;
    buyer_id: string;
    artisan_id: string;
    contact_type: ContactType;
    artisan_category?: string;
    artisan_location?: string;
    contacted_at: string;
    review_requested_at?: string;
    review_submitted: boolean;
    created_at: string;
}

export type ContactType = 'whatsapp' | 'call';

export interface ContactEventCreate {
    buyer_id: string;
    artisan_id: string;
    contact_type: ContactType;
    artisan_category?: string;
    artisan_location?: string;
}
