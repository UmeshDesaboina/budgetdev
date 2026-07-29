"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Ticket, 
  Undo2,
  Search, 
  Gift,
  ChevronRight,
  LogOut,
  ChevronDown,
  Sparkles,
  Baby,
  UserCircle,
  Shapes,
  FolderOpen,
  Wand2,
  PawPrint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const CATALOG_GROUPS = [
  {
    label: 'NEW',
    icon: Sparkles,
    hrefPrefix: '/admin/products/new',
    items: [
      { label: 'New Collection', sub: 'new-collection' },
      { label: 'New Launch', sub: 'new-launch' },
      { label: 'Best Sellers', sub: 'best-sellers' },
      { label: 'Festive', sub: 'festive' },
    ]
  },
  {
    label: 'PERSONALISED GIFTS',
    icon: Gift,
    hrefPrefix: '/admin/products/personalized-gifts',
    items: [
      { label: 'Mugs', sub: 'mugs' },
      { label: 'Bottles', sub: 'bottles' },
      { label: 'Passport Covers', sub: 'passport-covers' },
      { label: 'Laptop Bags', sub: 'laptop-bags' },
      { label: 'Travel Cases', sub: 'travel-cases' },
      { label: 'Corporate Gifts', sub: 'corporate-gifts' },
    ]
  },
  {
    label: 'KIDS',
    icon: Baby,
    hrefPrefix: '/admin/products/kids',
    items: [
      { label: 'School Bags', sub: 'bags' },
      { label: 'Water Bottles', sub: 'water-bottles' },
      { label: 'Lunch Boxes', sub: 'lunch-boxes' },
      { label: 'Umbrellas', sub: 'umbrellas' },
      { label: 'Combos', sub: 'combos' },
      { label: 'Gift Sets', sub: 'kids-gifts' },
      { label: 'Stationery', sub: 'stationery' },
      { label: 'Toys', sub: 'toys' },
    ]
  },
  {
    label: 'ADULTS',
    icon: UserCircle,
    hrefPrefix: '/admin/products/adults',
    items: [
      { label: 'Mens', sub: 'mens' },
      { label: 'Womens', sub: 'womens' },
      { label: 'Unisex', sub: 'unisex' },
    ]
  },
  {
    label: 'ACCESSORIES',
    icon: Shapes,
    hrefPrefix: '/admin/products/accessories',
    items: [
      { label: 'Bags', sub: 'bags' },
      { label: 'Travel Accessories', sub: 'travel-combo' },
      { label: 'Gift Boxes', sub: 'gift-boxes' },
      { label: 'Combos', sub: 'combos' },
      { label: 'Desk Accessories', sub: 'desk' },
    ]
  },
  {
    label: 'PETS',
    icon: PawPrint,
    hrefPrefix: '/admin/products/pets',
    items: [
      { label: 'Pet Bowls', sub: 'pet-bowls' },
      { label: 'Pet Tags', sub: 'pet-tags' },
      { label: 'Pet Bands', sub: 'pet-bands' },
      { label: 'Pet Toys', sub: 'pet-toys' },
      { label: 'Pet Clothes', sub: 'pet-clothes' },
      { label: 'Pet Accessories', sub: 'pet-accessories' },
    ]
  },
];

const CORE_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'All Products', href: '/admin/products', icon: FolderOpen },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Custom AI Orders', href: '/admin/customized-orders', icon: Wand2 },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'RTO Management', href: '/admin/rto', icon: Undo2 },
  { label: 'SEO Settings', href: '/admin/seo', icon: Search },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
      <div className="p-8 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Gift className="h-6 w-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-headline font-black text-xl text-slate-800 tracking-tighter">Admin<span className="text-indigo-600 italic">Studio</span></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">GiftArt Management</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {/* Core Management Items */}
        <div className="space-y-1 mb-6">
          {CORE_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </div>

        {/* Catalog Category Groups */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Store Catalog</p>
          
          {CATALOG_GROUPS.map((group) => {
            const isGroupOpen = openGroups.includes(group.label) || pathname.startsWith(group.hrefPrefix);
            
            return (
              <Collapsible
                key={group.label}
                open={isGroupOpen}
                onOpenChange={() => toggleGroup(group.label)}
                className="space-y-1"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold text-sm">
                  <div className="flex items-center gap-3">
                    <group.icon className="h-5 w-5 text-slate-400" />
                    <span className="tracking-tight">{group.label}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isGroupOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-10 pr-2 pb-2">
                  {group.items.map((item) => {
                    const href = `${group.hrefPrefix}/${item.sub}`;
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={item.sub}
                        href={href}
                        className={cn(
                          "block px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                          isActive 
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                            : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </nav>

      <div className="p-6 border-t border-slate-50 shrink-0">
        <button
          onClick={() => signOut(auth).then(() => router.push('/admin/login'))}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
        >
          <LogOut className="h-5 w-5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
