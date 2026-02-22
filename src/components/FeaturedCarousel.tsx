'use client'

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

interface Slide {
    id: string
    title: string
    description: string
    image_url: string
    link_url: string
}

export function FeaturedCarousel({ slides }: { slides: Slide[] }) {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )

    if (!slides || slides.length === 0) return null

    return (
        <div className="w-full justify-center flex">
            <Carousel
                opts={{ loop: true }}
                plugins={[plugin.current]}
                className="w-full max-w-5xl"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id}>
                            <a href={slide.link_url} className="block group">
                                <Card className="border-0 shadow-lg overflow-hidden group-hover:ring-4 ring-primary/20 transition-all rounded-2xl">
                                    <CardContent className="p-0 relative h-[300px] sm:h-[400px]">
                                        <img
                                            src={slide.image_url}
                                            alt={slide.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
                                            <h3 className="text-2xl sm:text-4xl font-bold mb-2 tracking-tight group-hover:underline underline-offset-4 decoration-primary">{slide.title}</h3>
                                            <p className="text-sm sm:text-lg text-slate-200 line-clamp-2 max-w-3xl">
                                                {slide.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </a>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex left-4 border-none bg-white/20 hover:bg-white/40 text-white" />
                <CarouselNext className="hidden sm:flex right-4 border-none bg-white/20 hover:bg-white/40 text-white" />
            </Carousel>
        </div>
    )
}
