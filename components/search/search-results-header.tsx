import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SearchResultsHeaderProps {
    totalResults: number;
    boostedCount: number;
    location?: string;
}

export function SearchResultsHeader({
    totalResults,
    boostedCount,
    location
}: SearchResultsHeaderProps) {
    return (
        <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    {totalResults} {totalResults === 1 ? 'Artisan' : 'Artisans'} Found
                </h2>
            </div>

            {/* Boosted Artisans Notice */}
            {boostedCount > 0 && (
                <Alert className="bg-amber-50 border-amber-200">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm text-amber-900">
                        <strong>{boostedCount}</strong> top-rated{' '}
                        {location && `artisans in ${location}`} are featured at the top.
                        {' '}These professionals have been verified and prioritized for quality.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
