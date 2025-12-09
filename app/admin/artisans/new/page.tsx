'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { ArtisanCategory } from '@/types/artisan'
import { logAdminAction } from '@/lib/admin/audit'
import AdminNav from '@/components/admin/AdminNav'
import DocumentUpload from '@/components/admin/DocumentUpload'
import { useToast } from '@/components/ui/Toast'

export default function NewArtisanPage() {
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')
    const [documents, setDocuments] = useState<Record<string, string>>({})

    // Form state
    const [formData, setFormData] = useState({
        business_name: '',
        artisan_name: '',
        phone_number: '',
        whatsapp_number: '',
        category: '' as ArtisanCategory | '',
        skills: '',
        experience_years: 1,
        bio: '',
        estate_zone: '',
        city: '',
        state: 'Lagos',
        profile_image: '',
        markAsVerified: false,
        verification_method: 'in_person' as 'nin' | 'phone_call' | 'in_person',
        admin_notes: ''
    })

    const categories: ArtisanCategory[] = [
        'Electrician', 'Plumber', 'Mechanic (Auto)', 'Generator Repair',
        'AC Technician', 'Carpenter', 'Painter', 'Tiler', 'Bricklayer',
        'Welder', 'Roofer', 'Cleaner', 'Hairstylist', 'Tailor'
    ]

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required'
        if (!formData.artisan_name.trim()) newErrors.artisan_name = 'Artisan name is required'
        if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required'
        else if (!/^[0-9]{11}$/.test(formData.phone_number.replace(/\s/g, ''))) {
            newErrors.phone_number = 'Phone number must be 11 digits'
        }
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required'
        if (formData.experience_years < 0) newErrors.experience_years = 'Experience must be positive'
        if (!formData.bio.trim()) newErrors.bio = 'Bio is required'
        if (!formData.estate_zone.trim()) newErrors.estate_zone = 'Estate/Zone is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size must be less than 5MB', 'error')
            return
        }

        setImageFile(file)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setImagePreview(base64String)
            setFormData({ ...formData, profile_image: base64String })
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Create artisan profile
            const { data: artisan, error } = await supabase
                .from('artisan_profiles')
                .insert({
                    user_id: user.id,
                    business_name: formData.business_name,
                    artisan_name: formData.artisan_name,
                    phone_number: formData.phone_number,
                    whatsapp_number: formData.whatsapp_number || formData.phone_number,
                    category: formData.category,
                    skills: formData.skills.split(',').map(s => s.trim()),
                    experience_years: formData.experience_years,
                    bio: formData.bio,
                    estate_zone: formData.estate_zone,
                    city: formData.city,
                    state: formData.state,
                    profile_image: formData.profile_image || null,
                    portfolio_images: [],
                    status: 'active',
                    is_verified: formData.markAsVerified,
                    verification_method: formData.markAsVerified ? formData.verification_method : null,
                    verified_at: formData.markAsVerified ? new Date().toISOString() : null,
                    verified_by: formData.markAsVerified ? user.id : null,
                    onboarded_by: user.id,
                    admin_notes: formData.admin_notes || null,
                    document_urls: Object.keys(documents).length > 0 ? documents : null,
                    rating: 0,
                    total_reviews: 0,
                    total_contacts: 0
                })
                .select()
                .single()

            if (error) throw error

            // Log the action
            await logAdminAction({
                action: 'create_artisan',
                targetType: 'artisan',
                targetId: artisan.id,
                details: {
                    artisan_name: formData.business_name,
                    category: formData.category,
                    verified: formData.markAsVerified
                }
            })

            router.push('/admin/artisans')
        } catch (error: any) {
            console.error('Error creating artisan:', error)
            showToast('Failed to create artisan: ' + error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Artisans
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Artisan</h1>
                    <p className="text-sm text-gray-600">Manually onboard an artisan to the platform</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.business_name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., John's Electrical Services"
                                />
                                {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Artisan Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.artisan_name}
                                    onChange={(e) => setFormData({ ...formData, artisan_name: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.artisan_name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., John Doe"
                                />
                                {errors.artisan_name && <p className="text-red-500 text-xs mt-1">{errors.artisan_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="08012345678"
                                />
                                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.whatsapp_number}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="08012345678 (optional)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ArtisanCategory })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Experience (Years) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.experience_years}
                                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.experience_years ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.experience_years && <p className="text-red-500 text-xs mt-1">{errors.experience_years}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Skills <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.skills ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Wiring, Installation, Repairs (comma-separated)"
                                />
                                {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Brief description of services and expertise..."
                                />
                                {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estate/Zone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.estate_zone}
                                    onChange={(e) => setFormData({ ...formData, estate_zone: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.estate_zone ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Lekki Phase 1"
                                />
                                {errors.estate_zone && <p className="text-red-500 text-xs mt-1">{errors.estate_zone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Lagos"
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="Lagos">Lagos</option>
                                    <option value="Abuja">Abuja</option>
                                    <option value="Rivers">Rivers</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Profile Image */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Image File
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                                        <Upload className="w-4 h-4 text-gray-600" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <span className="text-sm text-gray-600">Choose File</span>
                                    </label>
                                    {imageFile && (
                                        <span className="text-sm text-gray-600">
                                            {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Supported formats: JPG, PNG, GIF (max 5MB)
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">OR</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Profile Image URL
                                </label>
                                <input
                                    type="url"
                                    value={!imageFile ? formData.profile_image : ''}
                                    onChange={(e) => {
                                        setImageFile(null)
                                        setImagePreview(e.target.value)
                                        setFormData({ ...formData, profile_image: e.target.value })
                                    }}
                                    disabled={!!imageFile}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Or paste a direct URL to an image
                                </p>
                            </div>

                            {(imagePreview || formData.profile_image) && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview || formData.profile_image}
                                            alt="Profile preview"
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid%3C/text%3E%3C/svg%3E'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null)
                                                setImagePreview('')
                                                setFormData({ ...formData, profile_image: '' })
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Verification */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="markAsVerified"
                                    checked={formData.markAsVerified}
                                    onChange={(e) => setFormData({ ...formData, markAsVerified: e.target.checked })}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="markAsVerified" className="text-sm font-medium text-gray-700">
                                    Mark as verified immediately
                                </label>
                            </div>

                            {formData.markAsVerified && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Verification Method
                                    </label>
                                    <select
                                        value={formData.verification_method}
                                        onChange={(e) => setFormData({ ...formData, verification_method: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="in_person">In-Person Verification</option>
                                        <option value="phone_call">Phone Call Verification</option>
                                        <option value="nin">NIN Verification</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes (Internal)</h2>
                        <textarea
                            value={formData.admin_notes}
                            onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Internal notes about this artisan (not visible to users)..."
                        />
                    </div>

                    {/* Verification Documents */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Documents</h2>
                        <DocumentUpload
                            documents={documents}
                            onChange={setDocuments}
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Create Artisan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
