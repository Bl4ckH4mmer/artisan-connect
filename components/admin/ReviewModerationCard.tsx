'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Star, Eye } from 'lucide-react'
import { Review } from '@/types/review'

interface ReviewModerationCardProps {
    review: Review & { artisan_name?: string; buyer_name?: string }
    onApprove: (id: string) => Promise<void>
    onReject: (id: string) => Promise<void>
}

export default function ReviewModerationCard({ review, onApprove, onReject }: ReviewModerationCardProps) {
    const [loading, setLoading] = useState(false)

    const handleApprove = async () => {
        setLoading(true)
        await onApprove(review.id)
        setLoading(false)
    }

    const handleReject = async () => {
        if (confirm('Are you sure you want to reject this review?')) {
            setLoading(true)
            await onReject(review.id)
            setLoading(false)
        }
    }

    return (
        <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 transition-colors">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{review.rating}/5</span>
                        {review.is_verified_hire && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Verified Hire
                            </span>
                        )}
                    </div>

                    {/* Review Content */}
                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div>
                            <span className="font-medium">For:</span> {review.artisan_name || 'Unknown Artisan'}
                        </div>
                        <div>
                            <span className="font-medium">By:</span> Anonymous Buyer
                        </div>
                        <div>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(review.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 text-sm font-medium"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                    </button>

                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 text-sm font-medium"
                    >
                        <XCircle className="w-4 h-4" />
                        Reject
                    </button>
                </div>
            </div>
        </div>
    )
}
