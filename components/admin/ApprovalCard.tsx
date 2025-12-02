'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Phone, MapPin, Briefcase, Eye } from 'lucide-react'
import { ArtisanProfile } from '@/types/artisan'
import { CATEGORY_ICONS } from '@/lib/constants/categories'

interface ApprovalCardProps {
    artisan: ArtisanProfile
    onApprove: (id: string, method: 'phone_call' | 'nin' | 'in_person') => Promise<void>
    onReject: (id: string) => Promise<void>
}

export default function ApprovalCard({ artisan, onApprove, onReject }: ApprovalCardProps) {
    const [loading, setLoading] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [verificationMethod, setVerificationMethod] = useState<'phone_call' | 'nin' | 'in_person'>('phone_call')

    const handleApprove = async () => {
        setLoading(true)
        await onApprove(artisan.id, verificationMethod)
        setLoading(false)
    }

    const handleReject = async () => {
        if (confirm(`Are you sure you want to reject ${artisan.business_name}?`)) {
            setLoading(true)
            await onReject(artisan.id)
            setLoading(false)
        }
    }

    const categoryIcon = CATEGORY_ICONS[artisan.category as keyof typeof CATEGORY_ICONS] || '🔧'

    return (
        <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 transition-colors">
            <div className="flex items-start gap-4">
                {/* Profile Image */}
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {categoryIcon}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{artisan.business_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{artisan.artisan_name}</p>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            {artisan.category}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {artisan.estate_zone}
                        </span>
                        <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {artisan.experience_years} yrs
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${artisan.phone_number}`} className="hover:text-orange-600">
                            {artisan.phone_number}
                        </a>
                    </div>

                    {/* Toggle Details */}
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                    >
                        <Eye className="w-4 h-4" />
                        {showDetails ? 'Hide' : 'View'} Details
                    </button>

                    {/* Expanded Details */}
                    {showDetails && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Bio</p>
                                <p className="text-sm text-gray-700">{artisan.bio}</p>
                            </div>

                            {artisan.skills.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Skills</p>
                                    <div className="flex flex-wrap gap-1">
                                        {artisan.skills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {artisan.portfolio_images.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Portfolio ({artisan.portfolio_images.length} images)</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {artisan.portfolio_images.slice(0, 4).map((img, i) => (
                                            <img
                                                key={i}
                                                src={img}
                                                alt={`Portfolio ${i + 1}`}
                                                className="w-full h-16 object-cover rounded"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Submitted</p>
                                <p className="text-sm text-gray-700">
                                    {new Date(artisan.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <select
                        value={verificationMethod}
                        onChange={(e) => setVerificationMethod(e.target.value as any)}
                        className="px-3 py-1 text-xs border border-gray-300 rounded"
                        disabled={loading}
                    >
                        <option value="phone_call">Phone Call</option>
                        <option value="nin">NIN Check</option>
                        <option value="in_person">In Person</option>
                    </select>

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
