'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Activity, LogOut, FileText, TrendingUp } from 'lucide-react'

export default function AdminNav() {
    const pathname = usePathname()

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
        { href: '/admin/artisans', label: 'Artisans', icon: Users },
        { href: '/admin/buyers', label: 'Buyers', icon: Users },
        { href: '/admin/activity', label: 'Activity Log', icon: Activity },
        { href: '/admin/reports', label: 'Reports', icon: FileText },
    ]

    return (
        <nav className="bg-[#1E3A8A] border-b border-blue-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-700 rounded-lg">
                                <LayoutDashboard className="w-5 h-5 text-blue-100" />
                            </div>
                            <span className="text-lg font-bold text-white">Admin Panel</span>
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
                                            ? 'bg-blue-700 text-white'
                                            : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden md:inline">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <a
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-200 hover:text-white"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Exit Admin</span>
                    </a>
                </div>
            </div>
        </nav>
    )
}
