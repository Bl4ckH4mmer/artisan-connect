import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getArtisanWeeklyStats } from '@/lib/analytics';
import InsightsChart from '@/components/dashboard/InsightsChart';
import { ArrowUp, ArrowDown, Eye, Phone, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function InsightsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Get artisan profile
    const { data: artisan } = await supabase
        .from('artisan_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!artisan) redirect('/dashboard');

    if (!artisan.is_artisan && !artisan.id) {
        // Fallback if is_artisan check is strictly on user_profiles, but here we fetched artisan_profiles.
        // If artisan_profiles exists, they are an artisan (or pending).
    }

    const stats = await getArtisanWeeklyStats(artisan.id, supabase);

    // Calculate percentage changes
    // Helper
    const getChange = (current: number, prev: number) => {
        if (prev === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - prev) / prev) * 100);
    };

    const viewsChange = getChange(stats.profileViews.current, stats.profileViews.previous);
    const contactsChange = getChange(stats.contacts.current, stats.contacts.previous);

    // Mock chart data for now (since we don't have daily query yet)
    // In a real implementation we'd fetch daily stats.
    const chartData = [
        { name: 'Mon', views: 0, contacts: 0 },
        { name: 'Tue', views: 0, contacts: 0 },
        { name: 'Wed', views: 0, contacts: 0 },
        { name: 'Thu', views: 0, contacts: 0 },
        { name: 'Fri', views: 0, contacts: 0 },
        { name: 'Sat', views: 0, contacts: 0 },
        { name: 'Sun', views: 0, contacts: 0 },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Nav would be in Layout ideally, but replicating simple header or assuming layout wraps it.
                dashboard/page.tsx has a header. I implies I should probably use a Layout.
                But I'm creating a page. I'll assume layout handles main nav or I just render content.
                `dashboard/page.tsx` RENDERED its own header.
                I will render a simple header or back button. 
            */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Performance Insights</h1>
                        <p className="text-gray-500">Track your visibility and customer engagement</p>
                    </div>
                    <Link href="/artisan/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Views Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className={`flex items-center text-sm font-medium ${viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {viewsChange >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                {Math.abs(viewsChange)}%
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Profile Views</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.profileViews.current}</p>
                        <p className="text-xs text-gray-400 mt-2">vs {stats.profileViews.previous} last week</p>
                    </div>

                    {/* Contacts Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <span className={`flex items-center text-sm font-medium ${contactsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {contactsChange >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                {Math.abs(contactsChange)}%
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Contact Requests</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.contacts.current}</p>
                        <p className="text-xs text-gray-400 mt-2">vs {stats.contacts.previous} last week</p>
                    </div>

                    {/* Reviews Card - No trend for now as query just has 'thisWeek' vs total */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                            {/* Placeholder trend for reviews */}
                            <span className="flex items-center text-sm font-medium text-gray-400">
                                0%
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Reviews</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.reviews.total}</p>
                        <p className="text-xs text-gray-400 mt-2">{stats.reviews.thisWeek} new this week</p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900">Activity Trend</h2>
                    </div>
                    <InsightsChart data={chartData} />
                </div>
            </div>
        </div>
    );
}
