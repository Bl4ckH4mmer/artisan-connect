'use client'

import { Star, MapPin, ChevronRight, Shield } from 'lucide-react'
import { ArtisanProfile } from '@/types/artisan'
import { CATEGORY_ICONS } from '@/lib/constants/categories'
import Image from 'next/image'

interface FeaturedArtisansProps {
    artisans: ArtisanProfile[]
}

export default function FeaturedArtisans({ artisans }: FeaturedArtisansProps) {
    if (artisans.length === 0) return null

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Featured Artisans</h2>
                <a
                    href="/search?featured=true"
                    className="flex items-center gap-1 text-[#C75B39] hover:text-[#D97642] font-medium text-sm"
                >
                    View all
                    <ChevronRight className="w-4 h-4" />
                </a>
            </div>

            {/* Horizontal Scrollable Container */}
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
                <div className="flex gap-4 pb-2">
                    {artisans.map((artisan) => (
                        <a
                            key={artisan.id}
                            href={`/artisan/${artisan.id}`}
                            className="card-hover flex-shrink-0 w-64 bg-gradient-to-br from-[#FAF7F2] to-white rounded-xl p-4 border border-gray-100 hover:border-[#E89560] transition-all"
                        >
                            {/* Artisan Image */}
                            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-[#C75B39] to-[#D97642]">
                                {artisan.profile_image ? (
                                    <Image
                                        src={artisan.profile_image}
                                        alt={artisan.artisan_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl">
                                        {CATEGORY_ICONS[artisan.category as keyof typeof CATEGORY_ICONS] || '🔧'}
                                    </div>
                                )}
                            </div>

                            {/* Artisan Info */}
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight flex-1">
                                        {artisan.artisan_name}
                                    </h3>
                                    {artisan.is_verified && (
                                        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-[#E89560] fill-[#E89560]" />
                                    <span className="font-semibold text-sm text-gray-900">{artisan.rating.toFixed(1)}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{artisan.estate_zone}, {artisan.state}</span>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {artisan.bio || artisan.skills.slice(0, 2).join(', ')}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}
