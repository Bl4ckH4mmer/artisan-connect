import { createClient } from '@/lib/supabase/client'

export interface ArtisanPerformanceMetrics {
    id: string
    business_name: string
    category: string
    profile_image_url: string | null
    conversions: number
    total_contacts: number
    rating: number
    total_reviews: number
    performance_score: number
}

export interface UserEngagementMetrics {
    totalUsers: number
    avgTimeToFirstContact: number
    medianTimeToFirstContact: number
    repeatContactRate: number
    day1Retention: number
    day7Retention: number
    day30Retention: number
}

export interface EngagementFunnel {
    signups: number
    firstContact: number
    reviewSubmission: number
    contactRate: number
    reviewRate: number
}

/**
 * Get artisan performance metrics ranked by conversion score
 */
export async function getArtisanPerformanceMetrics(): Promise<ArtisanPerformanceMetrics[]> {
    const supabase = createClient()

    // Fetch artisans with their conversion and contact data
    const { data: artisans } = await supabase
        .from('artisan_profiles')
        .select('id, business_name, category, profile_image_url, rating, total_reviews, total_contacts')
        .eq('status', 'active')

    if (!artisans) return []

    // Fetch modal conversion events grouped by artisan
    const { data: modalEvents } = await supabase
        .from('auth_modal_events')
        .select('artisan_id, event_type')

    // Calculate conversions per artisan
    const conversionMap = new Map<string, number>()
    modalEvents?.forEach(event => {
        if (event.event_type === 'modal_converted' && event.artisan_id) {
            conversionMap.set(
                event.artisan_id,
                (conversionMap.get(event.artisan_id) || 0) + 1
            )
        }
    })

    // Combine data and calculate performance score
    const metrics: ArtisanPerformanceMetrics[] = artisans.map(artisan => {
        const conversions = conversionMap.get(artisan.id) || 0

        // Performance score: weighted combination of metrics
        // Conversions (40%) + Contacts (30%) + Reviews (20%) + Rating (10%)
        const performanceScore =
            (conversions * 0.4) +
            (artisan.total_contacts * 0.3) +
            (artisan.total_reviews * 0.2) +
            (artisan.rating * 2 * 0.1) // Rating is 0-5, multiply by 2 to normalize

        return {
            id: artisan.id,
            business_name: artisan.business_name,
            category: artisan.category,
            profile_image_url: artisan.profile_image_url,
            conversions,
            total_contacts: artisan.total_contacts,
            rating: artisan.rating,
            total_reviews: artisan.total_reviews,
            performance_score: Math.round(performanceScore * 100) / 100
        }
    })

    // Sort by performance score descending
    return metrics.sort((a, b) => b.performance_score - a.performance_score)
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics(): Promise<UserEngagementMetrics> {
    const supabase = createClient()

    // Get all contact events
    const { data: contacts } = await supabase
        .from('contact_events')
        .select('buyer_id, created_at')
        .order('created_at', { ascending: true })

    if (!contacts || contacts.length === 0) {
        return {
            totalUsers: 0,
            avgTimeToFirstContact: 0,
            medianTimeToFirstContact: 0,
            repeatContactRate: 0,
            day1Retention: 0,
            day7Retention: 0,
            day30Retention: 0
        }
    }

    // Calculate unique users from contact events
    const uniqueUsers = new Set(contacts.map(c => c.buyer_id))
    const totalUsers = uniqueUsers.size

    // Calculate time to first contact
    const userFirstContact = new Map<string, Date>()
    contacts.forEach(contact => {
        if (!userFirstContact.has(contact.buyer_id)) {
            userFirstContact.set(contact.buyer_id, new Date(contact.created_at))
        }
    })

    // For time calculations, we'll estimate based on contact patterns
    // This is approximate since we don't have signup times
    const timesToFirstContact: number[] = []
    // Skip this calculation since we don't have access to auth.users

    const avgTimeToFirstContact = 0 // Would need auth.users access
    const medianTimeToFirstContact = 0 // Would need auth.users access

    // Calculate repeat contact rate
    const userContactCounts = new Map<string, number>()
    contacts.forEach(contact => {
        userContactCounts.set(
            contact.buyer_id,
            (userContactCounts.get(contact.buyer_id) || 0) + 1
        )
    })

    const usersWithContacts = userContactCounts.size
    const repeatUsers = Array.from(userContactCounts.values()).filter(count => count > 1).length
    const repeatContactRate = usersWithContacts > 0 ? (repeatUsers / usersWithContacts) * 100 : 0

    // Calculate retention (based on contact activity)
    const now = new Date()
    const day1 = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const uniqueUsersDay1 = new Set(contacts.filter(c => new Date(c.created_at) >= day1).map(c => c.buyer_id))
    const uniqueUsersDay7 = new Set(contacts.filter(c => new Date(c.created_at) >= day7).map(c => c.buyer_id))
    const uniqueUsersDay30 = new Set(contacts.filter(c => new Date(c.created_at) >= day30).map(c => c.buyer_id))

    return {
        totalUsers,
        avgTimeToFirstContact: 0, // Not available without auth.users access
        medianTimeToFirstContact: 0, // Not available without auth.users access
        repeatContactRate: Math.round(repeatContactRate),
        day1Retention: totalUsers > 0 ? Math.round((uniqueUsersDay1.size / totalUsers) * 100) : 0,
        day7Retention: totalUsers > 0 ? Math.round((uniqueUsersDay7.size / totalUsers) * 100) : 0,
        day30Retention: totalUsers > 0 ? Math.round((uniqueUsersDay30.size / totalUsers) * 100) : 0
    }
}

/**
 * Get engagement funnel metrics
 */
export async function getEngagementFunnel(): Promise<EngagementFunnel> {
    const supabase = createClient()

    // Get users who made contact
    const { data: contacts } = await supabase
        .from('contact_events')
        .select('buyer_id')

    const uniqueContactUsers = new Set(contacts?.map(c => c.buyer_id) || [])
    const firstContact = uniqueContactUsers.size
    // Use contact users as proxy for signups
    const signups = firstContact

    // Get users who submitted reviews
    const { data: reviews } = await supabase
        .from('reviews')
        .select('buyer_id')

    const uniqueReviewUsers = new Set(reviews?.map(r => r.buyer_id) || [])
    const reviewSubmission = uniqueReviewUsers.size

    return {
        signups,
        firstContact,
        reviewSubmission,
        contactRate: 100, // All signup proxy users have contacted
        reviewRate: firstContact > 0 ? Math.round((reviewSubmission / firstContact) * 100) : 0
    }
}
