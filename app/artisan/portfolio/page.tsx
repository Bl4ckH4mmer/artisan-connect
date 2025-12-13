'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Image as ImageIcon, Loader2, Camera, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/storage/upload'

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

    // File upload states
    const [uploadingProfile, setUploadingProfile] = useState(false)
    const [uploadingPortfolio, setUploadingPortfolio] = useState(false)
    const profileInputRef = useRef<HTMLInputElement>(null)
    const portfolioInputRef = useRef<HTMLInputElement>(null)

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

    // Handle profile image file upload
    const handleProfileFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB')
            return
        }

        setUploadingProfile(true)
        setError('')

        try {
            const result = await uploadImage(file, 'profiles')
            if (result.error) {
                setError(result.error)
            } else if (result.url) {
                setProfileImage(result.url)
                setSuccess('Profile image uploaded successfully!')
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err: any) {
            setError('Failed to upload image')
        } finally {
            setUploadingProfile(false)
            if (profileInputRef.current) {
                profileInputRef.current.value = ''
            }
        }
    }

    // Handle portfolio image file upload
    const handlePortfolioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploadingPortfolio(true)
        setError('')

        const uploadedUrls: string[] = []
        const errors: string[] = []

        for (const file of Array.from(files)) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                errors.push(`${file.name}: Not an image file`)
                continue
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`${file.name}: File size exceeds 5MB`)
                continue
            }

            try {
                const result = await uploadImage(file, 'portfolios')
                if (result.error) {
                    errors.push(`${file.name}: ${result.error}`)
                } else if (result.url) {
                    uploadedUrls.push(result.url)
                }
            } catch (err: any) {
                errors.push(`${file.name}: Upload failed`)
            }
        }

        if (uploadedUrls.length > 0) {
            setPortfolioImages(prev => [...prev, ...uploadedUrls])
            setSuccess(`${uploadedUrls.length} image(s) uploaded successfully!`)
            setTimeout(() => setSuccess(''), 3000)
        }

        if (errors.length > 0) {
            setError(errors.join('; '))
        }

        setUploadingPortfolio(false)
        if (portfolioInputRef.current) {
            portfolioInputRef.current.value = ''
        }
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
            <div className="min-h-screen bg-linear-to-br from-(--blue-bg-light) via-white to-(--blue-light) flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading portfolio...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-(--blue-bg-light) via-white to-(--blue-light) py-8 px-4">
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
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Camera className="w-6 h-6 text-(--blue-primary)" />
                        <h2 className="text-xl font-semibold text-gray-900">Profile Image</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative w-full md:w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 group mx-auto md:mx-0">
                            {uploadingProfile && (
                                <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
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

                            {/* Clickable overlay for upload */}
                            <button
                                onClick={() => profileInputRef.current?.click()}
                                disabled={uploadingProfile}
                                className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100"
                            >
                                <div className="bg-white/90 rounded-lg px-3 py-2 flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm font-medium">Upload</span>
                                </div>
                            </button>
                            <input
                                ref={profileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleProfileFileUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="flex-1 w-full">
                            <div className="mb-4">
                                <button
                                    onClick={() => profileInputRef.current?.click()}
                                    disabled={uploadingProfile}
                                    className="w-full px-4 py-3 bg-linear-to-r from-(--blue-primary) to-(--blue-secondary) text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {uploadingProfile ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload Profile Image
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">JPG, PNG or GIF (Max 5MB)</p>
                            </div>

                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Or enter image URL
                                </label>
                                <input
                                    type="url"
                                    value={profileImage}
                                    onChange={(e) => setProfileImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-(--blue-primary) focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    You can also select from portfolio images below.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portfolio Images Section */}
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <ImageIcon className="w-6 h-6 text-(--blue-primary)" />
                        <h2 className="text-xl font-semibold text-gray-900">Portfolio Images</h2>
                    </div>

                    {/* Add Image Form */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Add New Images
                        </label>

                        {/* File Upload Button */}
                        <div className="mb-4">
                            <button
                                onClick={() => portfolioInputRef.current?.click()}
                                disabled={uploadingPortfolio}
                                className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-(--blue-primary) hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group"
                            >
                                {uploadingPortfolio ? (
                                    <>
                                        <Loader2 className="w-6 h-6 text-(--blue-primary) animate-spin" />
                                        <span className="text-gray-600 font-medium">Uploading images...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-(--blue-primary)/10 rounded-xl flex items-center justify-center group-hover:bg-(--blue-primary)/20 transition-all">
                                            <Plus className="w-6 h-6 text-(--blue-primary)" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">Click to upload images</p>
                                            <p className="text-sm text-gray-500">JPG, PNG or GIF (Max 5MB each)</p>
                                        </div>
                                    </>
                                )}
                            </button>
                            <input
                                ref={portfolioInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePortfolioFileUpload}
                                className="hidden"
                            />
                        </div>

                        {/* URL Input (Alternative) */}
                        <div className="border-t pt-4">
                            <label className="block text-sm text-gray-600 mb-2">Or add via URL</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="url"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                                    placeholder="https://example.com/portfolio-image.jpg"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-(--blue-primary) focus:border-transparent"
                                />
                                <button
                                    onClick={handleAddImage}
                                    className="px-6 py-3 bg-(--blue-primary) text-white rounded-xl font-semibold hover:bg-(--blue-secondary) transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add
                                </button>
                            </div>
                        </div>
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
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/artisan/dashboard"
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-center"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-linear-to-r from-(--blue-primary) to-(--blue-secondary) hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
