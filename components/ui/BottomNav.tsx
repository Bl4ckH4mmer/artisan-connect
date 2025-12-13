'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function BottomNav() {
    const pathname = usePathname();
    const [profileLink, setProfileLink] = useState('/login');

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    useEffect(() => {
        async function getProfileLink() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_artisan')
                .eq('user_id', user.id)
                .single();

            if (profile?.is_artisan) {
                setProfileLink('/artisan/dashboard');
            } else {
                setProfileLink('/dashboard');
            }
        }
        getProfileLink();
    }, []);

    const navItems = [
        {
            name: 'Home',
            href: '/',
            icon: Home,
        },
        {
            name: 'Search',
            href: '/search',
            icon: Search,
        },
        {
            name: 'Favorites',
            href: '/favorites',
            icon: Heart,
        },
        {
            name: 'Profile',
            href: profileLink,
            icon: User,
        },
    ];

    function cn(...inputs: (string | undefined | null | false)[]) {
        return twMerge(clsx(inputs));
    }

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[#E8D5C9] bg-[#FAF7F2]/95 backdrop-blur-md pb-safe pt-2 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-1.5 transition-all duration-300',
                                isActive
                                    ? 'text-[#C75B39] scale-105'
                                    : 'text-[#8B735B] hover:text-[#5A4030]' // Earthy brown tones instead of gray/black
                            )}
                        >
                            <Icon
                                className={cn('h-6 w-6 transition-all duration-300', isActive && '-translate-y-0.5')}
                                fill={isActive ? 'currentColor' : 'none'}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
