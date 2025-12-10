import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, Settings, Heart, MessageSquare, ArrowRightLeft, Star } from 'lucide-react'

export default async function DashboardPage() {
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

    const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
    const isArtisan = profile?.is_artisan || false

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--warm-primary)] to-[var(--warm-secondary)] rounded-xl flex items-center justify-center">
                                <span className="text-xl">🎨</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">Artisan Connect</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {isArtisan && (
                                <Link
                                    href="/artisan/dashboard"
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Switch to Artisan View</span>
                                    <span className="sm:hidden">Switch View</span>
                                </Link>
                            )}
                            <form action="/auth/signout" method="post">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {displayName}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Manage your Artisan Connect account and discover skilled artisans.
                    </p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Browse Artisans */}
                    <Link
                        href="/search"
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--warm-primary)] to-[var(--warm-secondary)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Browse Artisans</h3>
                        <p className="text-gray-600 text-sm">Find skilled artisans for your projects</p>
                    </Link>

                    {/* Favorites */}
                    <Link
                        href="/favorites"
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                    >
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Heart className="w-6 h-6 text-pink-500" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Saved Artisans</h3>
                        <p className="text-gray-600 text-sm">View your favorite artisans</p>
                    </Link>

                    {/* Messages */}
                    <Link
                        href="/messages"
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Messages</h3>
                        <p className="text-gray-600 text-sm">Chat with artisans</p>
                    </Link>

                    {/* My Reviews */}
                    <Link
                        href="/dashboard/reviews"
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                    >
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Star className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">My Reviews</h3>
                        <p className="text-gray-600 text-sm">Manage your artisan reviews</p>
                    </Link>
                </div>

                {/* Account Section */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>

                    <div className="space-y-4">
                        <Link
                            href="/settings/delete-account"
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="font-medium text-gray-900">Account Settings</p>
                                    <p className="text-sm text-gray-500">Manage your account</p>
                                </div>
                            </div>
                            <span className="text-gray-400">→</span>
                        </Link>

                        {/* Removed duplicate Settings link - consolidated above */}

                        {!isArtisan && (
                            <Link
                                href="/become-artisan"
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--warm-bg-light)] to-orange-50 rounded-xl hover:shadow-md transition-all border border-orange-200"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎨</span>
                                    <div>
                                        <p className="font-medium text-gray-900">Become an Artisan</p>
                                        <p className="text-sm text-gray-500">List your services on Artisan Connect</p>
                                    </div>
                                </div>
                                <span className="text-[var(--warm-primary)] font-semibold">Get Started →</span>
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
