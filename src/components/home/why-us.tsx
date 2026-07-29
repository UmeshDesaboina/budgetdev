'use client';

import { motion } from 'framer-motion';
import { Star, Smile, Heart } from 'lucide-react';

const DEFAULT_MOCK = {
  title: "Why Choose Us",
  description: "Enduring with this spirit where sky is even not the limit, GiftArtStudio continues to add sunshine in the lives of your darling rainbows.",
  cards: [
    { title: 'Exclusive Collections', description: 'On our toes with the ever evolving dynamics and keeping up the exclusivity.', iconUrl: '/images/why-choose-us/exclusive-collections.svg' },
    { title: 'Happiness Guaranteed', description: 'Unbox sheer excitement and joy wrapped within each of our offerings.', iconUrl: '/images/why-choose-us/happiness-guaranteed.svg' },
    { title: 'We Care', description: 'Designing customised and child-friendly products to promote imagination and life-skills.', iconUrl: '/images/why-choose-us/we-care.svg' }
  ]
};

const FallbackIcons = [Star, Smile, Heart];

export function WhyUs({ cms }: { cms?: any }) {
  const data = cms || DEFAULT_MOCK;
  const cards = data.cards?.slice(0, 3) || DEFAULT_MOCK.cards;

  return (
    <section className="hidden md:block py-12 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12 space-y-3">
          <span className="text-[12px] font-black text-sky-500 uppercase tracking-[0.3em] block">
            OUR PROMISE
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {data.title || DEFAULT_MOCK.title}
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium pt-2">
            {data.description || DEFAULT_MOCK.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {cards.map((feature: any, i: number) => {
            const IconComp = FallbackIcons[i] || Heart;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center space-y-6 group"
              >
                <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center text-sky-600 transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-inner">
                  {feature.iconUrl ? (
                    <img src={feature.iconUrl} alt={feature.title} className="w-10 h-10 object-contain" />
                  ) : (
                    <IconComp className="w-10 h-10" />
                  )}
                </div>
                <h4 className="text-xl md:text-2xl font-black text-slate-800">
                  {feature.title}
                </h4>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium px-4 italic">
                  "{feature.description}"
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}