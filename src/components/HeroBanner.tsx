import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ProductCategory } from '../types';

interface HeroBannerProps {
  onExplore: (category: ProductCategory | 'all' | 'new-arrivals') => void;
}

interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  targetCategory: ProductCategory | 'all' | 'new-arrivals';
  image: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: "Festive Pret '26",
    title: 'The Royal Heritage Edit',
    subtitle: 'Hand-Worked Raw Silk & Zardozi Embellishments',
    description: 'Impeccably tailored kurtas and matching separates crafted for celebratory evenings and intimate soirees.',
    ctaText: 'Explore Ready-to-Wear',
    targetCategory: 'pret',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 2,
    tag: 'Unstitched Festive Chiffon',
    title: 'Opulent Threads & Pure Silk',
    subtitle: 'Artisanal Craftsmanship from Lahore to Multan',
    description: 'Bespoke three-piece canvases featuring tilla needlework, cutwork organza borders, and woven metallic dupattas.',
    ctaText: 'Shop Unstitched Edit',
    targetCategory: 'unstitched',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 3,
    tag: 'Bridal & Formal Splendor',
    title: 'Heirloom Velvet & Tissue Peshwas',
    subtitle: 'Gilded Antiquity in Jewel Tones',
    description: 'Architectural silhouettes rendered in deep emeralds, royal crimsons, and midnight peacock teals.',
    ctaText: 'View Formal Couture',
    targetCategory: 'formals-bridal',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1600&q=85',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const active = SLIDES[current];

  return (
    <div className="relative bg-[#181615] text-[#FAF8F5] overflow-hidden min-h-[500px] md:min-h-[580px] flex items-center">
      {/* Background Image with warm editorial gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={active.image}
          alt={active.title}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181615] via-transparent to-black/30" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24 w-full">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/60 backdrop-blur-sm text-xs font-semibold text-[#DFCA95] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{active.tag}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            {active.title}
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-[#C5A059] font-light">
            {active.subtitle}
          </p>

          <p className="text-sm sm:text-base text-stone-300 max-w-lg leading-relaxed font-light">
            {active.description}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onExplore(active.targetCategory)}
              className="px-6 py-3 bg-[#C5A059] hover:bg-[#A37F37] text-stone-950 font-semibold text-xs sm:text-sm tracking-wider uppercase rounded-sm shadow-lg hover:shadow-[#C5A059]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{active.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onExplore('all')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm text-xs sm:text-sm tracking-wider uppercase rounded-sm transition-all cursor-pointer"
            >
              Browse All
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5 px-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                current === idx ? 'w-6 bg-[#C5A059]' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
