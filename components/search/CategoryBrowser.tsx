'use client'

import { ARTISAN_CATEGORIES, CATEGORY_ICONS } from '@/lib/constants/categories'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CategoryBrowserProps {
    selectedCategory: string
    onCategorySelect: (category: string) => void
}

export default function CategoryBrowser({ selectedCategory, onCategorySelect }: CategoryBrowserProps) {
    // Show only first 4 categories on main page
    const displayedCategories = ARTISAN_CATEGORIES.slice(0, 4)

    // Map categories to their specific image files
    const CATEGORY_IMAGES: Record<string, string> = {
        'Electrician': '/categories/electrical.png',
        'Plumber': '/categories/plumbing.png',
        'Mechanic (Auto)': '/categories/mechanic.png',
        'Generator Repair': '/categories/generator.png',
        'Carpenter': '/categories/carpentry.png',
        'Painter': '/categories/painting.png',
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
                <Link
                    href="/categories"
                    className="flex items-center gap-1 text-[#C75B39] hover:text-[#D97642] font-medium text-sm transition-colors"
                >
                    View all
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Single row of 4 categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayedCategories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategorySelect(category)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all hover:bg-[#FAF7F2] ${selectedCategory === category ? 'bg-[#FFF8F0] ring-2 ring-[#C75B39]' : ''
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all overflow-hidden ${selectedCategory === category
                            ? 'shadow-lg ring-2 ring-[#C75B39]'
                            : 'bg-linear-to-br from-gray-100 to-gray-200'
                            }`}>
                            {CATEGORY_IMAGES[category] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={`${CATEGORY_IMAGES[category]}?v=2`}
                                    alt={category}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to emoji if image fails
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerText = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '🔧';
                                        e.currentTarget.parentElement!.className = 'w-20 h-20 rounded-full flex items-center justify-center transition-all overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 text-4xl';
                                    }}
                                />
                            ) : (
                                <span className="text-4xl">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '🔧'}</span>
                            )}
                        </div>
                        <span className={`text-sm font-medium text-center ${selectedCategory === category ? 'text-[#8B4513]' : 'text-gray-700'
                            }`}>
                            {category}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
