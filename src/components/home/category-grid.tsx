
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEFAULT_MOCK = {
  title: "Shop by Category",
  cards: [
    { title: 'BAGS', imageUrl: 'https://rohanwakkar.sirv.com/ChatGPT%20Image%20Jun%2019%2C%202026%2C%2008_56_30%20PM.png', url: '/shop/kids/bags', backgroundColor: '#F8BBD0' },
    { title: 'Bottles', imageUrl: 'https://rohanwakkar.sirv.com/ChatGPT%20Image%20Jun%2019%2C%202026%2C%2009_00_07%20PM.png', url: '/shop/kids/water-bottles', backgroundColor: '#BBDEFB' },
    { title: 'Umbrellas', imageUrl: 'https://rohanwakkar.sirv.com/ChatGPT%20Image%20Jun%2019%2C%202026%2C%2009_05_54%20PM.png', url: '/shop/kids/umbrellas', backgroundColor: '#F3E5F5' },
    { title: 'Combos', imageUrl: 'https://rohanwakkar.sirv.com/ChatGPT%20Image%20Jun%2019%2C%202026%2C%2009_08_49%20PM.png', url: '/shop/kids/combos', backgroundColor: '#B2EBF2' },
  ]
};

export function CategoryGrid({ cms }: { cms?: any }) {
  const data = cms || DEFAULT_MOCK;
  const cards = data.cards || DEFAULT_MOCK.cards;

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 md:mb-16">
          <div className="space-y-2 md:space-y-4">
            <h2 className="font-headline font-black text-3xl md:text-6xl text-slate-800 tracking-tight">
              {data.title || DEFAULT_MOCK.title}
            </h2>
            <div className="w-16 md:w-24 h-1 md:h-1.5 bg-sky-200 rounded-full" />
          </div>

          {/* Navigation Arrows */}
          {cards.length > 4 && (
            <div className="hidden md:flex gap-3 md:gap-4 pb-2">
              <Button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                variant="outline"
                size="icon"
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-slate-100 hover:border-sky-500 hover:text-sky-500 transition-all bg-white shadow-sm disabled:opacity-30"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={scrollNext}
                disabled={!canScrollNext}
                variant="outline"
                size="icon"
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-slate-100 hover:border-sky-500 hover:text-sky-500 transition-all bg-white shadow-sm disabled:opacity-30"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Grid View (2 in one line, remaining in second line) */}
        <div className="md:hidden grid grid-cols-2 gap-4">
          {cards.map((cat: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link 
                href={cat.url || '#'}
                className={cn(
                  "block rounded-[2rem] aspect-[3/4.2] relative transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border-4 border-white shadow-lg"
                )}
                style={{ backgroundColor: cat.backgroundColor || DEFAULT_MOCK.cards[i % 4]?.backgroundColor || '#F1F5F9' }}
              >
                <div className="relative z-10 p-4 flex flex-col items-center h-full text-center">
                  <h3 className={cn(
                    "font-headline font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-500",
                    "text-white drop-shadow-md mt-2"
                  )}>
                    {cat.title}
                  </h3>

                  <div className="flex-1 w-full flex items-center justify-center relative">
                    {cat.imageUrl && (
                      <div className="relative w-[110%] h-[110%] scale-110 transition-transform duration-700 group-hover:scale-125 origin-center">
                        <Image 
                          src={cat.imageUrl} 
                          alt={cat.title} 
                          fill 
                          className="object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.2)]"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>

                  <div className="w-6 h-1 rounded-full bg-white/40 group-hover:w-12 group-hover:bg-white transition-all duration-500 mb-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop Carousel View */}
        <div className="hidden md:block relative" ref={emblaRef}>
          <div className="flex -ml-4 md:-ml-8">
            {cards.map((cat: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex-[0_0_240px] md:flex-[0_0_25%] min-w-0 pl-4 md:pl-8 group"
              >
                <Link 
                  href={cat.url || '#'}
                  className={cn(
                    "block rounded-[2.5rem] md:rounded-[3.5rem] aspect-[3/5] relative transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border-4 border-white shadow-lg"
                  )}
                  style={{ backgroundColor: cat.backgroundColor || DEFAULT_MOCK.cards[i % 4]?.backgroundColor || '#F1F5F9' }}
                >
                  <div className="relative z-10 p-6 md:p-10 flex flex-col items-center h-full text-center">
                    <h3 className={cn(
                      "font-headline font-black text-[11px] md:text-sm tracking-[0.25em] uppercase transition-all duration-500",
                      "text-white drop-shadow-md mt-2 md:mt-4"
                    )}>
                      {cat.title}
                    </h3>

                    <div className="flex-1 w-full flex items-center justify-center relative">
                      {cat.imageUrl && (
                        <div className="relative w-full h-[85%] md:h-[90%] scale-125 md:scale-[1.35] transition-transform duration-700 group-hover:scale-[1.4] origin-center">
                          <Image 
                            src={cat.imageUrl} 
                            alt={cat.title} 
                            fill 
                            className="object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.25)]"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>

                    <div className="w-8 md:w-10 h-1 md:h-1.5 rounded-full bg-white/40 group-hover:w-16 md:group-hover:w-20 group-hover:bg-white transition-all duration-500 mb-2 md:mb-6" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
