'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, MessageSquare, Clock, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ApprovalCard from '@/components/admin/ApprovalCard'
import ReviewModerationCard from '@/components/admin/ReviewModerationCard'
import AnalyticsWidget from '@/components/admin/AnalyticsWidget'
import ActivityFeed from '@/components/admin/ActivityFeed'
import AnalyticsCharts from '@/components/admin/AnalyticsCharts'
import TopPerformers from '@/components/admin/TopPerformers'
import AdminNav from '@/components/admin/AdminNav'
import ModalConversionChart from '@/components/admin/ModalConversionChart'
import { ArtisanProfile } from '@/types/artisan'
import { Review } from '@/types/review'
import { logAdminAction } from '@/lib/admin/audit'
import { calculateDashboardTrends } from '@/lib/admin/trends'

export default function AdminDashboard() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [pendingArtisans, setPendingArtisans] = useState<ArtisanProfile[]>([])
    const [pendingReviews, setPendingReviews] = useState<Review[]>([])
    const [stats, setStats] = useState({
        totalArtisans: 0,
        pendingApprovals: 0,
        totalReviews: 0,
        totalContacts: 0,
        avgRating: 0
    })

    // Analytics Data
    const [chartData, setChartData] = useState<any>({
        growth: [],
        reviews: [],
        contacts: [],
        categories: []
    })
    const [topArtisans, setTopArtisans] = useState<any[]>([])
    const [trends, setTrends] = useState({
        artisans: { value: 0, isPositive: true },
        reviews: { value: 0, isPositive: true },
        contacts: { value: 0, isPositive: true }
    })
    const [modalStats, setModalStats] = useState({
        conversionRate: 0,
        totalShown: 0,
        totalConverted: 0
    })
    const [modalChartData, setModalChartData] = useState<any[]>([])

    useEffect(() => {
        checkAdminAccess()
        fetchData()
    }, [])

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        // DEBUG: Show current user ID
        console.log('🔍 CURRENT USER ID:', user?.id)
        console.log('🔍 CURRENT USER EMAIL:', user?.email)
        console.log('🔍 CURRENT USER PHONE:', user?.phone)

        if (!user || user.user_metadata?.role !== 'admin') {
            router.push('/')
        }
    }

    const fetchData = async () => {
        try {
            // 1. Fetch Pending Items
            const { data: pending } = await supabase
                .from('artisan_profiles')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            setPendingArtisans((pending as ArtisanProfile[]) || [])

            const { data: reviews } = await supabase
                .from('reviews')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            setPendingReviews((reviews as Review[]) || [])

            // 2. Fetch Stats & Chart Data
            const { data: artisans } = await supabase
                .from('artisan_profiles')
                .select('id, created_at, category, rating, business_name, profile_image_url')
                .eq('status', 'active')

            const { data: allReviews } = await supabase
                .from('reviews')
                .select('id, created_at, rating')
                .eq('status', 'approved')

            const { data: contacts } = await supabase
                .from('contact_events')
                .select('id, created_at')

            // Process Stats
            const avgRating = allReviews && allReviews.length > 0
                ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
                : 0

            setStats({
                totalArtisans: artisans?.length || 0,
                pendingApprovals: pending?.length || 0,
                totalReviews: allReviews?.length || 0,
                totalContacts: contacts?.length || 0,
                avgRating: Number(avgRating.toFixed(1))
            })

            // Calculate Trends
            const calculatedTrends = calculateDashboardTrends(
                artisans || [],
                allReviews || [],
                contacts || []
            )
            setTrends(calculatedTrends)

            // Process Chart Data (Last 30 days)
            const last30Days = [...Array(30)].map((_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (29 - i))
                return d.toISOString().split('T')[0]
            })

            const growthData = last30Days.map(date => ({
                name: date,
                value: artisans?.filter(a => a.created_at.startsWith(date)).length || 0
            }))

            const reviewsData = last30Days.map(date => ({
                name: date,
                value: allReviews?.filter(r => r.created_at.startsWith(date)).length || 0
            }))

            const contactsData = last30Days.map(date => ({
                name: date,
                value: contacts?.filter(c => c.created_at.startsWith(date)).length || 0
            }))

            // Category Data
            const categoryCounts: { [key: string]: number } = {}
            artisans?.forEach(a => {
                categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1
            })
            const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
                name,
                value
            }))

            setChartData({
                growth: growthData,
                reviews: reviewsData,
                contacts: contactsData,
                categories: categoryData
            })

            // Process Top Artisans
            if (artisans) {
                const sorted = [...artisans].sort((a, b) => b.rating - a.rating).slice(0, 5)
                setTopArtisans(sorted)
            }

            // 3. Fetch Modal Conversion Data
            const { data: modalEvents } = await supabase
                .from('auth_modal_events')
                .select('event_type, created_at')

            if (modalEvents) {
                const shown = modalEvents.filter(e => e.event_type === 'modal_shown').length
                const converted = modalEvents.filter(e => e.event_type === 'modal_converted').length
                const conversionRate = shown > 0 ? Math.round((converted / shown) * 100) : 0

                setModalStats({
                    conversionRate,
                    totalShown: shown,
                    totalConverted: converted
                })

                // Process modal chart data (last 30 days)
                const modalData = last30Days.map(date => ({
                    date,
                    shown: modalEvents.filter(e => e.event_type === 'modal_shown' && e.created_at.startsWith(date)).length,
                    converted: modalEvents.filter(e => e.event_type === 'modal_converted' && e.created_at.startsWith(date)).length,
                    dismissed: modalEvents.filter(e => e.event_type === 'modal_dismissed' && e.created_at.startsWith(date)).length
                }))
                setModalChartData(modalData)
            }

        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApproveArtisan = async (id: string, method: 'phone_call' | 'nin' | 'in_person') => {
        const { data: { user } } = await supabase.auth.getUser()
        const artisan = pendingArtisans.find(a => a.id === id)

        const { error } = await supabase
            .from('artisan_profiles')
            .update({
                status: 'active',
                is_verified: true,
                verification_method: method,
                verified_at: new Date().toISOString(),
                verified_by: user?.id
            })
            .eq('id', id)

        if (!error) {
            await logAdminAction({
                action: 'approve_artisan',
                targetType: 'artisan',
                targetId: id,
                details: {
                    artisan_name: artisan?.business_name || 'Unknown',
                    verification_method: method
                }
            })

            setPendingArtisans(pendingArtisans.filter((a: any) => a.id !== id))
            setStats({ ...stats, totalArtisans: stats.totalArtisans + 1, pendingApprovals: stats.pendingApprovals - 1 })
            fetchData() // Refresh charts
        }
    }

    const handleRejectArtisan = async (id: string) => {
        const artisan = pendingArtisans.find(a => a.id === id)

        const { error } = await supabase
            .from('artisan_profiles')
            .update({ status: 'suspended' })
            .eq('id', id)

        if (!error) {
            await logAdminAction({
                action: 'reject_artisan',
                targetType: 'artisan',
                targetId: id,
                details: { artisan_name: artisan?.business_name || 'Unknown' }
            })

            setPendingArtisans(pendingArtisans.filter((a: any) => a.id !== id))
            setStats({ ...stats, pendingApprovals: stats.pendingApprovals - 1 })
        }
    }

    const handleApproveReview = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase
            .from('reviews')
            .update({
                status: 'approved',
                moderated_by: user?.id,
                moderated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (!error) {
            await logAdminAction({
                action: 'approve_review',
                targetType: 'review',
                targetId: id
            })

            setPendingReviews(pendingReviews.filter((r: any) => r.id !== id))
            setStats({ ...stats, totalReviews: stats.totalReviews + 1 })
            fetchData() // Refresh charts
        }
    }

    const handleRejectReview = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase
            .from('reviews')
            .update({
                status: 'rejected',
                moderated_by: user?.id,
                moderated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (!error) {
            await logAdminAction({
                action: 'reject_review',
                targetType: 'review',
                targetId: id
            })

            setPendingReviews(pendingReviews.filter((r: any) => r.id !== id))
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AnalyticsWidget
                        title="Total Artisans"
                        value={stats.totalArtisans}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                        trend={trends.artisans}
                    />
                    <AnalyticsWidget
                        title="Pending Approvals"
                        value={stats.pendingApprovals}
                        icon={<Clock className="w-6 h-6" />}
                        color="indigo"
                    />
                    <AnalyticsWidget
                        title="Total Reviews"
                        value={stats.totalReviews}
                        icon={<MessageSquare className="w-6 h-6" />}
                        color="green"
                        trend={trends.reviews}
                    />
                    <AnalyticsWidget
                        title="Total Contacts"
                        value={stats.totalContacts}
                        icon={<Phone className="w-6 h-6" />}
                        color="purple"
                        trend={trends.contacts}
                    />
                </div>

                {/* Modal Conversion Rate Widget */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm mb-1">Auth Modal Conversion Rate</p>
                                <p className="text-4xl font-bold">{modalStats.conversionRate}%</p>
                                <p className="text-indigo-100 text-sm mt-2">
                                    {modalStats.totalConverted} of {modalStats.totalShown} shown
                                </p>
                            </div>
                            <div className="text-6xl opacity-20">📊</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Charts Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <AnalyticsCharts
                            artisanGrowth={chartData.growth}
                            reviewSubmissions={chartData.reviews}
                            contactEvents={chartData.contacts}
                            categoryBreakdown={chartData.categories}
                        />

                        <ModalConversionChart data={modalChartData} />

                        {/* Pending Approvals */}
                        {pendingArtisans.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Pending Artisan Approvals ({pendingArtisans.length})
                                </h2>
                                <div className="space-y-4">
                                    {pendingArtisans.map((artisan) => (
                                        <ApprovalCard
                                            key={artisan.id}
                                            artisan={artisan}
                                            onApprove={handleApproveArtisan}
                                            onReject={handleRejectArtisan}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending Reviews */}
                        {pendingReviews.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Pending Review Moderation ({pendingReviews.length})
                                </h2>
                                <div className="space-y-4">
                                    {pendingReviews.map((review) => (
                                        <ReviewModerationCard
                                            key={review.id}
                                            review={review}
                                            onApprove={handleApproveReview}
                                            onReject={handleRejectReview}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        <TopPerformers artisans={topArtisans} />
                        <ActivityFeed limit={10} />
                    </div>
                </div>

                {/* Empty State (only if nothing pending) */}
                {pendingArtisans.length === 0 && pendingReviews.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center mb-8">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-600">No pending approvals or reviews to moderate.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
