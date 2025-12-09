'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ArtisanCategory } from '@/types/artisan'

const CATEGORIES: ArtisanCategory[] = [
    'Electrician',
    'Plumber',
    'Mechanic (Auto)',
    'Generator Repair',
    'AC Technician',
    'Carpenter',
    'Painter',
    'Tiler',
    'Bricklayer',
    'Welder',
    'Roofer',
    'Cleaner',
    'Hairstylist',
    'Tailor'
]

export default function EditProfilePage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [artisanId, setArtisanId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        business_name: '',
        artisan_name: '',
        phone_number: '',
        whatsapp_number: '',
        category: '' as ArtisanCategory | '',
        experience_years: 0,
        bio: '',
        estate_zone: '',
        city: 'Arepo',
        state: 'Ogun',
        skills: [] as string[]
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
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
                .select('*')
                .eq('user_id', user.id)
                .limit(1)
                .maybeSingle()

            if (error) throw error

            if (artisanProfile) {
                setArtisanId(artisanProfile.id)
                setFormData({
                    business_name: artisanProfile.business_name || '',
                    artisan_name: artisanProfile.artisan_name || '',
                    phone_number: artisanProfile.phone_number || '',
                    whatsapp_number: artisanProfile.whatsapp_number || '',
                    category: artisanProfile.category || '',
                    experience_years: artisanProfile.experience_years || 0,
                    bio: artisanProfile.bio || '',
                    estate_zone: artisanProfile.estate_zone || '',
                    city: artisanProfile.city || 'Arepo',
                    state: artisanProfile.state || 'Ogun',
                    skills: artisanProfile.skills || []
                })
            }
        } catch (err: any) {
            console.error('Error loading profile:', err)
            setError('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skillsText = e.target.value
        const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0)
        setFormData(prev => ({ ...prev, skills: skillsArray }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
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
                    business_name: formData.business_name,
                    artisan_name: formData.artisan_name,
                    phone_number: formData.phone_number,
                    whatsapp_number: formData.whatsapp_number || formData.phone_number,
                    category: formData.category,
                    experience_years: formData.experience_years,
                    bio: formData.bio,
                    estate_zone: formData.estate_zone,
                    city: formData.city,
                    state: formData.state,
                    skills: formData.skills
                })
                .eq('id', artisanId)

            if (updateError) throw updateError

            setSuccess(true)
            setTimeout(() => {
                router.push('/artisan/dashboard')
            }, 1500)

        } catch (err: any) {
            console.error('Error updating profile:', err)
            setError(err.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--blue-bg-light)] via-white to-[var(--blue-light)] flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Loading profile...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--blue-bg-light)] via-white to-[var(--blue-light)] py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/artisan/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                    <p className="text-gray-600 mt-2">Update your business information and service details</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            Profile updated successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Business Information */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Business Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        value={formData.business_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="artisan_name"
                                        value={formData.artisan_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Service Details */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Service Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        name="experience_years"
                                        value={formData.experience_years}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Skills (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.skills.join(', ')}
                                    onChange={handleSkillsChange}
                                    placeholder="e.g., Wiring, Installation, Repairs"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio / Description
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tell potential customers about your skills and experience..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Contact Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="whatsapp_number"
                                        value={formData.whatsapp_number}
                                        onChange={handleInputChange}
                                        placeholder="Same as phone if not provided"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Location</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estate / Zone *
                                </label>
                                <input
                                    type="text"
                                    name="estate_zone"
                                    value={formData.estate_zone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Magboro, Isheri, River Valley"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--blue-primary)] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Link
                                href="/artisan/dashboard"
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
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
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
