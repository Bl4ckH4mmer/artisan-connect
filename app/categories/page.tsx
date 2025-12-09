'use client'

import { useState } from 'react'
import { Search, ChevronLeft } from 'lucide-react'
import { useInputGradient } from '@/lib/hooks/useInputGradient'
import { ARTISAN_CATEGORIES, CATEGORY_ICONS } from '@/lib/constants/categories'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CategoriesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const { inputClassName, isActive, inputProps } = useInputGradient(searchQuery)
    const router = useRouter()

    const filteredCategories = ARTISAN_CATEGORIES.filter(category =>
        category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCategoryClick = (category: string) => {
        // Navigate to search page with category filter
        router.push(`/search?category=${encodeURIComponent(category)}`)
    }

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href="/search"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Artisan Connect</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isActive ? 'text-white/70' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search categories..."
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${isActive ? inputClassName : 'bg-[#FAF7F2] border-transparent focus:border-[#C75B39] focus:bg-white'}`}
                            {...inputProps}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by Category</h2>

                {/* Categories Grid */}
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-600">Try a different search term</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                            >
                                {/* Category Image/Icon */}
                                <div className="relative w-full h-48 bg-gradient-to-br from-[#FFF8F0] to-[#FAE1D5] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                                    {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '🔧'}
                                </div>

                                {/* Category Name */}
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 text-center">
                                        {category}
                                    </h3>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Reviews Section Placeholder */}
                <div className="mt-12 bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Reviews</h3>
                    <p className="text-gray-600">No reviews yet.</p>
                </div>
            </div>
        </div>
    )
}
