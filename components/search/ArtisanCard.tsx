'use client'

import { Star, MapPin, Shield } from 'lucide-react'
import { ArtisanProfile } from '@/types/artisan'
import { CATEGORY_ICONS } from '@/lib/constants/categories'
import Image from 'next/image'

interface ArtisanCardProps {
    artisan: ArtisanProfile
}

export default function ArtisanCard({ artisan }: ArtisanCardProps) {
    return (
        <a
            href={`/artisan/${artisan.id}`}
            className="card-hover group bg-white rounded-xl shadow-sm overflow-hidden"
        >
            {/* Image Section */}
            <div className="relative w-full h-48 bg-gradient-to-br from-[#C75B39] to-[#D97642] overflow-hidden">
                {artisan.profile_image ? (
                    <Image
                        src={artisan.profile_image}
                        alt={artisan.business_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        {CATEGORY_ICONS[artisan.category as keyof typeof CATEGORY_ICONS] || '🔧'}
                    </div>
                )}

                {/* Verified Badge */}
                {artisan.is_verified && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                        <Shield className="w-4 h-4 text-blue-500" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 space-y-3">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                        {artisan.business_name}
                    </h3>
                    <p className="text-sm text-gray-600">{artisan.category}</p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-[#E89560] fill-[#E89560]" />
                    <span className="font-semibold text-gray-900">{artisan.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({artisan.total_reviews} reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{artisan.estate_zone}</span>
                </div>

                {artisan.total_contacts > 0 && (
                    <div className="text-xs text-gray-500">
                        {artisan.total_contacts} people contacted
                    </div>
                )}

                <button className="w-full py-2.5 bg-[#C75B39] text-white text-center rounded-lg hover:bg-[#D97642] font-medium transition-colors mt-2">
                    View Profile
                </button>
            </div>
        </a>
    )
}
