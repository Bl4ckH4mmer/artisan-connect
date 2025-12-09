'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, UserPlus, Download, Edit, Ban, CheckCircle, XCircle } from 'lucide-react'
import { ArtisanProfile } from '@/types/artisan'
import { exportArtisansToCSV } from '@/lib/admin/export'
import { logAdminAction } from '@/lib/admin/audit'
import AdminNav from '@/components/admin/AdminNav'
import EditArtisanModal from '@/components/admin/EditArtisanModal'

type FilterStatus = 'all' | 'active' | 'pending' | 'suspended'
type FilterVerified = 'all' | 'verified' | 'unverified'

export default function ArtisansPage() {
    const router = useRouter()
    const supabase = createClient()

    const [artisans, setArtisans] = useState<ArtisanProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
    const [verifiedFilter, setVerifiedFilter] = useState<FilterVerified>('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [exporting, setExporting] = useState(false)
    const [editingArtisan, setEditingArtisan] = useState<string | null>(null)

    useEffect(() => {
        checkAdminAccess()
        fetchArtisans()
    }, [statusFilter, verifiedFilter, categoryFilter])

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/')
            return
        }

        // Check if user exists in admin_users table
        const { data: adminUsers, error } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', user.id)

        // If no admin record found or error, redirect
        if (error || !adminUsers || adminUsers.length === 0) {
            console.error('Admin check failed:', error)
            router.push('/')
        }
    }

    const fetchArtisans = async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('artisan_profiles')
                .select('*')
                .order('created_at', { ascending: false })

            // Apply filters
            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }
            if (verifiedFilter === 'verified') {
                query = query.eq('is_verified', true)
            } else if (verifiedFilter === 'unverified') {
                query = query.eq('is_verified', false)
            }
            if (categoryFilter !== 'all') {
                query = query.eq('category', categoryFilter)
            }

            const { data, error } = await query

            if (error) throw error
            setArtisans((data as ArtisanProfile[]) || [])
        } catch (error) {
            console.error('Error fetching artisans:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSuspend = async (id: string, artisanName: string) => {
        if (!confirm(`Are you sure you want to suspend ${artisanName}?`)) return

        const { error } = await supabase
            .from('artisan_profiles')
            .update({ status: 'suspended' })
            .eq('id', id)

        if (!error) {
            await logAdminAction({
                action: 'suspend_artisan',
                targetType: 'artisan',
                targetId: id,
                details: { artisan_name: artisanName }
            })
            fetchArtisans()
        }
    }

    const handleActivate = async (id: string, artisanName: string) => {
        const { error } = await supabase
            .from('artisan_profiles')
            .update({ status: 'active' })
            .eq('id', id)

        if (!error) {
            await logAdminAction({
                action: 'activate_artisan',
                targetType: 'artisan',
                targetId: id,
                details: { artisan_name: artisanName }
            })
            fetchArtisans()
        }
    }

    const handleExport = async () => {
        try {
            setExporting(true)
            const filters: any = {}
            if (statusFilter !== 'all') filters.status = statusFilter
            if (categoryFilter !== 'all') filters.category = categoryFilter
            if (verifiedFilter === 'verified') filters.is_verified = true
            if (verifiedFilter === 'unverified') filters.is_verified = false

            await exportArtisansToCSV(filters)
            await logAdminAction({
                action: 'export_artisans',
                targetType: 'artisan',
                details: { filters }
            })
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export artisans')
        } finally {
            setExporting(false)
        }
    }

    const filteredArtisans = artisans.filter(artisan => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            artisan.business_name.toLowerCase().includes(query) ||
            artisan.artisan_name.toLowerCase().includes(query) ||
            artisan.phone_number.includes(query) ||
            artisan.estate_zone.toLowerCase().includes(query)
        )
    })

    const categories = [
        'Electrician', 'Plumber', 'Mechanic (Auto)', 'Generator Repair',
        'AC Technician', 'Carpenter', 'Painter', 'Tiler', 'Bricklayer',
        'Welder', 'Roofer', 'Cleaner', 'Hairstylist', 'Tailor'
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Artisan Management</h1>
                        <p className="text-sm text-gray-600">Manage all artisan profiles</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            onClick={() => router.push('/admin/artisans/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Artisan
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone, or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        {/* Verified Filter */}
                        <div>
                            <select
                                value={verifiedFilter}
                                onChange={(e) => setVerifiedFilter(e.target.value as FilterVerified)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Verification</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mt-4">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredArtisans.length} of {artisans.length} artisans
                </div>

                {/* Artisans Table */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading artisans...</p>
                    </div>
                ) : filteredArtisans.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No artisans found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Artisan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredArtisans.map((artisan) => (
                                        <tr key={artisan.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {artisan.business_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {artisan.artisan_name} • {artisan.phone_number}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{artisan.category}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{artisan.estate_zone}</div>
                                                <div className="text-sm text-gray-500">{artisan.city}, {artisan.state}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {artisan.rating.toFixed(1)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        ({artisan.total_reviews})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${artisan.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        artisan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {artisan.status}
                                                    </span>
                                                    {artisan.is_verified && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingArtisan(artisan.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit Artisan"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {artisan.status === 'suspended' ? (
                                                        <button
                                                            onClick={() => handleActivate(artisan.id, artisan.business_name)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Activate"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSuspend(artisan.id, artisan.business_name)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Suspend"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Edit Artisan Modal */}
                {editingArtisan && (
                    <EditArtisanModal
                        artisanId={editingArtisan}
                        isOpen={!!editingArtisan}
                        onClose={() => setEditingArtisan(null)}
                        onSuccess={() => {
                            setEditingArtisan(null)
                            fetchArtisans()
                        }}
                    />
                )}
            </div>
        </div>
    )
}
