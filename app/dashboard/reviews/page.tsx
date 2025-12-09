'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ContactedArtisan {
    artisan_id: string
    business_name: string
    artisan_name: string
    category: string
    contacted_at: string
    review_status: 'not_reviewed' | 'pending' | 'approved' | 'rejected'
    review_id?: string
    rating?: number
}

export default function BuyerReviewsPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [artisans, setArtisans] = useState<ContactedArtisan[]>([])
    const [error, setError] = useState('')

    useEffect(() => {
        loadContactedArtisans()
    }, [])

    const loadContactedArtisans = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // Get all contact events for this buyer
            const { data: contacts, error: contactError } = await supabase
                .from('contact_events')
                .select('artisan_id, created_at')
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false })

            if (contactError) throw contactError

            if (!contacts || contacts.length === 0) {
                setLoading(false)
                return
            }

            // Get unique artisan IDs
            const artisanIds = [...new Set(contacts.map(c => c.artisan_id))]

            // Load artisan details
            const { data: artisanProfiles, error: artisanError } = await supabase
                .from('artisan_profiles')
                .select('id, business_name, artisan_name, category')
                .in('id', artisanIds)

            if (artisanError) throw artisanError

            // Load reviews for these artisans by this buyer
            const { data: reviews, error: reviewError } = await supabase
                .from('reviews')
                .select('id, artisan_id, rating, status')
                .eq('buyer_id', user.id)
                .in('artisan_id', artisanIds)

            if (reviewError) throw reviewError

            // Combine data
            const artisanList: ContactedArtisan[] = artisanProfiles?.map(artisan => {
                const contact = contacts.find(c => c.artisan_id === artisan.id)
                const review = reviews?.find(r => r.artisan_id === artisan.id)

                return {
                    artisan_id: artisan.id,
                    business_name: artisan.business_name,
                    artisan_name: artisan.artisan_name,
                    category: artisan.category,
                    contacted_at: contact?.created_at || '',
                    review_status: review ? review.status as any : 'not_reviewed',
                    review_id: review?.id,
                    rating: review?.rating
                }
            }) || []

            setArtisans(artisanList)

        } catch (err: any) {
            console.error('Error loading contacted artisans:', err)
            setError('Failed to load your reviews')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'not_reviewed':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        <MessageSquare className="w-4 h-4" />
                        Not Reviewed
                    </span>
                )
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        <Clock className="w-4 h-4" />
                        Pending Approval
                    </span>
                )
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Published
                    </span>
                )
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        <XCircle className="w-4 h-4" />
                        Rejected
                    </span>
                )
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] flex items-center justify-center">
                <div className="text-gray-500">Loading your reviews...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
                    <p className="text-gray-600 mt-2">Manage reviews for artisans you've contacted</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Artisans List */}
                {artisans.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Artisans Contacted Yet</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't contacted any artisans yet. Browse artisans and contact them to leave reviews.
                        </p>
                        <Link
                            href="/search"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Browse Artisans
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {artisans.map((artisan) => (
                            <div
                                key={artisan.artisan_id}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {artisan.business_name}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {artisan.artisan_name} • {artisan.category}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Contacted on {new Date(artisan.contacted_at).toLocaleDateString()}
                                        </p>

                                        {/* Rating Display */}
                                        {artisan.rating && (
                                            <div className="flex items-center gap-1 mt-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= artisan.rating!
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {artisan.rating} stars
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(artisan.review_status)}

                                        {artisan.review_status === 'not_reviewed' ? (
                                            <Link
                                                href={`/artisan/${artisan.artisan_id}/review`}
                                                className="px-4 py-2 bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white rounded-lg font-medium hover:shadow-md transition-all"
                                            >
                                                Write Review
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/artisan/${artisan.artisan_id}`}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                                            >
                                                View Profile
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
