import { useState, useEffect, useRef } from "react";
import {
  Code2, ShoppingCart, Camera, Play, MousePointer, ClipboardList,
  Rocket, Shield, Zap, DollarSign, Package, MapPin, Mail, ArrowLeft, ArrowRight,
  ChevronUp, Check, Menu, X
} from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import ParticleCanvas from "@/components/ParticleCanvas";
import CartSidebar from "@/components/CartSidebar";

type CartItem = { id: string; name: string; price: number; tier?: string };
type ServiceSettings = { landingPages: boolean; ecommerceStores: boolean; aiImages: boolean; aiVideos: boolean };

const SERVICES = [
  {
    key: "landingPages",
    icon: Code2,
    number: "01",
    title: "CUSTOM LANDING PAGES",
    desc: "Hand-coded landing pages with blazing speed, bulletproof security, and Meta Pixel optimization. Built specifically for COD conversion in the Algerian market.",
    price: 50,
    features: ["Zero WordPress", "No monthly fees", "Sub-2s load time", "COD-ready forms"],
  },
  {
    key: "ecommerceStores",
    icon: ShoppingCart,
    number: "02",
    title: "CUSTOM E-COMMERCE STORES",
    desc: "Fully custom-coded online stores with a powerful admin dashboard, product management, and order tracking. Zero monthly subscriptions forever.",
    price: 500,
    features: ["Custom admin panel", "No Shopify fees", "COD + CIB/Dahabia", "Unlimited products"],
  },
  {
    key: "aiImages",
    icon: Camera,
    number: "03",
    title: "AI PRODUCT PHOTOGRAPHY",
    desc: "Transform ordinary product photos into cinematic, high-end advertising visuals using advanced Generative AI. No photo shoot required.",
    price: 30,
    features: ["Cinematic quality", "Multiple style variations", "24-48h delivery", "No studio needed"],
  },
  {
    key: "aiVideos",
    icon: Play,
    number: "04",
    title: "AI VIDEO ADVERTISING",
    desc: "Generate stunning promotional videos with AI — from scroll-stopping hook ads to full storytelling campaigns that dramatically boost CTR.",
    price: 50,
    features: ["Hook-based ads", "AI UGC style", "Storytelling format", "48h delivery"],
  },
];

const PRICING_INDIVIDUAL = [
  {
    category: "LANDING PAGES",
    key: "landingPages",
    tiers: [{ name: "Basic", price: 50 }, { name: "Professional", price: 100 }, { name: "Cinematic", price: 200 }],
  },
  {
    category: "E-COMMERCE STORES",
    key: "ecommerceStores",
    tiers: [{ name: "Starter", price: 500 }, { name: "Professional", price: 1000 }, { name: "Enterprise", price: 1500 }],
  },
  {
    category: "AI PRODUCT IMAGES",
    key: "aiImages",
    tiers: [{ name: "Basic (5 images)", price: 30 }, { name: "Professional (12 images)", price: 100 }, { name: "Cinematic (25 images)", price: 170 }],
  },
  {
    category: "AI VIDEO ADS",
    key: "aiVideos",
    tiers: [{ name: "Quick Hook (15s)", price: 50 }, { name: "Full Ad (30-45s)", price: 130 }, { name: "Campaign Pack (3 videos)", price: 250 }],
  },
];

