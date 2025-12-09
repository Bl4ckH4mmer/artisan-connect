'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Send, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ReviewArtisanPage() {
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()
    const artisanId = params.id as string

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [artisanName, setArtisanName] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [hasContacted, setHasContacted] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/artisan/' + artisanId + '/review')
                return
            }

            setUserId(user.id)

            // Load artisan details
            const { data: artisan, error: artisanError } = await supabase
                .from('artisan_profiles')
                .select('business_name, artisan_name')
                .eq('id', artisanId)
                .limit(1)
                .maybeSingle()

            if (artisanError) throw artisanError

            if (!artisan) {
                setError('Artisan not found')
                setLoading(false)
                return
            }

            setBusinessName(artisan.business_name)
            setArtisanName(artisan.artisan_name)

            // Check if user has contacted this artisan
            const { data: contacts, error: contactError } = await supabase
                .from('contact_events')
                .select('id')
                .eq('buyer_id', user.id)
                .eq('artisan_id', artisanId)
                .limit(1)

            if (contactError) throw contactError

            setHasContacted(contacts && contacts.length > 0)

        } catch (err: any) {
            console.error('Error loading data:', err)
            setError('Failed to load artisan details')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        if (!userId) {
            setError('You must be logged in')
            setSubmitting(false)
            return
        }

        if (rating === 0) {
            setError('Please select a rating')
            setSubmitting(false)
            return
        }

        if (!comment.trim()) {
            setError('Please write a comment')
            setSubmitting(false)
            return
        }

        try {
            const { error: insertError } = await supabase
                .from('reviews')
                .insert({
                    artisan_id: artisanId,
                    buyer_id: userId,
                    rating: rating,
                    comment: comment.trim(),
                    is_verified_hire: hasContacted,
                    status: 'pending'
                })

            if (insertError) throw insertError

            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard/reviews')
            }, 2000)

        } catch (err: any) {
            console.error('Error submitting review:', err)
            setError(err.message || 'Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading...
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-green-600 fill-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your feedback. Your review is pending approval and will be visible once approved by our team.
                    </p>
                    <Link
                        href="/dashboard/reviews"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        View My Reviews
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/artisan/${artisanId}`}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Profile
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Write a Review</h1>
                    <p className="text-gray-600 mt-2">Share your experience with {businessName}</p>
                </div>

                {/* Review Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {!hasContacted && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> You haven't contacted this artisan yet. Your review will be marked as unverified.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Artisan Info */}
                        <div className="pb-6 border-b">
                            <h3 className="font-semibold text-lg text-gray-900">{businessName}</h3>
                            <p className="text-gray-600 text-sm">by {artisanName}</p>
                        </div>

                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Your Rating *
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${star <= (hoverRating || rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-sm text-gray-600 mt-2">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review *
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={6}
                                required
                                placeholder="Share your experience with this artisan. What did they do well? What could be improved?"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent resize-none"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                {comment.length} characters
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Link
                                href={`/artisan/${artisanId}`}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
