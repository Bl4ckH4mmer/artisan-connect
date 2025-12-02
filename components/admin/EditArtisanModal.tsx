'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Save, Upload } from 'lucide-react'
import { ArtisanCategory } from '@/types/artisan'
import { logAdminAction } from '@/lib/admin/audit'

interface EditArtisanModalProps {
    artisanId: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function EditArtisanModal({ artisanId, isOpen, onClose, onSuccess }: EditArtisanModalProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')

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
        is_verified: false,
        verification_method: 'in_person' as 'nin' | 'phone_call' | 'in_person',
        admin_notes: '',
        status: 'active' as 'pending' | 'active' | 'suspended'
    })

    const categories: ArtisanCategory[] = [
        'Electrician', 'Plumber', 'Mechanic (Auto)', 'Generator Repair',
        'AC Technician', 'Carpenter', 'Painter', 'Tiler', 'Bricklayer',
        'Welder', 'Roofer', 'Cleaner', 'Hairstylist', 'Tailor'
    ]

    useEffect(() => {
        if (isOpen && artisanId) {
            loadArtisanData()
        }
    }, [isOpen, artisanId])

    const loadArtisanData = async () => {
        setLoadingData(true)
        try {
            const { data, error } = await supabase
                .from('artisan_profiles')
                .select('*')
                .eq('id', artisanId)
                .single()

            if (error) throw error

            setFormData({
                business_name: data.business_name || '',
                artisan_name: data.artisan_name || '',
                phone_number: data.phone_number || '',
                whatsapp_number: data.whatsapp_number || '',
                category: data.category || '',
                skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
                experience_years: data.experience_years || 1,
                bio: data.bio || '',
                estate_zone: data.estate_zone || '',
                city: data.city || '',
                state: data.state || 'Lagos',
                profile_image: data.profile_image || '',
                is_verified: data.is_verified || false,
                verification_method: data.verification_method || 'in_person',
                admin_notes: data.admin_notes || '',
                status: data.status || 'active'
            })

            setImagePreview(data.profile_image || '')
        } catch (error) {
            console.error('Error loading artisan:', error)
            alert('Failed to load artisan data')
        } finally {
            setLoadingData(false)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required'
        if (!formData.artisan_name.trim()) newErrors.artisan_name = 'Artisan name is required'
        if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required'
        if (!formData.bio.trim()) newErrors.bio = 'Bio is required'
        if (!formData.estate_zone.trim()) newErrors.estate_zone = 'Estate/Zone is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB')
            return
        }

        setImageFile(file)

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

        if (!validateForm()) return

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('artisan_profiles')
                .update({
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
                    is_verified: formData.is_verified,
                    verification_method: formData.is_verified ? formData.verification_method : null,
                    verified_at: formData.is_verified ? new Date().toISOString() : null,
                    verified_by: formData.is_verified ? user.id : null,
                    admin_notes: formData.admin_notes || null,
                    status: formData.status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', artisanId)

            if (error) throw error

            // Log the action
            await logAdminAction({
                action: 'edit_artisan',
                targetType: 'artisan',
                targetId: artisanId,
                details: {
                    artisan_name: formData.business_name,
                    changes: 'Profile updated'
                }
            })

            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Error updating artisan:', error)
            alert('Failed to update artisan: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Edit Artisan</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                {loadingData ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto" />
                        <p className="text-gray-600 mt-4">Loading artisan data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
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
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Service Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
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
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors w-fit">
                                        <Upload className="w-4 h-4 text-gray-600" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <span className="text-sm text-gray-600">Upload New Image</span>
                                    </label>
                                </div>

                                {(imagePreview || formData.profile_image) && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview || formData.profile_image}
                                                alt="Profile"
                                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
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

                        {/* Status & Verification */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Verification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-3 mt-7">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_verified}
                                            onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Verified</span>
                                    </label>
                                </div>

                                {formData.is_verified && (
                                    <div className="md:col-span-2">
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes (Internal)</h3>
                            <textarea
                                value={formData.admin_notes}
                                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Internal notes about this artisan..."
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
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
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