const BUNDLES = [
  { name: "QUICK LAUNCH", was: 130, now: 110, best: false, items: ["Basic Landing Page", "5 AI Product Images (Basic)", "Quick Hook Video"] },
  { name: "PRO PRODUCT CAMPAIGN", was: 330, now: 280, best: true, items: ["Professional Landing Page", "12 AI Images (Professional)", "Full Video Ad"] },
  { name: "STORE + CONTENT", was: 700, now: 590, best: true, items: ["Starter E-commerce Store", "Basic Landing Page", "12 AI Images (Professional)", "Quick Hook Video"] },
  { name: "CINEMATIC CAMPAIGN", was: 620, now: 520, best: false, items: ["Cinematic Landing Page", "25 AI Images (Cinematic)", "Campaign Video Pack"] },
  { name: "FULL DIGITAL IDENTITY", was: 1620, now: 1350, best: true, items: ["Professional E-commerce Store", "Cinematic Landing Page", "25 AI Images (Cinematic)", "Campaign Video Pack"] },
  { name: "EMPIRE PACKAGE", was: 2320, now: 1900, best: false, items: ["Enterprise E-commerce Store", "Cinematic Landing Page", "25 AI Images (Cinematic)", "Campaign Video Pack", "1 Month Support + Consulting"] },
];

const WHY_FEATURES = [
  { icon: Code2, title: "CUSTOM CODE, NO TEMPLATES", desc: "Hand-coded from scratch. No WordPress. No Shopify. Pure performance." },
  { icon: Zap, title: "AI-POWERED SPEED", desc: "Cinematic quality delivered in 48 hours, not weeks." },
  { icon: DollarSign, title: "ZERO MONTHLY FEES", desc: "Pay once, own forever. No hidden subscriptions or recurring costs." },
  { icon: Package, title: "COD OPTIMIZED", desc: "Built specifically for the Algerian Cash on Delivery market." },
  { icon: MapPin, title: "LOCAL MARKET EXPERT", desc: "We understand Algerian payment methods, logistics, and customer behavior." },
  { icon: Shield, title: "FULL OWNERSHIP", desc: "You own the code, the design, and all your data. No vendor lock-in." },
];

