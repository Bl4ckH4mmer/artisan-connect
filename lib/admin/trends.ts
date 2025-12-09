// Utility functions for calculating trends

export interface TrendData {
    value: number
    isPositive: boolean
}

/**
 * Calculate percentage change between current and previous period
 * @param current - Count in current period
 * @param previous - Count in previous period
 * @returns Trend data with percentage and direction
 */
export function calculateTrend(current: number, previous: number): TrendData {
    if (previous === 0) {
        return {
            value: current > 0 ? 100 : 0,
            isPositive: current >= 0
        }
    }

    const percentChange = ((current - previous) / previous) * 100

    return {
        value: Math.abs(Math.round(percentChange)),
        isPositive: percentChange >= 0
    }
}

/**
 * Calculate trends for dashboard metrics
 * Compares last 30 days vs previous 30 days
 */
export function calculateDashboardTrends(
    artisans: any[],
    reviews: any[],
    contacts: any[]
) {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previous60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Artisan trend
    const recentArtisans = artisans?.filter((a: any) =>
        new Date(a.created_at) >= last30Days
    ).length || 0

    const previousArtisans = artisans?.filter((a: any) => {
        const date = new Date(a.created_at)
        return date >= previous60Days && date < last30Days
    }).length || 0

    // Review trend
    const recentReviews = reviews?.filter((r: any) =>
        new Date(r.created_at) >= last30Days
    ).length || 0

    const previousReviews = reviews?.filter((r: any) => {
        const date = new Date(r.created_at)
        return date >= previous60Days && date < last30Days
    }).length || 0

    // Contact trend
    const recentContacts = contacts?.filter((c: any) =>
        new Date(c.created_at) >= last30Days
    ).length || 0

    const previousContacts = contacts?.filter((c: any) => {
        const date = new Date(c.created_at)
        return date >= previous60Days && date < last30Days
    }).length || 0

    return {
        artisans: calculateTrend(recentArtisans, previousArtisans),
        reviews: calculateTrend(recentReviews, previousReviews),
        contacts: calculateTrend(recentContacts, previousContacts)
    }
}
