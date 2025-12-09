'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MapPin, Filter, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ARTISAN_CATEGORIES, CATEGORY_ICONS } from '@/lib/constants/categories'
import { ESTATE_ZONES } from '@/lib/constants/locations'
import { ArtisanProfile } from '@/types/artisan'
import HeroBanner from '@/components/search/HeroBanner'
import FeaturedArtisans from '@/components/search/FeaturedArtisans'
import CategoryBrowser from '@/components/search/CategoryBrowser'
import ArtisanCard from '@/components/search/ArtisanCard'

type SortOption = 'rating' | 'reviews' | 'contacts' | 'verified';

function SearchPageContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '')
  const [selectedZone, setSelectedZone] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const [artisans, setArtisans] = useState<ArtisanProfile[]>([])
  const [filteredArtisans, setFilteredArtisans] = useState<ArtisanProfile[]>([])
  const [featuredArtisans, setFeaturedArtisans] = useState<ArtisanProfile[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchArtisans = async () => {
    try {
      const { data, error } = await supabase
        .from('artisan_profiles')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching artisans:', error)
      } else {
        const artisanData = (data as ArtisanProfile[]) || []
        setArtisans(artisanData)
        setFilteredArtisans(artisanData)

        // Get top-rated artisans for featured section (rating >= 4.0 or top 8)
        const featured = artisanData
          .filter(a => a.rating >= 4.0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8)
        setFeaturedArtisans(featured)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtisans()
  }, [])

  useEffect(() => {
    let filtered = [...artisans]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(artisan =>
        artisan.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artisan.artisan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artisan.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artisan.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(artisan => artisan.category === selectedCategory)
    }

    // Apply zone filter
    if (selectedZone) {
      filtered = filtered.filter(artisan => artisan.estate_zone === selectedZone)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'reviews':
          return b.total_reviews - a.total_reviews
        case 'contacts':
          return b.total_contacts - a.total_contacts
        case 'verified':
          return (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0)
        default:
          return 0
      }
    })

    setFilteredArtisans(filtered)
  }, [searchQuery, selectedCategory, selectedZone, sortBy, artisans])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedZone('')
    setSortBy('rating')
  }

  const activeFiltersCount = [selectedCategory, selectedZone].filter(Boolean).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#C75B39] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Finding local artisans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isSearchFocused && searchQuery.length > 0 ? 'text-white/70' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search artisans or products..."
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${isSearchFocused && searchQuery.length > 0 ? 'bg-gradient-to-r from-[#C75B39] to-[#D97642] text-white border-[#C75B39] placeholder-white/60' : 'bg-[#FAF7F2] border-transparent focus:border-[#C75B39] focus:bg-white'}`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 hover:border-[#C75B39] hover:text-[#C75B39] hover:bg-[#FFF8F0] rounded-xl flex items-center gap-2 font-medium transition-all"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C75B39] text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#C75B39] focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {ARTISAN_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Zone
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#C75B39] focus:outline-none"
                  >
                    <option value="">All Zones</option>
                    {ESTATE_ZONES.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#C75B39] focus:outline-none"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="contacts">Most Contacted</option>
                    <option value="verified">Verified First</option>
                  </select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-[#C75B39] hover:text-[#D97642] font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Banner */}
        {!searchQuery && !selectedCategory && !selectedZone && (
          <HeroBanner />
        )}

        {/* Featured Artisans */}
        {!searchQuery && !selectedCategory && !selectedZone && featuredArtisans.length > 0 && (
          <FeaturedArtisans artisans={featuredArtisans} />
        )}

        {/* Category Browser */}
        {!searchQuery && !selectedCategory && (
          <CategoryBrowser
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        )}

        {/* Active Filters Summary */}
        {(searchQuery || activeFiltersCount > 0) && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {filteredArtisans.length} artisan{filteredArtisans.length !== 1 ? 's' : ''} found
                </h2>
                {(selectedCategory || selectedZone) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCategory && `in ${selectedCategory}`}
                    {selectedCategory && selectedZone && ' • '}
                    {selectedZone && selectedZone}
                  </p>
                )}
              </div>

              {/* Active Filter Chips */}
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="px-3 py-1.5 bg-[#FFF8F0] text-[#8B4513] rounded-full text-sm font-medium flex items-center gap-2">
                    {CATEGORY_ICONS[selectedCategory as keyof typeof CATEGORY_ICONS]} {selectedCategory}
                    <button onClick={() => setSelectedCategory('')} className="hover:bg-[#FAE1D5] rounded-full p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {selectedZone && (
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> {selectedZone}
                    <button onClick={() => setSelectedZone('')} className="hover:bg-blue-200 rounded-full p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Artisans Grid */}
        {filteredArtisans.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No artisans found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[#C75B39] text-white rounded-lg hover:bg-[#D97642] font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtisans.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        )}

        {/* Back to Home Link */}
        <div className="text-center pt-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#C75B39] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}