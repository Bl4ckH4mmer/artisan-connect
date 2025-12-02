export interface ArtisanProfile {
    // Core Identity
    id: string;
    user_id: string;
    business_name: string;
    artisan_name: string;
    phone_number: string;
    whatsapp_number?: string;

    // Service Details
    category: ArtisanCategory;
    skills: string[];
    experience_years: number;
    bio: string;

    // Location (Hyper-local)
    estate_zone: string;
    city: string;
    state: string;

    // Media
    profile_image?: string;
    portfolio_images: string[];

    // Verification & Status
    is_verified: boolean;
    status: ArtisanStatus;
    verification_method?: VerificationMethod;
    verified_at?: string;
    verified_by?: string;

    // Metrics
    rating: number;
    total_reviews: number;
    total_contacts: number;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export type ArtisanCategory =
    | 'Electrician'
    | 'Plumber'
    | 'Mechanic (Auto)'
    | 'Generator Repair'
    | 'AC Technician'
    | 'Carpenter'
    | 'Painter'
    | 'Tiler'
    | 'Bricklayer'
    | 'Welder'
    | 'Roofer'
    | 'Cleaner'
    | 'Hairstylist'
    | 'Tailor';

export type ArtisanStatus = 'pending' | 'active' | 'suspended';

export type VerificationMethod = 'nin' | 'phone_call' | 'in_person';

export interface ArtisanFormData {
    business_name: string;
    artisan_name: string;
    phone_number: string;
    whatsapp_number?: string;
    category: ArtisanCategory;
    skills: string[];
    experience_years: number;
    bio: string;
    estate_zone: string;
    city: string;
    state: string;
    profile_image?: File;
    portfolio_images?: File[];
}
