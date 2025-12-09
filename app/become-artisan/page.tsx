'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Phone, MapPin, FileText, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react'
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

export default function BecomeArtisanPage() {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [error, setError] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    // Form data
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

    // Check if user is logged in and not already an artisan
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/become-artisan')
                return
            }

            setUserId(user.id)

            // Check if already an artisan
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_artisan')
                .eq('user_id', user.id)
                .single()

            if (profile?.is_artisan) {
                router.push('/artisan/dashboard')
                return
            }

            // Pre-fill name from user profile
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('full_name')
                .eq('user_id', user.id)
                .single()

            if (userProfile?.full_name) {
                setFormData(prev => ({ ...prev, artisan_name: userProfile.full_name }))
            }

            setChecking(false)
        }

        checkUser()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        setError('')
        setLoading(true)

        if (!userId) {
            setError('You must be logged in')
            setLoading(false)
            return
        }

        // Validate required fields
        if (!formData.business_name || !formData.artisan_name || !formData.phone_number || !formData.category || !formData.estate_zone) {
            setError('Please fill in all required fields')
            setLoading(false)
            return
        }

        try {
            // 1. Insert artisan profile
            const { error: insertError } = await supabase
                .from('artisan_profiles')
                .insert({
                    user_id: userId,
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
                    skills: formData.skills,
                    status: 'pending' // Requires admin approval
                })

            if (insertError) {
                throw insertError
            }

            // 2. Update user_profiles to mark as artisan
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    is_artisan: true,
                    active_role: 'artisan'
                })
                .eq('user_id', userId)

            if (updateError) {
                throw updateError
            }

            // 3. Redirect to artisan dashboard
            router.push('/artisan/dashboard?welcome=true')

        } catch (err: any) {
            console.error('Error creating artisan profile:', err)
            setError(err.message || 'Failed to create artisan profile')
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => {
        if (step === 1 && (!formData.business_name || !formData.artisan_name)) {
            setError('Please fill in your business and artisan name')
            return
        }
        if (step === 2 && !formData.category) {
            setError('Please select a category')
            return
        }
        if (step === 3 && (!formData.phone_number || !formData.estate_zone)) {
            setError('Please fill in your phone and location')
            return
        }
        setError('')
        setStep(step + 1)
    }

    const prevStep = () => {
        setError('')
        setStep(step - 1)
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] flex items-center justify-center">
                <div className="text-gray-500">Checking eligibility...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Become an Artisan</h1>
                    <p className="text-gray-600">Join our network and connect with customers in your area</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= s
                                        ? 'bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                                </div>
                                {s < 4 && <div className={`w-12 h-1 mx-2 ${step > s ? 'bg-[var(--warm-primary)]' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Briefcase className="w-6 h-6 text-[var(--warm-primary)]" />
                                <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                                <input
                                    type="text"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., John's Electrical Services"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                                <input
                                    type="text"
                                    name="artisan_name"
                                    value={formData.artisan_name}
                                    onChange={handleInputChange}
                                    placeholder="Your full name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Service Category */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="w-6 h-6 text-[var(--warm-primary)]" />
                                <h2 className="text-xl font-semibold text-gray-900">Your Service</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                >
                                    <option value="">Select a category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                <input
                                    type="number"
                                    name="experience_years"
                                    value={formData.experience_years}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Description</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tell potential customers about your skills and experience..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact & Location */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Phone className="w-6 h-6 text-[var(--warm-primary)]" />
                                <h2 className="text-xl font-semibold text-gray-900">Contact & Location</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 08012345678"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number (optional)</label>
                                <input
                                    type="tel"
                                    name="whatsapp_number"
                                    value={formData.whatsapp_number}
                                    onChange={handleInputChange}
                                    placeholder="Same as phone if not provided"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estate / Zone *</label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="estate_zone"
                                        value={formData.estate_zone}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Magboro, Isheri, River Valley"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle className="w-6 h-6 text-[var(--warm-primary)]" />
                                <h2 className="text-xl font-semibold text-gray-900">Review Your Information</h2>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Business Name:</span>
                                        <p className="font-medium text-gray-900">{formData.business_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Your Name:</span>
                                        <p className="font-medium text-gray-900">{formData.artisan_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Category:</span>
                                        <p className="font-medium text-gray-900">{formData.category}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Experience:</span>
                                        <p className="font-medium text-gray-900">{formData.experience_years} years</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Phone:</span>
                                        <p className="font-medium text-gray-900">{formData.phone_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Location:</span>
                                        <p className="font-medium text-gray-900">{formData.estate_zone}, {formData.city}</p>
                                    </div>
                                </div>
                                {formData.bio && (
                                    <div>
                                        <span className="text-gray-500 text-sm">Bio:</span>
                                        <p className="text-gray-900 text-sm mt-1">{formData.bio}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Your profile will be reviewed by our team before becoming visible to customers. This usually takes 1-2 business days.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                className="px-6 py-3 bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                Continue
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
