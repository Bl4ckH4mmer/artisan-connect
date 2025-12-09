'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Image as ImageIcon, Loader2, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PortfolioPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [artisanId, setArtisanId] = useState<string | null>(null)

    const [profileImage, setProfileImage] = useState<string>('')
    const [portfolioImages, setPortfolioImages] = useState<string[]>([])
    const [newImageUrl, setNewImageUrl] = useState('')

    useEffect(() => {
        loadPortfolio()
    }, [])

    const loadPortfolio = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // Check if user is an artisan
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('is_artisan')
                .eq('user_id', user.id)
                .maybeSingle()

            if (profileError) {
                console.error('Profile fetch error:', profileError)
                throw profileError
            }

            if (!profile?.is_artisan) {
                router.push('/dashboard')
                return
            }

            // Load artisan profile (get first one if multiple exist)
            const { data: artisanProfile, error } = await supabase
                .from('artisan_profiles')
                .select('id, profile_image, portfolio_images')
                .eq('user_id', user.id)
                .limit(1)
                .maybeSingle()

            if (error) throw error

            if (artisanProfile) {
                setArtisanId(artisanProfile.id)
                setProfileImage(artisanProfile.profile_image || '')
                setPortfolioImages(artisanProfile.portfolio_images || [])
            }
        } catch (err: any) {
            console.error('Error loading portfolio:', err)
            setError('Failed to load portfolio')
        } finally {
            setLoading(false)
        }
    }

    const handleAddImage = () => {
        if (!newImageUrl.trim()) {
            setError('Please enter an image URL')
            return
        }

        // Basic URL validation
        try {
            new URL(newImageUrl)
        } catch {
            setError('Please enter a valid URL')
            return
        }

        setPortfolioImages(prev => [...prev, newImageUrl.trim()])
        setNewImageUrl('')
        setError('')
    }

    const handleRemoveImage = (index: number) => {
        setPortfolioImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSetProfileImage = (url: string) => {
        setProfileImage(url)
    }

    const handleSave = async () => {
        setError('')
        setSuccess('')
        setSaving(true)

        if (!artisanId) {
            setError('Artisan profile not found')
            setSaving(false)
            return
        }

        try {
            const { error: updateError } = await supabase
                .from('artisan_profiles')
                .update({
                    profile_image: profileImage,
                    portfolio_images: portfolioImages
                })
                .eq('id', artisanId)

            if (updateError) throw updateError

            setSuccess('Portfolio updated successfully!')
            setTimeout(() => setSuccess(''), 3000)

        } catch (err: any) {
            console.error('Error updating portfolio:', err)
            setError(err.message || 'Failed to update portfolio')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--blue-bg-light)] via-white to-[var(--blue-light)] flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading portfolio...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--blue-bg-light)] via-white to-[var(--blue-light)] py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/artisan/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Portfolio</h1>
                    <p className="text-gray-600 mt-2">Upload and organize your work photos</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        {success}
                    </div>
                )}

                {/* Profile Image Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Camera className="w-6 h-6 text-[var(--blue-primary)]" />
                        <h2 className="text-xl font-semibold text-gray-900">Profile Image</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                                    }}
                                />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Camera className="w-12 h-12 mx-auto mb-2" />
                                    <p className="text-sm">No profile image</p>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Image URL
                            </label>
                            <input
                                type="url"
                                value={profileImage}
                                onChange={(e) => setProfileImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Enter a direct URL to your profile image. You can also select from portfolio images below.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Portfolio Images Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <ImageIcon className="w-6 h-6 text-[var(--blue-primary)]" />
                        <h2 className="text-xl font-semibold text-gray-900">Portfolio Images</h2>
                    </div>

                    {/* Add Image Form */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add New Image
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="url"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                                placeholder="https://example.com/portfolio-image.jpg"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                            />
                            <button
                                onClick={handleAddImage}
                                className="px-6 py-3 bg-[var(--blue-primary)] text-white rounded-xl font-semibold hover:bg-[var(--blue-secondary)] transition-all flex items-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                Add
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            💡 <strong>Note:</strong> This is a placeholder for image uploads. Enter direct image URLs for now.
                            In production, you would integrate Supabase Storage or another file upload service.
                        </p>
                    </div>

                    {/* Portfolio Grid */}
                    {portfolioImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {portfolioImages.map((url, index) => (
                                <div key={index} className="relative group">
                                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                                        <img
                                            src={url}
                                            alt={`Portfolio ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E'
                                            }}
                                        />
                                    </div>

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleSetProfileImage(url)}
                                            className="px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
                                        >
                                            Set as Profile
                                        </button>
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-lg font-medium">No portfolio images yet</p>
                            <p className="text-sm mt-2">Add images to showcase your work</p>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="flex gap-4">
                    <Link
                        href="/artisan/dashboard"
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-center"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--blue-primary)] to-[var(--blue-secondary)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Save Portfolio
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
