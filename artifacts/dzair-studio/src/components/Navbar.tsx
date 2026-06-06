import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';

export default function Navbar({ cartItemCount, onCartClick }: { cartItemCount: number, onCartClick: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-[1000] bg-[rgba(5,5,8,0.9)] backdrop-blur-[15px] border-b border-[rgba(0,212,255,0.1)] px-6 py-4 flex justify-between items-center transition-all">
        <div className="font-[Orbitron] font-bold text-[#00d4ff] text-xl tracking-widest drop-shadow-[0_0_20px_rgba(0,212,255,0.5)] cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          DZAIR
        </div>
        
        <div className="hidden md:flex gap-8">
          {['SERVICES', 'PRICING', 'ORDER', 'CONTACT'].map(item => (
            <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="font-[Orbitron] text-[0.7rem] tracking-[2px] text-[#a0a8b8] hover:text-[#00d4ff] relative group">
              {item}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#00d4ff] transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button data-testid="cart-button" onClick={onCartClick} className="relative group p-2">
            <ShoppingCart className="text-[#00d4ff] group-hover:scale-110 transition-transform" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ffaa00] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
          
          <button className="md:hidden text-[#00d4ff]" onClick={() => setMobileMenuOpen(true)}>
            <Menu />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-[#050508]/90 backdrop-blur-md z-[1001] transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-end mb-12">
            <button className="text-[#00d4ff]" onClick={() => setMobileMenuOpen(false)}>
              <X size={32} />
            </button>
          </div>
          <div className="flex flex-col gap-8 items-center">
            {['SERVICES', 'PRICING', 'ORDER', 'CONTACT'].map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="font-[Orbitron] text-xl tracking-[4px] text-white hover:text-[#00d4ff]">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
