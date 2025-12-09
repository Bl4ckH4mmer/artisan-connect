import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ArrowRightLeft, Eye, Phone, Star, Pause, Play, Edit, Image } from 'lucide-react'
import AvailabilityToggle from '@/components/artisan/AvailabilityToggle'

export default async function ArtisanDashboardPage() {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/login')
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // Check if user is an artisan
    if (!profile?.is_artisan) {
        redirect('/dashboard')
    }

    // Fetch artisan profile
    const { data: artisanProfile } = await supabase
        .from('artisan_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const displayName = artisanProfile?.artisan_name || profile?.full_name || 'Artisan'
    const businessName = artisanProfile?.business_name || 'Your Business'

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--blue-bg-light)] via-white to-[var(--blue-light)]">
            {/* Header */}
            <header className="bg-[var(--blue-primary)] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-xl">🎨</span>
                            </div>
                            <span className="font-bold text-xl">Artisan Connect</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                            >
                                <ArrowRightLeft className="w-4 h-4" />
                                Switch to Buyer View
                            </Link>
                            <form action="/auth/signout" method="post">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {businessName}
                        </h1>
                        <p className="text-gray-600">
                            Welcome back, {displayName}! Manage your artisan profile and services.
                        </p>
                    </div>

                    {/* Availability Toggle */}
                    <AvailabilityToggle
                        artisanId={artisanProfile?.id}
                        initialStatus={artisanProfile?.status || 'active'}
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                                <p className="text-gray-500 text-sm">Profile Views</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Phone className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{artisanProfile?.total_contacts || 0}</p>
                                <p className="text-gray-500 text-sm">Contact Requests</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{artisanProfile?.rating?.toFixed(1) || '0.0'}</p>
                                <p className="text-gray-500 text-sm">{artisanProfile?.total_reviews || 0} Reviews</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link
                        href="/artisan/edit-profile"
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[var(--blue-light)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Edit className="w-6 h-6 text-[var(--blue-primary)]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Edit Profile</h3>
                                <p className="text-gray-500 text-sm">Update your bio, skills, and contact info</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/artisan/portfolio"
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Image className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">Manage Portfolio</h3>
                                <p className="text-gray-500 text-sm">Add photos of your work</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent activity to display.</p>
                        <p className="text-sm mt-2">When buyers contact you or leave reviews, it will appear here.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
