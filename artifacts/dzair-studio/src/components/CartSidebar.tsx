import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useToast } from '@/hooks/use-toast';

type CartItem = { id: string, name: string, price: number, tier?: string };

/* ---------- validation helpers ---------- */
const LIMITS = {
  name: 60,
  phone: 9,
  email: 120,
  notes: 500,
};

function sanitize(value: string): string {
  return DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

function validatePhone(phone: string): boolean {
  return /^\d{9}$/.test(phone);
}

function validateEmail(email: string): boolean {
  if (!email) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= LIMITS.email;
}

function validateName(name: string): boolean {
  return name.length >= 2 && name.length <= LIMITS.name && /^[\p{L}\s'\-]+$/u.test(name);
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onRemove
}: {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemove: (id: string) => void;
}) {
  const [step, setStep] = useState<'cart' | 'form' | 'success'>('cart');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const setField = (field: string, raw: string, maxLen: number) => {
    const value = raw.slice(0, maxLen);
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    const firstName = sanitize(formData.firstName);
    const lastName  = sanitize(formData.lastName);
    const phone     = sanitize(formData.phone);
    const email     = sanitize(formData.email);
    const notes     = sanitize(formData.notes);

    if (!validateName(firstName)) errors.firstName = "Enter a valid first name (2–60 letters)";
    if (!validateName(lastName))  errors.lastName  = "Enter a valid last name (2–60 letters)";
    if (!validatePhone(phone))    errors.phone     = "Enter exactly 9 digits";
    if (!validateEmail(email))    errors.email     = "Enter a valid email address";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast({ title: "Validation error", description: "Please fix the highlighted fields.", variant: "destructive" });
      return;
    }

    if (cartItems.length === 0) {
      toast({ title: "Cart is empty", description: "Add at least one service.", variant: "destructive" });
      return;
    }

    const nextId  = parseInt(localStorage.getItem('dzair_order_counter') || '1');
    const orderId = "DZ-" + String(nextId).padStart(3, "0");

    const order = {
      id:        orderId,
      firstName,
      lastName,
      whatsapp:  "+213" + phone,
      email:     email || undefined,
      services:  cartItems,
      total,
      notes:     notes || undefined,
      status:    "New",
      date:      new Date().toISOString(),
      adminNotes: ""
    };

    const existing = JSON.parse(localStorage.getItem('dzair_orders') || '[]');
    existing.push(order);
    localStorage.setItem('dzair_orders', JSON.stringify(existing));
    localStorage.setItem('dzair_order_counter', String(nextId + 1));

    setStep('success');
    toast({ title: "Success", description: "Order confirmed!" });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1001]" onClick={onClose} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-[rgba(5,5,8,0.97)] backdrop-blur-[20px] border-l border-[rgba(0,212,255,0.2)] z-[1002] transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex justify-between items-center p-6 border-b border-[rgba(0,212,255,0.1)]">
          <h2 className="font-[Orbitron] text-[#00d4ff] text-xl tracking-wider">YOUR CART</h2>
          <button onClick={onClose} className="text-[#a0a8b8] hover:text-white transition-colors">
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#a0a8b8] opacity-50">
                  <ShoppingCart size={48} className="mb-4" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, i) => (
                    <div key={`${item.id}-${i}`} className="bg-[rgba(10,10,25,0.5)] p-4 border border-[rgba(0,212,255,0.1)] rounded flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        {item.tier && <p className="text-xs text-[#00d4ff]">{item.tier}</p>}
                        <p className="text-[#00ff88] mt-1">${item.price}</p>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-[#ff4444] hover:text-white p-2">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'form' && (
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* First Name */}
              <div>
                <label className="block text-xs text-[#a0a8b8] mb-1">First Name *</label>
                <input
                  required
                  type="text"
                  maxLength={LIMITS.name}
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={e => setField('firstName', e.target.value, LIMITS.name)}
                  className={`w-full bg-[#0a0a12] border rounded p-2 text-white outline-none focus:border-[#00d4ff] ${fieldErrors.firstName ? 'border-[#ff4444]' : 'border-[rgba(0,212,255,0.2)]'}`}
                />
                {fieldErrors.firstName && <p className="text-[#ff4444] text-xs mt-1">{fieldErrors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs text-[#a0a8b8] mb-1">Last Name *</label>
                <input
                  required
                  type="text"
                  maxLength={LIMITS.name}
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={e => setField('lastName', e.target.value, LIMITS.name)}
                  className={`w-full bg-[#0a0a12] border rounded p-2 text-white outline-none focus:border-[#00d4ff] ${fieldErrors.lastName ? 'border-[#ff4444]' : 'border-[rgba(0,212,255,0.2)]'}`}
                />
                {fieldErrors.lastName && <p className="text-[#ff4444] text-xs mt-1">{fieldErrors.lastName}</p>}
              </div>

              {/* WhatsApp / Phone */}
              <div>
                <label className="block text-xs text-[#a0a8b8] mb-1">WhatsApp Number *</label>
                <div className="flex">
                  <span className="bg-[#0a0a12] border border-r-0 border-[rgba(0,212,255,0.2)] rounded-l p-2 text-[#a0a8b8]">+213</span>
                  <input
                    required
                    type="tel"
                    maxLength={9}
                    pattern="\d{9}"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="555555555"
                    value={formData.phone}
                    onChange={e => setField('phone', e.target.value.replace(/\D/g, ''), LIMITS.phone)}
                    className={`w-full bg-[#0a0a12] border rounded-r p-2 text-white outline-none focus:border-[#00d4ff] ${fieldErrors.phone ? 'border-[#ff4444]' : 'border-[rgba(0,212,255,0.2)]'}`}
                  />
                </div>
                {fieldErrors.phone && <p className="text-[#ff4444] text-xs mt-1">{fieldErrors.phone}</p>}
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-xs text-[#a0a8b8] mb-1">Email (Optional)</label>
                <input
                  type="email"
                  maxLength={LIMITS.email}
                  autoComplete="email"
                  value={formData.email}
                  onChange={e => setField('email', e.target.value, LIMITS.email)}
                  className={`w-full bg-[#0a0a12] border rounded p-2 text-white outline-none focus:border-[#00d4ff] ${fieldErrors.email ? 'border-[#ff4444]' : 'border-[rgba(0,212,255,0.2)]'}`}
                />
                {fieldErrors.email && <p className="text-[#ff4444] text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Notes (optional) */}
              <div>
                <label className="block text-xs text-[#a0a8b8] mb-1">
                  Order Notes (Optional)
                  <span className="ml-2 text-[#5a6070]">{formData.notes.length}/{LIMITS.notes}</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={LIMITS.notes}
                  value={formData.notes}
                  onChange={e => setField('notes', e.target.value, LIMITS.notes)}
                  className="w-full bg-[#0a0a12] border border-[rgba(0,212,255,0.2)] rounded p-2 text-white outline-none focus:border-[#00d4ff] resize-none"
                />
              </div>

              <div className="mt-6 border-t border-[rgba(0,212,255,0.1)] pt-4">
                <h4 className="text-sm font-bold text-[#a0a8b8] mb-2">Order Summary:</h4>
                <ul className="text-xs text-[#a0a8b8] space-y-1 mb-4">
                  {cartItems.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{item.name} {item.tier && `(${item.tier})`}</span>
                      <span>${item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(0,255,136,0.1)] flex items-center justify-center border border-[#00ff88] mb-6">
                <svg className="w-8 h-8 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-[Orbitron] text-2xl text-[#00ff88] mb-2">ORDER RECEIVED!</h3>
              <p className="text-[#a0a8b8]">We will contact you on WhatsApp within 24 hours.</p>
              <button onClick={() => { setStep('cart'); onClose(); }} className="mt-8 px-6 py-2 border border-[#00d4ff] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] rounded transition-colors">
                CLOSE
              </button>
            </div>
          )}
        </div>

        {step !== 'success' && (
          <div className="p-6 border-t border-[rgba(0,212,255,0.1)] bg-[rgba(5,5,8,0.9)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#a0a8b8]">TOTAL</span>
              <span className="font-[Orbitron] text-2xl text-[#00d4ff] font-bold">${total}</span>
            </div>

            {step === 'cart' ? (
              <button
                onClick={() => setStep('form')}
                disabled={cartItems.length === 0}
                className="w-full bg-[#00d4ff] text-black font-bold py-3 rounded hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                PROCEED TO CHECKOUT
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setStep('cart')} className="px-4 py-3 border border-[#a0a8b8] text-[#a0a8b8] rounded hover:text-white hover:border-white transition-colors">
                  BACK
                </button>
                <button form="checkout-form" type="submit" className="flex-1 bg-[#00d4ff] text-black font-bold py-3 rounded hover:brightness-110 transition-all">
                  CONFIRM ORDER
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
