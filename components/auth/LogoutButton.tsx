'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/supabase/auth'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <LogOut className="w-4 h-4" />
            Logout
        </button>
    )
}
