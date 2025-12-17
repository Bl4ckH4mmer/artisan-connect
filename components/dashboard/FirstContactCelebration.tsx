'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FirstContactCelebration({ artisanId }: { artisanId: string }) {
    const [show, setShow] = useState(false);
    const [notificationId, setNotificationId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkNotifications = async () => {
            const { data, error } = await supabase
                .from('artisan_notifications')
                .select('*')
                .eq('artisan_id', artisanId)
                .eq('type', 'first_contact')
                .eq('read', false)
                .limit(1)
                .single();

            if (data && !error) {
                setNotificationId(data.id);
                setShow(true);
                // Trigger confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#C75B39', '#FFD700', '#FFFFFF']
                });
            }
        };

        checkNotifications();
    }, [artisanId, supabase]);

    const handleClose = async () => {
        setShow(false);
        if (notificationId) {
            // Mark as read
            await supabase
                .from('artisan_notifications')
                .update({ read: true })
                .eq('id', notificationId);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PartyPopper className="w-8 h-8 text-yellow-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        First Lead Detected!
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Congratulations! A potential client just tried to contact you. This is a huge milestone.
                    </p>

                    <div className="bg-[#FFF8F0] border border-[#f5e6d8] rounded-xl p-4 mb-6 text-left">
                        <h3 className="font-semibold text-[#8B4513] mb-1">What to do next:</h3>
                        <ul className="text-sm text-[#8B4513]/80 space-y-2 list-disc pl-4">
                            <li>Check your <strong>Contacts</strong> tab immediately.</li>
                            <li>Respond quickly to secure the job.</li>
                            <li>Ask for a review after completing the work.</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full py-3 bg-[#C75B39] text-white rounded-xl font-medium hover:bg-[#D97642] transition-colors shadow-lg shadow-[#C75B39]/20"
                    >
                        Awesome, let's go!
                    </button>
                </div>
            </div>
        </div>
    );
}
