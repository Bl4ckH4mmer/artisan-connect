
'use client';

import { useState, useEffect } from 'react';
import { FirstContactCelebration } from '@/components/upsells/first-contact-celebration';

interface MilestoneCheckWrapperProps {
    artisanId: string;
    artisanLocation: string;
}

export default function MilestoneCheckWrapper({ artisanId, artisanLocation }: MilestoneCheckWrapperProps) {
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        const checkMilestones = async () => {
            try {
                const response = await fetch('/api/analytics/check-milestone', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        artisanId,
                        milestoneType: 'first_contact',
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.shouldShowUpsell) {
                        setShowCelebration(true);
                    }
                }
            } catch (error) {
                console.error('Error checking milestones:', error);
            }
        };

        checkMilestones();
    }, [artisanId]);

    return (
        <FirstContactCelebration
            open={showCelebration}
            onClose={() => setShowCelebration(false)}
            artisanLocation={artisanLocation}
        />
    );
}
