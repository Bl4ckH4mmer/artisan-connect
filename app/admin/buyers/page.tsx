'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Trash2, Download, User, AlertTriangle } from 'lucide-react'
import { UserProfile } from '@/types/user'
import AdminNav from '@/components/admin/AdminNav'
import { deleteUser } from '@/app/actions/admin-users'

export default function BuyersPage() {
    const router = useRouter()
    const supabase = createClient()

    const [buyers, setBuyers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        checkAdminAccess()
        fetchBuyers()
    }, [])

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.user_metadata?.role !== 'admin') {
            router.push('/')
        }
    }

    const fetchBuyers = async () => {
        try {
            setLoading(true)
            // Fetch users who are NOT artisans (or explicitly is_buyer=true)
            // Depending on Schema, we might filter by is_artisan = false
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('is_artisan', false) // Assuming buyers are non-artisans
                .order('created_at', { ascending: false })

            if (error) throw error
            setBuyers((data as UserProfile[]) || [])
        } catch (error) {
            console.error('Error fetching buyers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete ${name || 'this user'}? This action cannot be undone and complies with GDPR deletion requests.`)) return

        try {
            setDeletingId(id)
            const result = await deleteUser(id)

            if (!result.success) {
                alert(result.error || 'Failed to delete user')
                return
            }

            // Remove from local state
            setBuyers(prev => prev.filter(b => b.user_id !== id))
            alert('User deleted successfully')
        } catch (error) {
            console.error('Delete failed:', error)
            alert('Failed to delete user. Ensure you have permissions.')
        } finally {
            setDeletingId(null)
        }
    }

    const filteredBuyers = buyers.filter(buyer => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            (buyer.full_name?.toLowerCase() || '').includes(query) ||
            (buyer.email?.toLowerCase() || '').includes(query) ||
            (buyer.phone_number?.includes(query))
        )
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Buyer Management</h1>
                        <p className="text-sm text-gray-600">Manage registered buyers and GDPR requests</p>
                    </div>
                    {/* Placeholder for future export button */}
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredBuyers.length} of {buyers.length} buyers
                </div>

                {/* Buyers Table */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading buyers...</p>
                    </div>
                ) : filteredBuyers.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No buyers found</h3>
                        <p className="text-gray-600">Try adjusting your search</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBuyers.map((buyer) => (
                                        <tr key={buyer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-sm">
                                                                {buyer.full_name?.charAt(0) || '?'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {buyer.full_name || 'Unnamed User'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Role: {buyer.active_role}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{buyer.email}</div>
                                                <div className="text-sm text-gray-500">{buyer.phone_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(buyer.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDelete(buyer.user_id, buyer.full_name || 'User')}
                                                    disabled={deletingId === buyer.user_id}
                                                    className="text-red-600 hover:text-red-900 flex items-center gap-1 ml-auto disabled:opacity-50"
                                                    title="GDPR Delete"
                                                >
                                                    {deletingId === buyer.user_id ? 'Deleting...' : (
                                                        <>
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
