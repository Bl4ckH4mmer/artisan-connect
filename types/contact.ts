export interface ContactEvent {
    id: string;
    buyer_id: string;
    artisan_id: string;
    contact_type: ContactType;
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
}
