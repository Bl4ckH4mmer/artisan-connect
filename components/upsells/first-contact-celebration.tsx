
'use client';

import { useState, useEffect } from 'react';
import { PartyPopper as Party, Zap, X } from 'lucide-react'; // Changed Party to PartyPopper as Party might not exist in lucide-react default export or named export
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface FirstContactCelebrationProps {
    open: boolean;
    onClose: () => void;
    artisanLocation: string;
}

export function FirstContactCelebration({
    open,
    onClose,
    artisanLocation
}: FirstContactCelebrationProps) {
    const router = useRouter();
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (open) {
            setShowConfetti(true);
            // Stop confetti after 5 seconds
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const handleBoostClick = async () => {
        // Log upsell impression
        await fetch('/api/analytics/upsell-impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                triggerType: 'boost_after_contact',
                converted: true
            })
        });

        router.push('/artisan/boost/upgrade');
        onClose();
    };

    const handleDismiss = async () => {
        // Log impression (dismissed)
        await fetch('/api/analytics/upsell-impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                triggerType: 'boost_after_contact',
                converted: false
            })
        });

        onClose();
    };

    return (
        <>
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={200}
                />
            )}

            <Dialog open={open} onOpenChange={handleDismiss}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Party className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-2xl">
                            🎉 Great News!
                        </DialogTitle>
                        <DialogDescription className="text-base space-y-3 pt-2">
                            <p className="text-gray-900 font-medium">
                                A buyer just contacted you via WhatsApp!
                            </p>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-amber-900">
                                        <p className="font-semibold mb-1">
                                            Want more clients like this?
                                        </p>
                                        <p>
                                            Artisans who appear in the <strong>top 3 search results</strong> get{' '}
                                            <strong className="text-amber-700">4× more contacts</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600">
                                Boost your profile in <strong>{artisanLocation}</strong> to rank higher
                                and get more job opportunities.
                            </p>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            onClick={handleBoostClick}
                            className="w-full bg-amber-600 hover:bg-amber-700"
                            size="lg"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Boost My Profile
                        </Button>

                        <Button
                            onClick={handleDismiss}
                            variant="ghost"
                            size="sm"
                        >
                            Maybe later
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
