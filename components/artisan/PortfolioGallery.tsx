'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PortfolioGalleryProps {
    images: string[]
}

export default function PortfolioGallery({ images }: PortfolioGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    if (images.length === 0) {
        return null
    }

    const openLightbox = (index: number) => {
        setSelectedIndex(index)
    }

    const closeLightbox = () => {
        setSelectedIndex(null)
    }

    const goToPrevious = () => {
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
        }
    }

    const goToNext = () => {
        if (selectedIndex !== null && selectedIndex < images.length - 1) {
            setSelectedIndex(selectedIndex + 1)
        }
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-0">
                {images.map((image, index) => (
                    <div
                        key={index}
                        onClick={() => openLightbox(index)}
                        className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl"
                    >
                        <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {selectedIndex > 0 && (
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    {selectedIndex < images.length - 1 && (
                        <button
                            onClick={goToNext}
                            className="absolute right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    <img
                        src={images[selectedIndex]}
                        alt={`Portfolio ${selectedIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                    />

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                        {selectedIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    )
}
