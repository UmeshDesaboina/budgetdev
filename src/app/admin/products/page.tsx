"use client";

import { useMemo } from 'react';
import { 
  Search, 
  Edit2, 
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CATEGORIES_META = [
  { name: 'KIDS', slug: 'kids', color: 'bg-sky-50 text-sky-600', href: '/admin/products/kids/bags' },
  { name: 'ADULTS', slug: 'adults', color: 'bg-indigo-50 text-indigo-600', href: '/admin/products/adults/mens' },
  { name: 'PERSONALISED', slug: 'personalized-gifts', color: 'bg-rose-50 text-rose-600', href: '/admin/products/personalized-gifts/mugs' },
  { name: 'ACCESSORIES', slug: 'accessories', color: 'bg-amber-50 text-amber-600', href: '/admin/products/accessories/bags' },
];

export default function AdminProductsPage() {
  const db = useFirestore();
  
  const allProductsCol = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const recentProductsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(10));
  }, [db]);
  
  const { data: allProducts } = useCollection<any>(allProductsCol);
  const { data: recentProducts } = useCollection<any>(recentProductsQuery);

  const categoryStats = useMemo(() => {
    if (!allProducts) return {};
    return allProducts.reduce((acc: any, p: any) => {
      const slug = p.category?.toLowerCase();
      acc[slug] = (acc[slug] || 0) + 1;
      return acc;
    }, {});
  }, [allProducts]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-black text-slate-800 uppercase tracking-tight">Catalog Hub</h1>
          <p className="text-sm text-slate-400 font-medium italic">Select a category from the sidebar to manage specific products.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {CATEGORIES_META.map((cat) => (
          <Link key={cat.slug} href={cat.href}>
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500 bg-white cursor-pointer">
              <CardContent className="p-8 space-y-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner", cat.color)}>
                  {cat.name[0]}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat.name}</p>
                  <h3 className="text-xl font-black text-slate-800">{categoryStats[cat.slug] || 0} Items</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-headline font-black text-slate-800 uppercase tracking-widest">Recently Added</h2>
             <div className="relative max-w-xs flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
               <Input placeholder="Quick SKU search..." className="pl-9 h-10 rounded-xl border-slate-100 text-xs" />
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
            {recentProducts && recentProducts.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentProducts.map((p: any) => (
                  <div key={p.id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                        <Image src={p.image || 'https://placehold.co/100'} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-800">{p.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.category} • {p.subcategory}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-800">₹{p.price?.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</p>
                      </div>
                      <Link href={`/admin/products/${p.category}/${p.subcategory}`}>
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 group-hover:text-indigo-600">
                           <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 italic text-sm">No recent product activity.</div>
            )}
            <div className="p-4 bg-slate-50/50 text-center">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Showing last 10 entries</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-sm rounded-[2.5rem] bg-indigo-600 p-8 text-white relative overflow-hidden group">
              <LayoutGrid className="absolute top-4 right-4 h-12 w-12 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
              <div className="relative z-10 space-y-6">
                 <h3 className="text-xl font-headline font-black uppercase tracking-widest leading-tight">Organized Cataloging</h3>
                 <p className="text-indigo-100 text-sm font-medium leading-relaxed italic">"Select a category group and choose a sub-page from the sidebar to begin adding magic."</p>
                 <div className="h-px bg-white/20 w-12" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">System Ready</p>
              </div>
           </Card>

           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Quick Tips</h3>
              <div className="space-y-4">
                 {[
                   { t: 'High Res Images', d: 'Use Unsplash or direct hosted links for best clarity.' },
                   { t: 'SEO Titles', d: 'Include keywords like "Personalized" for better reach.' },
                   { t: 'Stock Watch', d: 'Update inventory status to "Low Stock" for urgency.' }
                 ].map((tip, i) => (
                   <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 mt-1.5 shrink-0" />
                      <div>
                         <p className="text-xs font-black text-slate-700">{tip.t}</p>
                         <p className="text-[10px] text-slate-400 font-medium">{tip.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
