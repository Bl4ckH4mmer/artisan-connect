'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Activity, LogOut } from 'lucide-react'

export default function AdminNav() {
    const pathname = usePathname()

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/artisans', label: 'Artisans', icon: Users },
        { href: '/admin/activity', label: 'Activity Log', icon: Activity },
    ]

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">Admin Panel</span>
                        </div>

                        <div className="flex gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <a
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <LogOut className="w-4 h-4" />
                        Exit Admin
                    </a>
                </div>
            </div>
        </nav>
    )
}
