'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const HERO_SLIDES = [
    {
        image: '/images/hero/electrician.png',
        title: 'Professional Electricians at Your Service.',
        description: 'From wiring to fuse boxes, connect with certified electricians for safe and reliable power.',
        color: 'from-blue-900/60'
    },
    {
        image: '/images/hero/plumber.png',
        title: 'Skilled Plumbers for Every Need.',
        description: 'Fix leaks, install fixtures, and maintain your home plumbing with trusted local experts.',
        color: 'from-orange-900/60'
    },
    {
        image: '/images/hero/mechanic.png',
        title: 'Technical Experts You Can Trust.',
        description: 'Carpenters, mechanics, and specialist artisans ready to handle your toughest projects.',
        color: 'from-gray-900/60'
    }
]

export default function HeroBanner() {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="relative w-full h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl group">
            {/* Slides */}
            {HERO_SLIDES.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 placeholder:z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-linear-to-r ${slide.color} via-black/30 to-transparent`} />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-center px-8 md:px-16 text-white max-w-3xl">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
                            {slide.title}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-100 leading-relaxed font-medium">
                            {slide.description}
                        </p>
                    </div>
                </div>
            ))}

            {/* Carousel Indicators */}
            <div className="absolute bottom-8 left-8 md:left-16 flex gap-3 z-20">
                {HERO_SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 rounded-full ${index === currentSlide
                            ? 'w-8 h-2 bg-[#C75B39]'
                            : 'w-2 h-2 bg-white/60 hover:bg-white'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
