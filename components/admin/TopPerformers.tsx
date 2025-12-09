'use client'

import { Star, Phone, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface TopArtisan {
    id: string
    business_name: string
    artisan_name: string
    profile_image_url: string | null
    rating: number
    total_reviews: number
    total_contacts: number
    category: string
}

interface TopPerformersProps {
    artisans: TopArtisan[]
    sortBy?: 'rating' | 'contacts' | 'reviews'
}

export default function TopPerformers({ artisans, sortBy = 'rating' }: TopPerformersProps) {
    const getSortLabel = () => {
        switch (sortBy) {
            case 'rating': return 'by Rating'
            case 'contacts': return 'by Contacts'
            case 'reviews': return 'by Reviews'
            default: return ''
        }
    }

    const getSortValue = (artisan: TopArtisan) => {
        switch (sortBy) {
            case 'rating': return artisan.rating.toFixed(1)
            case 'contacts': return artisan.total_contacts
            case 'reviews': return artisan.total_reviews
            default: return artisan.rating.toFixed(1)
        }
    }

    const getSortIcon = () => {
        switch (sortBy) {
            case 'rating': return <Star className="w-4 h-4 text-yellow-500" />
            case 'contacts': return <Phone className="w-4 h-4 text-purple-500" />
            case 'reviews': return <MessageSquare className="w-4 h-4 text-green-500" />
            default: return <Star className="w-4 h-4 text-yellow-500" />
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
                    <p className="text-sm text-gray-600">{getSortLabel()}</p>
                </div>
            </div>

            {artisans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No artisans yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {artisans.map((artisan, index) => (
                        <Link
                            key={artisan.id}
                            href={`/artisan/${artisan.id}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                        >
                            {/* Rank Badge */}
                            <div className={`
                flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                ${index === 1 ? 'bg-gray-100 text-gray-700' : ''}
                ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                ${index > 2 ? 'bg-gray-50 text-gray-600' : ''}
              `}>
                                {index + 1}
                            </div>

                            {/* Profile Image */}
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                {artisan.profile_image_url ? (
                                    <Image
                                        src={artisan.profile_image_url}
                                        alt={artisan.artisan_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-lg">
                                        {artisan.artisan_name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Artisan Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                    {artisan.business_name}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                    {artisan.category}
                                </p>
                            </div>

                            {/* Metric */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                                {getSortIcon()}
                                <span className="font-bold text-gray-900">
                                    {getSortValue(artisan)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {artisans.length > 0 && (
                <Link
                    href="/admin/artisans"
                    className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    View All Artisans →
                </Link>
            )}
        </div>
    )
}