const HOW_STEPS = [
  { icon: MousePointer, title: "CHOOSE", desc: "Browse our services and select the perfect package for your needs" },
  { icon: ClipboardList, title: "ORDER", desc: "Fill the order form with your details and confirm via WhatsApp" },
  { icon: Code2, title: "CREATE", desc: "We build your solution using custom code and cutting-edge AI tools" },
  { icon: Rocket, title: "DELIVER", desc: "Receive your project in record time, ready to launch and convert" },
];

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("revealed");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".section-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function PublicSite() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [pricingTab, setPricingTab] = useState<"individual" | "bundles">("individual");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const autoRef = useRef<number | null>(null);

  const [settings, setSettings] = useState<ServiceSettings>(() =>
    JSON.parse(localStorage.getItem("dzair_service_settings") || '{"landingPages":true,"ecommerceStores":true,"aiImages":true,"aiVideos":true}')
  );

  useReveal();

  useEffect(() => {
    const dot = document.querySelector(".cursor-dot") as HTMLElement | null;
    const ring = document.querySelector(".cursor-ring") as HTMLElement | null;
    let ringX = -1000, ringY = -1000;
    const move = (e: MouseEvent) => {
      if (dot) { dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px"; }
      setTimeout(() => {
        ringX = e.clientX; ringY = e.clientY;
        if (ring) { ring.style.left = ringX + "px"; ring.style.top = ringY + "px"; }
      }, 100);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    autoRef.current = window.setInterval(() => {
      setActiveService((p) => (p + 1) % SERVICES.length);
    }, 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, []);

  const pauseAuto = () => { if (autoRef.current) clearInterval(autoRef.current); };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const addToCart = (name: string, price: number, tier?: string) => {
    const id = `${name}-${tier || "default"}-${Date.now()}`;
    setCartItems((prev) => [...prev, { id, name, price, tier }]);
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => setCartItems((prev) => prev.filter((i) => i.id !== id));

  const allDisabled = !settings.landingPages && !settings.ecommerceStores && !settings.aiImages && !settings.aiVideos;

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      <div className="cursor-dot hidden md:block" />
      <div className="cursor-ring hidden md:block" />

      {/* NAVBAR */}
      <nav
        data-testid="navbar"
        className="fixed top-0 w-full z-[1000] bg-[rgba(5,5,8,0.9)] backdrop-blur-[15px] border-b border-[rgba(0,212,255,0.1)] px-6 py-4 flex justify-between items-center"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-[Orbitron] font-bold text-[#00d4ff] text-xl tracking-[6px] [text-shadow:0_0_20px_rgba(0,212,255,0.5)]"
        >
          DZAIR
        </button>

        <div className="hidden md:flex gap-8">
          {["SERVICES", "PRICING", "ORDER", "CONTACT"].map((item) => (
            <button
              key={item}
              data-testid={`nav-${item.toLowerCase()}-link`}
              onClick={() => scrollTo(item.toLowerCase())}
              className="font-[Orbitron] text-[0.7rem] tracking-[2px] text-[#a0a8b8] hover:text-[#00d4ff] relative group transition-colors"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00d4ff] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            data-testid="cart-button"
            onClick={() => setCartOpen(true)}
            className="relative p-2 group"
          >
            <ShoppingCart size={22} className="text-[#00d4ff] group-hover:scale-110 transition-transform" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ffaa00] text-black text-[10px] font-bold flex items-center justify-center animate-pulse-badge">
                {cartItems.length}
              </span>
            )}
          </button>
          <button className="md:hidden text-[#00d4ff]" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[1001] transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="absolute inset-0 bg-[#050508]/95 backdrop-blur-md flex flex-col p-8">
          <div className="flex justify-end mb-12">
            <button className="text-[#00d4ff]" onClick={() => setMobileMenuOpen(false)}>
              <X size={32} />
            </button>
          </div>
          <div className="flex flex-col gap-8 items-center">
            {["SERVICES", "PRICING", "ORDER", "CONTACT"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="font-[Orbitron] text-2xl tracking-[4px] text-white hover:text-[#00d4ff] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section
        id="hero"
        data-testid="hero-section"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050508]"
      >
        <ParticleCanvas />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="font-[Orbitron] text-[#00d4ff] text-[0.7rem] tracking-[8px] mb-6 [text-shadow:0_0_15px_rgba(0,212,255,0.6)] animate-fade-in opacity-0" style={{ animationFillMode: "forwards" }}>
            DZAIR STUDIO
          </p>
          <h1
            className="font-[Orbitron] font-bold leading-tight mb-6 animate-fade-slide-up opacity-0 [text-shadow:0_0_30px_rgba(0,212,255,0.3)]"
            style={{ fontSize: "clamp(2rem,5vw,4rem)", animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            AI-POWERED<br />DIGITAL SOLUTIONS
          </h1>
          <p
            className="text-[#a0a8b8] text-lg max-w-xl mx-auto mb-10 animate-fade-slide-up opacity-0"
            style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
          >
            Custom-coded stores, cinematic ads, and landing pages built with cutting-edge AI for Algerian e-commerce
          </p>
          <div
            className="flex flex-col md:flex-row gap-4 justify-center animate-fade-slide-up opacity-0"
            style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
          >
            <button
              data-testid="hero-explore-btn"
              onClick={() => scrollTo("services")}
              className="font-[Orbitron] text-[0.75rem] tracking-[3px] px-8 py-4 border border-[#00d4ff] text-[#00d4ff] hover:bg-gradient-to-r hover:from-[#00d4ff] hover:to-[#0066ff] hover:text-black rounded transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:scale-[1.02]"
            >
              EXPLORE SERVICES
            </button>
            <button
              data-testid="hero-order-btn"
              onClick={() => scrollTo("order")}
              className="font-[Orbitron] text-[0.75rem] tracking-[3px] px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-black font-bold rounded transition-all duration-300 hover:brightness-125 hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:scale-[1.02]"
            >
              ORDER NOW
            </button>
          </div>
        </div>

        {/* Logo */}
        <div className="absolute bottom-10 right-6 md:right-12 z-10">
          <img
            src="/dzair-logo.png"
            alt="DZAIR STUDIO Logo"
            data-testid="hero-logo"
            className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border-[3px] border-[#00d4ff] animate-float animate-pulse-glow hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-5 h-8 border-2 border-[rgba(0,212,255,0.4)] rounded-full flex justify-center">
            <div className="w-1 h-2 bg-[#00d4ff] rounded-full mt-1.5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {!allDisabled && (
        <section id="services" className="py-24 md:py-32 bg-[#0a0a12] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 section-reveal">
              <h2 className="font-[Orbitron] text-4xl md:text-5xl font-bold text-white [text-shadow:0_0_20px_rgba(0,212,255,0.5)] mb-4">
                OUR <span className="text-[#00d4ff]">SERVICES</span>
              </h2>
              <p className="text-[#a0a8b8] text-lg">Four powerful solutions to accelerate your e-commerce business</p>
            </div>

            <div
              className="relative"
              onMouseEnter={pauseAuto}
            >
              <button
                onClick={() => { pauseAuto(); setActiveService((p) => (p - 1 + SERVICES.length) % SERVICES.length); }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] flex items-center justify-center hover:bg-[#00d4ff] hover:text-black transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] -ml-6"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => { pauseAuto(); setActiveService((p) => (p + 1) % SERVICES.length); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] flex items-center justify-center hover:bg-[#00d4ff] hover:text-black transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] -mr-6"
              >
                <ArrowRight size={20} />
              </button>

              <div className="overflow-hidden px-8">
                <div
                  className="flex gap-6 transition-transform duration-500"
                  style={{ transform: `translateX(calc(-${activeService * 100}% - ${activeService * 24}px))` }}
                >
                  {SERVICES.map((svc, idx) => {
                    const isActive = idx === activeService;
                    const enabled = settings[svc.key as keyof ServiceSettings];
                    const Icon = svc.icon;
                    return (
                      <div
                        key={svc.key}
                        className="shrink-0 w-full transition-all duration-500"
                        style={{
                          transform: isActive ? "scale(1)" : "scale(0.88)",
                          opacity: isActive ? 1 : 0.5,
                        }}
                      >
                        <div className="bg-[rgba(10,10,25,0.9)] backdrop-blur-[20px] border border-[rgba(0,212,255,0.2)] rounded-2xl flex flex-col md:flex-row overflow-hidden min-h-[360px] max-w-[680px] mx-auto">
                          <div className="md:w-2/5 h-48 md:h-auto bg-[rgba(0,212,255,0.03)] flex items-center justify-center border-b md:border-b-0 md:border-r border-[rgba(0,212,255,0.1)] relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.15)_0%,transparent_70%)]" />
                            <Icon size={72} className="text-[#00d4ff] drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] relative z-10" />
                          </div>
                          <div className="flex-1 p-8 relative flex flex-col justify-between">
                            <span className="absolute top-4 right-4 font-[Orbitron] text-7xl opacity-10 text-[#00d4ff] font-bold leading-none select-none">
                              {svc.number}
                            </span>
                            <div>
                              <h3 className="font-[Orbitron] text-xl font-bold text-white tracking-wider mb-2 pr-12">{svc.title}</h3>
                              <p className="text-[#a0a8b8] text-sm leading-relaxed mb-4">{svc.desc}</p>
                              <p className="text-[#00d4ff] font-[Orbitron] text-xl font-bold mb-4">FROM ${svc.price}</p>
                              <ul className="space-y-2 mb-6">
                                {svc.features.map((f, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm text-[#a0a8b8]">
                                    <Check size={14} className="text-[#00d4ff] shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {enabled ? (
                              <button
                                data-testid={`add-to-cart-${svc.key}`}
                                onClick={() => addToCart(svc.title, svc.price)}
                                className="w-full py-3 font-[Orbitron] text-sm tracking-widest border border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.05)] hover:bg-[#00d4ff] hover:text-black rounded transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
                              >
                                ADD TO CART
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full py-3 font-[Orbitron] text-sm tracking-widest border border-[#5a6070] text-[#5a6070] bg-[#0a0a12] rounded cursor-not-allowed"
                              >
                                COMING SOON
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-8">
                {SERVICES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { pauseAuto(); setActiveService(i); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeService ? "bg-[#00d4ff] w-6" : "bg-[rgba(0,212,255,0.3)]"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      <section id="pricing" className="py-24 md:py-32 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 section-reveal">
            <h2 className="font-[Orbitron] text-4xl md:text-5xl font-bold text-white mb-4">
              PRICING <span className="text-[#00d4ff]">PACKAGES</span>
            </h2>
            <p className="text-[#a0a8b8] text-lg">Choose the perfect solution for your business growth</p>
          </div>

          <div className="flex justify-center gap-2 mb-12">
            {(["individual", "bundles"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPricingTab(tab)}
                className={`font-[Orbitron] text-xs tracking-[2px] px-6 py-3 rounded-sm transition-all border ${pricingTab === tab ? "border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.05)]" : "border-[rgba(0,212,255,0.2)] text-[#a0a8b8] hover:text-[#00d4ff]"}`}
              >
                {tab === "individual" ? "INDIVIDUAL SERVICES" : "BUNDLE DEALS"}
              </button>
            ))}
          </div>

          {pricingTab === "individual" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PRICING_INDIVIDUAL.map((cat) => {
                const enabled = settings[cat.key as keyof ServiceSettings];
                return (
                  <div
                    key={cat.category}
                    className={`card-glass p-6 section-reveal transition-all ${!enabled ? "opacity-40" : ""}`}
                  >
                    <h3 className="font-[Orbitron] text-[#00d4ff] text-sm tracking-widest mb-6 pb-3 border-b border-[rgba(0,212,255,0.1)]">
                      {cat.category}
                    </h3>
                    <div className="space-y-1">
                      {cat.tiers.map((tier) => (
                        <div
                          key={tier.name}
                          className="flex items-center justify-between px-3 py-3 rounded hover:bg-[rgba(0,212,255,0.05)] group transition-colors cursor-default"
                        >
                          <span className="text-[#a0a8b8] text-sm group-hover:text-white transition-colors">{tier.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-[Orbitron] text-sm text-[#00d4ff] group-hover:[text-shadow:0_0_10px_rgba(0,212,255,0.6)] transition-all">
                              ${tier.price}
                            </span>
                            {enabled && (
                              <button
                                onClick={() => addToCart(cat.category + " - " + tier.name, tier.price, tier.name)}
                                className="px-3 py-1 text-[10px] font-[Orbitron] tracking-wider border border-[rgba(0,212,255,0.3)] text-[#00d4ff] rounded hover:bg-[#00d4ff] hover:text-black transition-all opacity-0 group-hover:opacity-100"
                              >
                                SELECT
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pricingTab === "bundles" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BUNDLES.map((bundle) => (
                <div
                  key={bundle.name}
                  className="card-glass p-6 section-reveal relative hover:translate-y-[-8px] hover:shadow-[0_0_40px_rgba(0,212,255,0.2)] transition-all duration-300 group"
                >
                  {bundle.best && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-[#00d4ff] text-black text-[10px] font-[Orbitron] font-bold tracking-wider rounded-sm">
                      BEST VALUE
                    </span>
                  )}
                  <h3 className="font-[Orbitron] text-sm font-bold text-white tracking-wider mb-4">{bundle.name}</h3>
                  <div className="mb-4">
                    <span className="text-[#5a6070] line-through text-sm">${bundle.was}</span>
                    <div className="font-[Orbitron] text-3xl font-bold text-[#00d4ff] mt-1">${bundle.now}</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {bundle.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#a0a8b8]">
                        <Check size={14} className="text-[#00d4ff] shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => addToCart(bundle.name + " (Bundle)", bundle.now)}
                    className="w-full py-3 font-[Orbitron] text-xs tracking-widest bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-black font-bold rounded hover:brightness-125 hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] transition-all"
                  >
                    ORDER THIS BUNDLE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 md:py-32 bg-[#0a0a12]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20 section-reveal">
            <h2 className="font-[Orbitron] text-4xl md:text-5xl font-bold text-white mb-4">
              HOW IT <span className="text-[#00d4ff]">WORKS</span>
            </h2>
            <p className="text-[#a0a8b8] text-lg">From idea to launch in four simple steps</p>
          </div>

          {/* Desktop timeline */}
          <div className="hidden md:flex items-start relative">
            <div className="absolute top-5 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00d4ff] via-[#0066ff] to-[#00d4ff] opacity-40" />
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex-1 flex flex-col items-center text-center px-4 section-reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                  <div className="mb-4">
                    <Icon size={32} className="text-[#00d4ff] mx-auto" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#00d4ff] bg-[#050508] flex items-center justify-center font-[Orbitron] text-[#00d4ff] font-bold text-sm mb-6 relative z-10 shadow-[0_0_20px_rgba(0,212,255,0.4)]">
                    {i + 1}
                  </div>
                  <h4 className="font-[Orbitron] text-sm font-bold text-white tracking-wider mb-2">{step.title}</h4>
                  <p className="text-[#a0a8b8] text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Mobile timeline */}
          <div className="md:hidden relative pl-8">
            <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#00d4ff] to-transparent opacity-40" />
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative mb-12 section-reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                  <div className="absolute -left-10 w-8 h-8 rounded-full border-2 border-[#00d4ff] bg-[#050508] flex items-center justify-center font-[Orbitron] text-[#00d4ff] font-bold text-xs shadow-[0_0_15px_rgba(0,212,255,0.4)]">
                    {i + 1}
                  </div>
                  <Icon size={24} className="text-[#00d4ff] mb-2" />
                  <h4 className="font-[Orbitron] text-sm font-bold text-white tracking-wider mb-1">{step.title}</h4>
                  <p className="text-[#a0a8b8] text-sm">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-24 md:py-32 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 section-reveal">
            <h2 className="font-[Orbitron] text-4xl md:text-5xl font-bold text-white mb-4">
              WHY DZAIR <span className="text-[#00d4ff]">STUDIO?</span>
            </h2>
            <p className="text-[#a0a8b8] text-lg">What sets us apart in the Algerian digital landscape</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="card-glass p-8 section-reveal group hover:-translate-y-2 hover:border-[rgba(0,212,255,0.6)] hover:shadow-[0_0_30px_rgba(0,212,255,0.1)] transition-all duration-300"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="mb-4">
                    <Icon size={40} className="text-[#00d4ff] group-hover:[filter:drop-shadow(0_0_12px_rgba(0,212,255,0.8))] transition-all" />
                  </div>
                  <h4 className="font-[Orbitron] text-xs font-bold text-white tracking-widest mb-3 uppercase">
                    {feat.title}
                  </h4>
                  <p className="text-[#a0a8b8] text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ORDER / CART CTA */}
      <section id="order" className="py-20 bg-[#0a0a12]">
        <div className="max-w-3xl mx-auto px-4 text-center section-reveal">
          <h2 className="font-[Orbitron] text-4xl md:text-5xl font-bold text-white mb-4">
            PLACE YOUR <span className="text-[#00d4ff]">ORDER</span>
          </h2>
          <p className="text-[#a0a8b8] text-lg mb-10">Select your services above and complete your order</p>
          <button
            onClick={() => setCartOpen(true)}
            className="font-[Orbitron] text-sm tracking-[3px] px-10 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-black font-bold rounded hover:brightness-125 hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all hover:scale-[1.02] inline-flex items-center gap-3"
          >
            <ShoppingCart size={20} />
            VIEW CART ({cartItems.length} items)
          </button>
        </div>
      </section>

      {/* CONNECT */}
      <section id="contact" className="py-24 md:py-32 bg-[#050508]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 section-reveal">
            <h2 className="font-[Orbitron] text-4xl md:text-5xl font-bold text-white mb-4">
              CONNECT WITH <span className="text-[#00d4ff]">US</span>
            </h2>
            <p className="text-[#a0a8b8] text-lg">Follow our journey and get in touch</p>
          </div>

          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 mb-12">
            {[
              {
                href: "https://www.instagram.com/dzairstudio?igsh=MTdxOWxsZGk1aGtidw==",
                label: "BUSINESS INSTAGRAM",
                sub: "@dzairstudio",
                icon: <FaInstagram size={24} />,
                cls: "gradient-border gradient-border-pink",
              },
              {
                href: "https://www.instagram.com/ai_dzair?igsh=MWMyNW1icDhjc21yYQ==",
                label: "CONTENT INSTAGRAM",
                sub: "@ai_dzair",
                icon: <FaInstagram size={24} />,
                cls: "gradient-border",
              },
              {
                href: "https://wa.me/213560843444",
                label: "WHATSAPP BUSINESS",
                sub: "+213 560 84 34 44",
                icon: <FaWhatsapp size={24} />,
                cls: "gradient-border gradient-border-green",
              },
              {
                href: "mailto:collabaidzair@proton.me",
                label: "EMAIL US",
                sub: "collabaidzair@proton.me",
                icon: <Mail size={24} />,
                cls: "gradient-border",
              },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`${link.cls} flex items-center gap-4 px-8 py-5 rounded-xl hover:scale-[1.05] hover:shadow-[0_0_25px_rgba(0,212,255,0.3)] transition-all duration-300 group min-w-[220px]`}
              >
                <span className="text-[#00d4ff] group-hover:scale-110 transition-transform">{link.icon}</span>
                <div>
                  <div className="font-[Orbitron] text-xs tracking-wider text-white">{link.label}</div>
                  <div className="text-[#a0a8b8] text-sm mt-0.5">{link.sub}</div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center space-y-2 text-sm text-[#5a6070] section-reveal">
            <p>Location: Tissemsilt, Algeria</p>
            <p>Working Hours: 24/7 (AI-powered efficiency)</p>
            <a href="mailto:collabaidzair@proton.me" className="text-[#a0a8b8] hover:text-[#00d4ff] transition-colors inline-flex items-center gap-2">
              <Mail size={14} />
              collabaidzair@proton.me
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-[#030305] border-t border-[rgba(0,212,255,0.15)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="font-[Orbitron] text-[#00d4ff] font-bold text-xl tracking-widest mb-1">DZAIR STUDIO</div>
              <p className="text-[#5a6070] text-sm">AI-Powered Digital Solutions</p>
              <a href="mailto:collabaidzair@proton.me" className="text-[#5a6070] hover:text-[#00d4ff] text-sm transition-colors mt-1 flex items-center gap-1 justify-center md:justify-start">
                <Mail size={12} />
                collabaidzair@proton.me
              </a>
            </div>
            <div className="flex gap-6">
              {["SERVICES", "PRICING", "ORDER", "CONTACT"].map((link) => (
                <button
                  key={link}
                  onClick={() => scrollTo(link.toLowerCase())}
                  className="font-[Orbitron] text-[0.65rem] tracking-wider text-[#5a6070] hover:text-[#00d4ff] transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
            <p className="text-[#5a6070] text-xs text-center">
              2026 DZAIR STUDIO. All rights reserved.<br />Built with AI.
            </p>
          </div>
          <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.4)] to-transparent animate-pulse" />
        </div>
      </footer>

      {/* BACK TO TOP */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#00d4ff] text-black flex items-center justify-center hover:scale-110 hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] transition-all animate-fade-in shadow-[0_0_15px_rgba(0,212,255,0.4)]"
        >
          <ChevronUp size={22} />
        </button>
      )}

      {/* CART SIDEBAR */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
      />
    </div>
  );
}
