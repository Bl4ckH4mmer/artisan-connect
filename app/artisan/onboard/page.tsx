'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, MapPin, Camera, Briefcase, Upload, X } from 'lucide-react'
import { ARTISAN_CATEGORIES, CATEGORY_ICONS } from '@/lib/constants/categories'
import { ESTATE_ZONES, STATES } from '@/lib/constants/locations'
import { createClient } from '@/lib/supabase/client'
import { uploadImage, uploadMultipleImages } from '@/lib/storage/upload'
import { ArtisanCategory } from '@/types/artisan'

export default function ArtisanOnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    businessName: '',
    artisanName: '',
    phoneNumber: '',
    whatsappNumber: '',
    category: '' as ArtisanCategory | '',
    skills: [] as string[],
    experienceYears: 0,
    bio: '',
    estateZone: '',
    city: 'Arepo',
    state: 'Ogun',
  })

  const [skillInput, setSkillInput] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>('')
  const [portfolioImages, setPortfolioImages] = useState<File[]>([])
  const [portfolioPreview, setPortfolioPreviews] = useState<string[]>([])

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      setProfileImagePreview(URL.createObjectURL(file))
    }
  }

  const handlePortfolioImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + portfolioImages.length > 6) {
      setError('Maximum 6 portfolio images allowed')
      return
    }

    setPortfolioImages([...portfolioImages, ...files])
    const previews = files.map(file => URL.createObjectURL(file))
    setPortfolioPreviews([...portfolioPreview, ...previews])
  }

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index))
    setPortfolioPreviews(portfolioPreview.filter((_, i) => i !== index))
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    })
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create a profile')
        setLoading(false)
        return
      }

      // Upload profile image
      let profileImageUrl = ''
      if (profileImage) {
        const result = await uploadImage(profileImage, 'profiles')
        if (result.error) {
          setError(`Failed to upload profile image: ${result.error}`)
          setLoading(false)
          return
        }
        profileImageUrl = result.url || ''
      }

      // Upload portfolio images
      let portfolioUrls: string[] = []
      if (portfolioImages.length > 0) {
        const result = await uploadMultipleImages(portfolioImages, 'portfolios')
        if (result.errors.length > 0) {
          setError(`Some portfolio images failed to upload: ${result.errors.join(', ')}`)
        }
        portfolioUrls = result.urls
      }

      // Insert artisan profile
      const { error: insertError } = await supabase
        .from('artisan_profiles')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          artisan_name: formData.artisanName,
          phone_number: formData.phoneNumber,
          whatsapp_number: formData.whatsappNumber || formData.phoneNumber,
          category: formData.category,
          skills: formData.skills,
          experience_years: formData.experienceYears,
          bio: formData.bio,
          estate_zone: formData.estateZone,
          city: formData.city,
          state: formData.state,
          profile_image: profileImageUrl,
          portfolio_images: portfolioUrls,
          status: 'pending',
          is_verified: false,
        })

      if (insertError) {
        setError(`Failed to create profile: ${insertError.message}`)
        setLoading(false)
        return
      }

      // Success - move to final step
      setStep(5)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 4

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artisan Onboarding</h1>
          <p className="text-gray-600">Join our community of skilled service providers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Indicator */}
          {step <= totalSteps && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= i ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      {i}
                    </div>
                    {i < 4 && (
                      <div className={`flex-1 h-1 mx-2 ${step > i ? 'bg-orange-500' : 'bg-gray-200'
                        }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g., John's Electrical Services"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={formData.artisanName}
                  onChange={(e) => setFormData({ ...formData, artisanName: e.target.value })}
                  placeholder="e.g., John Okafor"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+234 803 456 7890"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="Leave blank if same as phone number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ArtisanCategory })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                >
                  <option value="">Select a category</option>
                  {ARTISAN_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.businessName || !formData.artisanName || !formData.phoneNumber || !formData.category}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Location & Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 text-sm">
                ← Back
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Location & Experience</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estate/Zone *
                </label>
                <select
                  value={formData.estateZone}
                  onChange={(e) => setFormData({ ...formData, estateZone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                >
                  <option value="">Select your zone</option>
                  {ESTATE_ZONES.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                  >
                    {STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" style={{ color: '#111827' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Your Services *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your services, experience, and what makes you stand out..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!formData.estateZone || !formData.bio || formData.experienceYears < 0}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Skills & Specialties */}
          {step === 3 && (
            <div className="space-y-6">
              <button onClick={() => setStep(2)} className="text-gray-600 hover:text-gray-900 text-sm">
                ← Back
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Specialties</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Your Specific Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g., Inverter installation, Wiring, etc."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    onClick={addSkill}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Add at least 2-3 specific skills you offer
                </p>
              </div>

              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg flex items-center gap-2"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-orange-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep(4)}
                disabled={formData.skills.length < 2}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <div className="space-y-6">
              <button onClick={() => setStep(3)} className="text-gray-600 hover:text-gray-900 text-sm">
                ← Back
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile & Portfolio Photos</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {profileImagePreview ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setProfileImage(null)
                          setProfileImagePreview('')
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    Choose Photo
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Photos (Optional, max 6)
                </label>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {portfolioPreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePortfolioImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {portfolioImages.length < 6 && (
                    <label className="cursor-pointer w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePortfolioImagesChange}
                        className="hidden"
                      />
                      <Upload className="w-6 h-6 text-gray-400" />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload photos of your previous work to showcase your skills
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit for Approval'
                )}
              </button>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <span className="text-5xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-600 mb-2">
                Your artisan profile has been submitted for review.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Our admin team will verify your details and approve your profile within 24-48 hours.
                You'll receive a notification once approved.
              </p>

              <a
                href="/"
                className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg"
              >
                Back to Home
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
