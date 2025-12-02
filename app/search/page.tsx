'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Filter, X, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ARTISAN_CATEGORIES, CATEGORY_ICONS } from '@/lib/constants/categories'
import { ESTATE_ZONES } from '@/lib/constants/locations'
import { ArtisanProfile } from '@/types/artisan'

type SortOption = 'rating' | 'reviews' | 'contacts' | 'verified';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [showFilters, setShowFilters] = useState(false)

  const [artisans, setArtisans] = useState<ArtisanProfile[]>([])
  const [filteredArtisans, setFilteredArtisans] = useState<ArtisanProfile[]>([])
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
        setArtisans((data as ArtisanProfile[]) || [])
        setFilteredArtisans((data as ArtisanProfile[]) || [])
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Finding local artisans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, category, or skills..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 font-medium transition-all"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
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
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
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
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
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
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
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
                  className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Local Artisans</h1>
          <p className="text-gray-600">
            {filteredArtisans.length} artisan{filteredArtisans.length !== 1 ? 's' : ''} found
            {selectedCategory && ` in ${selectedCategory}`}
            {selectedZone && ` in ${selectedZone}`}
          </p>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-2">
                {CATEGORY_ICONS[selectedCategory as keyof typeof CATEGORY_ICONS]} {selectedCategory}
                <button onClick={() => setSelectedCategory('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedZone && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {selectedZone}
                <button onClick={() => setSelectedZone('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {filteredArtisans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No artisans found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtisans.map((artisan) => (
              <a
                key={artisan.id}
                href={`/artisan/${artisan.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
              >
                <div className="w-full h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg mb-4 flex items-center justify-center text-5xl">
                  {CATEGORY_ICONS[artisan.category as keyof typeof CATEGORY_ICONS] || '🔧'}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900 flex-1">{artisan.business_name}</h3>
                  {artisan.is_verified && (
                    <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{artisan.category}</p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{artisan.rating.toFixed(1)}</span>
                  <span>({artisan.total_reviews} reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{artisan.estate_zone}</span>
                </div>

                {artisan.total_contacts > 0 && (
                  <div className="text-xs text-gray-500 mb-4">
                    {artisan.total_contacts} people contacted
                  </div>
                )}

                <div className="w-full py-2 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 font-medium">
                  View Profile
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}