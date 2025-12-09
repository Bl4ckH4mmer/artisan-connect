export type UserRole = 'buyer' | 'artisan' | 'admin'

export interface UserProfile {
    // Identity
    id: string
    user_id: string
    full_name: string | null
    email?: string // Optional as it comes from auth table usually
    phone_number: string | null

    // Roles (Dual Role Support)
    is_buyer: boolean
    is_artisan: boolean
    is_admin: boolean

    // Context
    active_role: UserRole

    // Timestamps
    created_at: string
    updated_at: string
}

// Re-export specific artisan types if needed, or keep them separate
// Ideally, ArtisanProfile is a separate table/extensions of UserProfile
// but for now we are just defining the UserProfile structure.
