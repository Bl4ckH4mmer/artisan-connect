'use client'

import { useState } from 'react'
import { Search, TrendingUp, Star, Phone, Award } from 'lucide-react'
import { ArtisanPerformanceMetrics } from '@/lib/admin/analytics-queries'

interface ArtisanPerformanceTableProps {
    artisans: ArtisanPerformanceMetrics[]
}

export default function ArtisanPerformanceTable({ artisans }: ArtisanPerformanceTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'performance' | 'conversions' | 'contacts' | 'rating'>('performance')

    // Filter artisans by search term
    const filteredArtisans = artisans.filter(artisan =>
        artisan.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artisan.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort artisans
    const sortedArtisans = [...filteredArtisans].sort((a, b) => {
        switch (sortBy) {
            case 'conversions':
                return b.conversions - a.conversions
            case 'contacts':
                return b.total_contacts - a.total_contacts
            case 'rating':
                return b.rating - a.rating
            default:
                return b.performance_score - a.performance_score
        }
    })

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Artisan Performance Leaderboard</h3>
                    <p className="text-sm text-gray-600 mt-1">Top performing artisans ranked by conversion impact</p>
                </div>
                <Award className="w-8 h-8 text-orange-500" />
            </div>

            {/* Search and Sort */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search artisans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                    <option value="performance">Performance Score</option>
                    <option value="conversions">Conversions</option>
                    <option value="contacts">Contacts</option>
                    <option value="rating">Rating</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Artisan</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                <div className="flex items-center justify-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    Conversions
                                </div>
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                <div className="flex items-center justify-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    Contacts
                                </div>
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                <div className="flex items-center justify-center gap-1">
                                    <Star className="w-4 h-4" />
                                    Rating
                                </div>
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedArtisans.map((artisan, index) => (
                            <tr
                                key={artisan.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        {artisan.profile_image_url ? (
                                            <img
                                                src={artisan.profile_image_url}
                                                alt={artisan.business_name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                                {artisan.business_name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-gray-900">{artisan.business_name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                        {artisan.category}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="font-bold text-green-600">{artisan.conversions}</div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="font-semibold text-gray-900">{artisan.total_contacts}</div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                        <span className="font-semibold text-gray-900">{artisan.rating.toFixed(1)}</span>
                                        <span className="text-xs text-gray-500">({artisan.total_reviews})</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                                        {artisan.performance_score}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sortedArtisans.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No artisans found matching your search.
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Performance Score Formula:</p>
                <p className="text-xs text-gray-600">
                    Conversions (40%) + Contacts (30%) + Reviews (20%) + Rating (10%)
                </p>
            </div>
        </div>
    )
}
