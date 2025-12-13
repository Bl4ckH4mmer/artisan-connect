import { createClient } from '@/lib/supabase/server'
import { CATEGORY_ICONS } from '@/lib/constants/categories'
import ContactButtons from '@/components/artisan/ContactButtons'
import PortfolioGallery from '@/components/artisan/PortfolioGallery'
import PhoneDisplay from '@/components/artisan/PhoneDisplay'
import { notFound } from 'next/navigation'
import FavoriteButton from '@/components/shared/FavoriteButton'
import { Shield, Briefcase, Star, MapPin } from 'lucide-react'

export default async function ArtisanProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch artisan profile
    const { data: artisan, error } = await supabase
        .from('artisan_profiles')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single()

    if (error || !artisan) {
        notFound()
    }

    // Fetch reviews
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('artisan_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10)


    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    let hasContacted = false
    if (user) {
        const { data: contacts } = await supabase
            .from('contact_events')
            .select('id')
            .eq('buyer_id', user.id)
            .eq('artisan_id', id)
            .limit(1)

        hasContacted = contacts && contacts.length > 0 ? true : false
    }

    const categoryIcon = CATEGORY_ICONS[artisan.category as keyof typeof CATEGORY_ICONS] || '🔧'

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div className="h-64 bg-linear-to-br from-[#C75B39] via-[#D97642] to-[#B04A2C] flex items-center justify-center text-8xl">
                {categoryIcon}
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-16 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-6 z-10">
                            {/* Profile Image */}
                            <div className="relative w-full h-64">
                                <div className="absolute top-4 left-4 z-20">
                                    <FavoriteButton artisanId={id} size="lg" />
                                </div>
                                {artisan.profile_image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={artisan.profile_image}
                                        alt={artisan.business_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center text-6xl">
                                        {categoryIcon}
                                    </div>
                                )}
                                {artisan.is_verified && (
                                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {artisan.business_name}
                                </h1>
                                <p className="text-gray-600 mb-4">{artisan.artisan_name}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-3 py-1 bg-[#FFF8F0] text-[#8B4513] rounded-full text-sm font-medium">
                                        {categoryIcon} {artisan.category}
                                    </span>
                                    {artisan.is_verified && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                                            <Shield className="w-3 h-3" />
                                            Verified
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        {artisan.experience_years} years
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                                            <Star className="w-4 h-4 fill-amber-500" />
                                            <span className="text-lg font-bold text-gray-900">
                                                {artisan.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{artisan.total_reviews} reviews</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg font-bold text-gray-900 mb-1">
                                            {artisan.total_contacts}
                                        </div>
                                        <p className="text-xs text-gray-600">Contacts</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-center mb-1">
                                            <MapPin className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <p className="text-xs text-gray-600">{artisan.estate_zone}</p>
                                    </div>
                                </div>

                                {/* Contact Buttons */}
                                <ContactButtons
                                    artisanId={artisan.id}
                                    artisanName={artisan.artisan_name}
                                    phoneNumber={artisan.phone_number}
                                    whatsappNumber={artisan.whatsapp_number}
                                />

                                {/* Contact Info */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-3">Contact Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Location</p>
                                                <p className="font-medium text-gray-900">{artisan.estate_zone}</p>
                                                <p className="text-sm text-gray-600">
                                                    {artisan.city}, {artisan.state}
                                                </p>
                                            </div>
                                        </div>
                                        <PhoneDisplay phoneNumber={artisan.phone_number} artisanId={artisan.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                            <p className="text-gray-700 leading-relaxed">{artisan.bio}</p>
                        </div>

                        {/* Skills Section */}
                        {artisan.skills && artisan.skills.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Skills & Specialties</h2>
                                <div className="flex flex-wrap gap-2">
                                    {artisan.skills.map((skill: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-[#FFF8F0] text-[#8B4513] rounded-lg font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Portfolio Section */}
                        {artisan.portfolio_images && artisan.portfolio_images.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio</h2>
                                <PortfolioGallery images={artisan.portfolio_images} />
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Reviews ({artisan.total_reviews})
                                </h2>
                                {hasContacted && (
                                    <a
                                        href={`/artisan/${id}/review`}
                                        className="px-4 py-2 bg-linear-to-r from-[#C75B39] to-[#D97642] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all flex items-center gap-2"
                                    >
                                        <Star className="w-4 h-4 fill-white" />
                                        Write a Review
                                    </a>
                                )}
                            </div>
                            {reviews && reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review: any) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    ?
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900">Anonymous Buyer</p>
                                                        {review.is_verified_hire && (
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                                Verified Hire
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating
                                                                        ? 'text-[#E89560] fill-[#E89560]'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-700">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No reviews yet. Be the first to review this artisan!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <a href="/search" className="text-sm text-gray-600 hover:text-gray-900">
                        ← Back to Search
                    </a>
                </div>
            </div>
        </div>
    )
}