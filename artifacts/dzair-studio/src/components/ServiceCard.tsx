import React from 'react';
import { ShoppingCart } from 'lucide-react';

type ServiceCardProps = {
  icon: any;
  title: string;
  price: number;
  features: string[];
  serviceKey: string;
  enabled: boolean;
  number: string;
  onAdd: () => void;
};

export default function ServiceCard({
  icon: Icon,
  title,
  price,
  features,
  serviceKey,
  enabled,
  number,
  onAdd
}: ServiceCardProps) {
  return (
    <div className="w-[600px] h-[380px] max-w-[90vw] bg-[rgba(10,10,25,0.9)] backdrop-blur-[20px] border border-[rgba(0,212,255,0.2)] rounded-2xl flex flex-col md:flex-row overflow-hidden shrink-0">
      <div className="w-full md:w-1/3 h-32 md:h-full bg-[rgba(0,212,255,0.05)] flex items-center justify-center border-b md:border-b-0 md:border-r border-[rgba(0,212,255,0.1)] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.2)_0%,transparent_70%)]" />
        <Icon size={64} className="text-[#00d4ff] relative z-10 drop-shadow-[0_0_15px_rgba(0,212,255,0.8)]" />
      </div>
      <div className="w-full md:w-2/3 p-6 md:p-8 relative flex flex-col justify-between">
        <span className="absolute top-4 right-4 font-[Orbitron] text-5xl md:text-6xl opacity-10 text-[#00d4ff] font-bold pointer-events-none">{number}</span>
        
        <div>
          <h3 className="font-[Orbitron] text-lg md:text-xl text-white font-bold mb-2 tracking-wider pr-12">{title}</h3>
          <p className="text-[#00ff88] font-bold text-lg mb-4">FROM ${price}</p>
          
          <ul className="space-y-2 mb-6">
            {features.map((f, i) => (
              <li key={i} className="flex items-center text-xs md:text-sm text-[#a0a8b8]">
                <span className="text-[#00d4ff] mr-2 text-lg leading-none">&bull;</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        
        {enabled ? (
          <button 
            onClick={onAdd}
            className="w-full py-3 bg-[rgba(0,212,255,0.1)] hover:bg-[#00d4ff] text-[#00d4ff] hover:text-black border border-[#00d4ff] rounded font-[Orbitron] tracking-widest text-sm font-bold transition-all duration-300 shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
          >
            ADD TO CART
          </button>
        ) : (
          <button disabled className="w-full py-3 bg-[#1a1a24] text-[#5a6070] border border-[#5a6070] rounded font-[Orbitron] tracking-widest text-sm font-bold cursor-not-allowed">
            COMING SOON
          </button>
        )}
      </div>
    </div>
  );
}
