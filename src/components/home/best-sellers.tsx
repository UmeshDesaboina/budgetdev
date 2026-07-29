
"use client";

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// The high-resolution background provided by the user
const BG_ARTWORK = "https://res.cloudinary.com/drjrbb4yn/image/upload/v1782027359/kids-image_pn17nh.png";

// Reference image exact colors
const CARD_THEMES = [
  { bg: 'bg-[#FFF0D9]', pill: 'bg-[#FF6B95]' }, // Peach
  { bg: 'bg-[#E8F8F0]', pill: 'bg-[#FF6B95]' }, // Mint Green
  { bg: 'bg-[#FFEAF6]', pill: 'bg-[#FF6B95]' }, // Soft Pink
];

export function BestSellers({ cms }: { cms?: any }) {
  const db = useFirestore();

  const bestSellersQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('isBestSeller', '==', true),
      limit(3)
    );
  }, [db]);

  const { data: products, loading } = useCollection<any>(bestSellersQuery);

  return (
    <section className="hidden md:block relative bg-white overflow-hidden">
      {/* 
        Container designed to maintain image aspect ratio without distortion.
        The padding and margins are adjusted to let the cards sit on the "floor" of the background.
      */}
      <div className="relative w-full max-w-[1440px] mx-auto overflow-hidden">
        {/* Background Image Layer */}
        <div className="relative w-full aspect-[1440/1000]">
          <Image 
            src={BG_ARTWORK} 
            alt="Best Sellers" 
            fill 
            className="object-contain object-top"
            priority
            unoptimized
          />
        </div>

        {/* Product Cards Overlay - Positioned exactly as per reference */}
        <div className="absolute bottom-[5%] left-0 right-0 z-10 px-6">
          <div className="container mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-3 gap-6 lg:gap-12 max-w-6xl mx-auto w-full">
                {products.map((p: any, i: number) => {
                  const theme = CARD_THEMES[i % CARD_THEMES.length];
                  return (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={cn(
                        "group cursor-pointer rounded-[3rem] overflow-hidden shadow-2xl flex flex-col transition-all hover:-translate-y-2 duration-300",
                        theme.bg
                      )}
                    >
                      <Link href={`/product/${p.id}`} className="flex flex-col h-full">
                        {/* Product Image Area - High Padding for Rounded Look */}
                        <div className="p-6 pb-2">
                          <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-white shadow-sm border border-black/5">
                            <Image 
                              src={p.image} 
                              alt={p.name} 
                              fill 
                              className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                              unoptimized 
                            />
                          </div>
                        </div>
                        
                        {/* Product Info Area - Centered and Bold as per Screenshot */}
                        <div className="p-6 pt-4 pb-12 flex-1 flex flex-col items-center justify-between text-center space-y-6">
                          <h3 className="font-black text-slate-800 text-[14px] lg:text-[16px] leading-tight uppercase tracking-tight max-w-[200px]">
                            {p.name}
                          </h3>
                          
                          {/* Signature Pink Pill Footer */}
                          <div className={cn(
                            "flex items-center justify-center w-28 h-7 md:h-9 rounded-full shadow-lg shadow-black/5 transition-all duration-500 group-hover:w-36 group-hover:brightness-110 text-white font-black text-[10px] md:text-[12px] uppercase tracking-widest",
                            theme.pill
                          )}>
                            BUY NOW
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-xs italic">
                Gathering the Studio Favourites...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
