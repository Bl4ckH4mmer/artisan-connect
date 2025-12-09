'use client'

import Image from 'next/image'

export default function HeroBanner() {
    return (
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
            <Image
                src="/images/hero-artisan-crafts.png"
                alt="Local artisans at work"
                fill
                className="object-cover"
                priority
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-6 md:px-12 text-white">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 max-w-2xl leading-tight">
                    Discover Unique Crafts from Local Artisans.
                </h2>
                <p className="text-base md:text-lg max-w-xl text-gray-100 leading-relaxed">
                    Connect directly with skilled craftspeople in your area offering one-of-a-kind treasures.
                </p>

                {/* Carousel Indicators */}
                <div className="flex gap-2 mt-6">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                </div>
            </div>
        </div>
    )
}
