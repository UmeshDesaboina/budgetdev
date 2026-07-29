'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useCart } from '@/lib/store/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  Navigation,
  CreditCard,
  Truck,
  ArrowLeft,
  ChevronRight,
  PackageCheck,
  Smartphone
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CheckoutSchema, type CheckoutFormData } from '@/lib/validation/checkout';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, subtotal, cartCount, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [isLocating, setIsLocating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'prepaid'>('cod');

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const fetchCoupons = async () => {
      try {
        const q = query(collection(db, 'coupons'), where('status', '==', 'Active'));
        const querySnapshot = await getDocs(q);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setAvailableCoupons(list);
      } catch (err) {
        console.error("Failed to fetch coupons", err);
      }
    };
    fetchCoupons();
  }, [db]);

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a coupon code." });
      return;
    }
    const cpn = availableCoupons.find(c => c.code.toLowerCase() === couponCodeInput.trim().toLowerCase());
    if (!cpn) {
      toast({ variant: "destructive", title: "Invalid Coupon", description: "This coupon code does not exist or is expired." });
      return;
    }
    setAppliedCoupon(cpn);
    toast({ title: "Coupon Applied", description: `${cpn.code} applied successfully!` });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    toast({ title: "Coupon Removed" });
  };

  const shipping = subtotal >= 999 ? 0 : 99;
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'Percentage') {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    }
    return Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = Math.max(0, subtotal + shipping - discount);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Simulated reverse geocoding for prototype
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            addressLine1: 'Prestige Tech Park, Marathahalli'
          }));
          setIsLocating(false);
          toast({ title: "Found You!", description: "Address details suggested." });
        }, 1200);
      },
      () => setIsLocating(false)
    );
  };

  const handleAddressSubmit = () => {
    const valid = CheckoutSchema.safeParse(formData);
    if (!valid.success) {
      toast({ variant: "destructive", title: "Wait!", description: valid.error.errors[0].message });
      return;
    }
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    if (!db) return;
    setIsProcessing(true);
    
    try {
      const orderData = {
        userId: user?.uid || 'guest',
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity, customization: i.personalizationName })),
        total: total,
        discountAmount: discount,
        couponCode: appliedCoupon?.code || null,
        status: 'Pending',
        trackingStatus: 'Order Placed',
        shippingAddress: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        paymentMethod,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Increment usage count of applied coupon in Firestore
      if (appliedCoupon) {
        try {
          const couponDocRef = doc(db, 'coupons', appliedCoupon.id);
          await updateDoc(couponDocRef, {
            usageCount: increment(1)
          });
        } catch (couponErr) {
          console.error("Failed to update coupon usage count:", couponErr);
        }
      }

      clearCart();
      router.push(`/checkout/success?id=${docRef.id}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to place order." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
           <PackageCheck className="h-16 w-16 text-slate-200" />
           <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Bag is Empty</h2>
           <Button asChild className="rounded-full bg-indigo-600 text-white px-10 h-14"><Link href="/collections">Shop Now</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-12 lg:pt-36 lg:pb-16 max-w-6xl">
        
        {/* Progress Header */}
        <div className="flex items-center justify-center mb-8 md:mb-12 gap-4">
           <div className={cn("px-4 py-2.5 md:px-6 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all", step === 'address' ? "bg-indigo-600 text-white border-indigo-600 shadow-xl" : "bg-white text-slate-400 shadow-sm")}>1. Shipping</div>
           <div className="w-6 md:w-8 h-px bg-slate-200" />
           <div className={cn("px-4 py-2.5 md:px-6 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all", step === 'payment' ? "bg-indigo-600 text-white border-indigo-600 shadow-xl" : "bg-white text-slate-400 shadow-sm")}>2. Payment</div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6 w-full max-w-full overflow-x-hidden">
            {step === 'address' ? (
              <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="space-y-1">
                     <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Delivery Address</h2>
                     <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Provide accurate details for safe arrival</p>
                   </div>
                   <Button variant="outline" size="sm" onClick={handleDetectLocation} disabled={isLocating} className="h-10 md:h-11 rounded-xl gap-2 font-black text-[9px] md:text-[10px] uppercase border-2 self-start md:self-center">
                     {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                     Detect My Location
                   </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name *</Label>
                    <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="h-14 rounded-2xl bg-slate-50/50 border-2 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address *</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" className="h-14 rounded-2xl bg-slate-50/50 border-2 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone *</Label>
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91" className="h-14 rounded-2xl bg-slate-50/50 border-2 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pincode *</Label>
                    <Input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} maxLength={6} className="h-14 rounded-2xl bg-slate-50/50 border-2 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">House No, Building, Road *</Label>
                    <Input value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})} className="h-14 rounded-2xl bg-slate-50/50 border-2 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">City *</Label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="h-14 rounded-2xl bg-slate-50/50 border-2 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">State / Province *</Label>
                    <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="h-14 rounded-2xl bg-slate-50/50 border-2 focus-visible:ring-indigo-500" />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleAddressSubmit} className="w-full md:w-auto h-16 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-widest gap-2 shadow-xl shadow-indigo-100">
                    Continue to Payment <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-8">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Payment Selection</h2>
                    <Button variant="ghost" onClick={() => setStep('address')} className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Edit Address</Button>
                 </div>

                 <div className="grid gap-4">
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={cn("p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group", paymentMethod === 'cod' ? "border-indigo-600 bg-indigo-50/30" : "hover:border-slate-200 border-slate-100")}
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center text-indigo-500"><Truck className="h-6 w-6" /></div>
                          <span className="font-black text-sm uppercase">Cash on Delivery</span>
                       </div>
                       {paymentMethod === 'cod' && <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white"><PackageCheck className="h-4 w-4" /></div>}
                    </div>

                    <div 
                      className={cn("p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group opacity-50 cursor-not-allowed border-slate-100")}
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center text-indigo-500"><CreditCard className="h-6 w-6" /></div>
                          <span className="font-black text-sm uppercase">Online Payment (Coming Soon)</span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100">
                       <ShieldCheck className="h-5 w-5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">100% Encrypted & Safe Transaction</span>
                    </div>
                    <Button 
                      disabled={isProcessing} 
                      onClick={handlePlaceOrder}
                      className="w-full h-18 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-100"
                    >
                      {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : `Place Order (₹${total.toLocaleString()})`}
                    </Button>
                 </div>
              </div>
            )}
          </div>

          {/* Sticky Summary */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 text-slate-800 shadow-sm border border-slate-100 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
               <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 border-b border-slate-100 pb-6 text-slate-800">Bag Review <Smartphone className="h-4 w-4 text-indigo-600" /></h3>
               
               <div className="space-y-6 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                 {cart.map((item, idx) => (
                   <div key={idx} className="flex gap-4 items-center">
                     <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0"><Image src={item.image} alt={item.name} fill className="object-cover" /></div>
                     <div className="flex-1 min-w-0">
                       <p className="text-[11px] font-black uppercase truncate text-slate-800">{item.name}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Qty: {item.quantity} • {item.personalizationName || 'Standard'}</p>
                     </div>
                     <p className="text-[11px] font-black text-slate-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                   </div>
                 ))}
               </div>
               {/* Coupon Code Input & Available Coupons */}
               <div className="pt-6 border-t border-slate-100 space-y-4">
                 <div className="flex gap-2">
                   <Input 
                     type="text" 
                     placeholder="COUPON CODE" 
                     value={couponCodeInput} 
                     onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                     className="h-10 bg-slate-50 border-slate-200 text-slate-800 rounded-xl placeholder:text-slate-400 text-xs font-black uppercase tracking-wider text-center focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                   />
                   <Button 
                     onClick={handleApplyCoupon}
                     type="button"
                     className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider px-4"
                   >
                     Apply
                   </Button>
                 </div>

                 {appliedCoupon && (
                   <div className="flex justify-between items-center bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                     <span>{appliedCoupon.code} Applied!</span>
                     <button onClick={handleRemoveCoupon} className="text-slate-400 hover:text-slate-600 underline uppercase text-[8px] font-black tracking-widest ml-2">Remove</button>
                   </div>
                 )}

                 {availableCoupons && availableCoupons.length > 0 && (
                   <div className="space-y-2">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Coupons:</p>
                     <div className="flex flex-wrap gap-2">
                       {availableCoupons.map((cpn: any) => (
                         <button
                           key={cpn.id}
                           onClick={() => {
                             setCouponCodeInput(cpn.code);
                             setAppliedCoupon(cpn);
                             toast({ title: "Coupon Applied", description: `${cpn.code} applied successfully!` });
                           }}
                           className="bg-indigo-50/50 hover:bg-indigo-100/50 border border-indigo-100/50 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase text-indigo-600 tracking-wider transition-all cursor-pointer"
                         >
                           {cpn.code} ({cpn.discountType === 'Percentage' ? `${cpn.value}% OFF` : `₹${cpn.value} OFF`})
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>

               <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400"><span>Subtotal</span><span className="text-slate-800">₹{subtotal.toLocaleString()}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>
                  )}
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400"><span>Shipping</span><span className={cn(shipping === 0 ? "text-emerald-600 font-bold" : "text-slate-800")}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                     <div className="space-y-0.5">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Payable Amount</p>
                       <p className="text-3xl font-black text-slate-900">₹{total.toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </main>
  );
}
