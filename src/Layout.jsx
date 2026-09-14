import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Home, Store, Bell, Package, Menu, X, Flame, QrCode, ChevronRight, ChevronDown, Sparkles } from "lucide-react";
import CartDrawer from "./components/store/CartDrawer";
import { listCartItems, updateCartItem, removeCartItem, getCheckoutUrl } from "@/lib/shopifyCart";
import { cn } from "@/lib/utils";
import ConcertQRCodeCard from "./components/store/ConcertQRCodeCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import CustomMockupModal from "./components/store/CustomMockupModal";
import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";

export default function Layout({ children, currentPageName }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customMockupOpen, setCustomMockupOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState({
    mens: false,
    womens: false,
    accessories: false,
    mensHoodies: false,
    womensHoodies: false,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const applyNavigationFilter = (gender, category, style) => {
    setSidebarOpen(false);
    
    // Construct query parameters
    const params = new URLSearchParams();
    if (gender && gender !== "all") params.append("gender", gender);
    if (category && category !== "all") params.append("category", category);
    if (style && style !== "all") params.append("style", style);
    
    // Navigate to shop with parameters
    navigate(`${createPageUrl("Shop")}?${params.toString()}`);
  };

  const { data: currentUser } = useQuery({
    queryKey: ["me-layout"],
    queryFn: () => base44.auth.me().catch(() => null),
  });
  const isAdmin = currentUser?.role === "admin";

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ["cart-items"],
    queryFn: () => listCartItems(),
  });

  useEffect(() => {
    const handler = () => refetchCart();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [refetchCart]);

  const handleUpdateQuantity = async (id, quantity) => {
    await updateCartItem(id, quantity);
    refetchCart();
  };

  const handleRemove = async (id) => {
    await removeCartItem(id);
    refetchCart();
  };

  // Real Shopify checkout when configured; in-app sandbox checkout otherwise
  const handleCheckout = async () => {
    const url = await getCheckoutUrl();
    if (url) {
      window.location.href = url;
    } else {
      setCartOpen(false);
      navigate(createPageUrl("Checkout"));
    }
  };

  const navItems = [
    { name: "Home", icon: Home, page: "Home" },
    { name: "Shop", icon: Store, page: "Shop" },
    { name: "Orders", icon: Package, page: "Orders" },
    { name: "Alerts", icon: Bell, page: "Notifications" },
    ...(isAdmin ? [{ name: "QR Tools", icon: QrCode, page: "QRTools" }] : []),
  ];

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const socialLinks = [
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@boogieyoyoz",
      color: "hover:text-white hover:bg-[#010101]",
      border: "hover:border-[#69C9D0]/60",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/boogieandtheyoyoz",
      color: "hover:text-white hover:bg-[#1877F2]",
      border: "hover:border-[#1877F2]/60",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/boogieyoyoz?igsh=MWthemFzemp6aWpvdw==",
      color: "hover:text-white",
      border: "hover:border-pink-500/60",
      iconStyle: { background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@boogieyoyoz",
      color: "hover:text-white hover:bg-[#FF0000]",
      border: "hover:border-[#FF0000]/60",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <style>{`
        :root {
          --background: 0 0% 0%;
          --foreground: 0 0% 100%;
        }
        body { background: #000; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sliding Sidebar Menu Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4 text-white hover:text-red-500 transition-colors" />
            </button>

            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div className="leading-none">
                <span className="text-white font-black text-sm tracking-tight block">
                  BOOGIE
                </span>
                <span className="text-red-500 font-bold text-[10px] tracking-[0.2em] uppercase">
                  & The Yo-Yoz
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {currentPageName === "Checkout" ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto px-5 flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              {children}
            </div>
            {/* Sidebar for QR Code Card (desktop only) */}
            <aside className="hidden lg:block w-80 shrink-0 py-8 space-y-6">
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col items-center justify-center shadow-md">
                <img 
                  src={logoFull} 
                  alt="Boogie & The Yo-Yoz" 
                  className="w-full max-w-[200px] object-contain invert brightness-200 opacity-80" 
                />
              </div>
              {/* Social Links Sidebar Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-3">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">Follow the Band</p>
                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${s.color} ${s.border}`}
                    >
                      {s.icon}
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
              <div className="sticky top-24">
                <ConcertQRCodeCard />
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Site-Wide Social Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 mt-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left — Band Identity */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div className="leading-none">
                  <span className="text-white font-black text-sm tracking-tight block">BOOGIE</span>
                  <span className="text-red-500 font-bold text-[10px] tracking-[0.2em] uppercase">& The Yo-Yoz</span>
                </div>
              </div>
              <p className="text-zinc-600 text-xs max-w-[220px] text-center md:text-left mt-1">
                Official merch. Live loud, rep harder.
              </p>
            </div>

            {/* Center — Social Links */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.25em]">Follow the Band</p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition-all duration-200 ${s.color} ${s.border} hover:scale-110 hover:shadow-lg`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Right — CTA */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <a
                href={socialLinks[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-500 hover:text-red-400 font-black uppercase tracking-wider transition-colors"
              >
                @boogieyoyoz →
              </a>
              <p className="text-zinc-700 text-[10px]">
                © {new Date().getFullYear()} Boogie & The Yo-Yoz. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900 z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-3 transition-colors",
                  isActive ? "text-red-500" : "text-zinc-600"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setCartOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 text-zinc-600 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-bold">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Multi-Level Sidebar Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="bg-zinc-950 border-l-2 border-red-600 text-white p-6 w-80 sm:w-96 max-h-screen overflow-y-auto shadow-[0_0_50px_rgba(220,38,38,0.15)] flex flex-col justify-between">
          <div>
            <SheetHeader className="mb-6 flex flex-row items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <SheetTitle className="text-white font-black text-xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Store Directory
                </SheetTitle>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Boogie Merch Grid</p>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-zinc-400 hover:text-white" />
              </button>
            </SheetHeader>

            {/* Menu Links Hierarchy */}
            <div className="space-y-4">
              <button
                onClick={() => applyNavigationFilter("all", "all", "all")}
                className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-200 font-black uppercase text-xs tracking-wider transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Shop All Collections</span>
                <ChevronRight className="w-4 h-4 text-red-500" />
              </button>

              <div className="space-y-2.5">
                {/* LEVEL 1: Men's Merchandise */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenMenu(o => ({ ...o, mens: !o.mens }))}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                      openMenu.mens ? "bg-red-950/20 text-red-500 border-b border-zinc-900" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                    )}
                  >
                    <span>Men's Merchandise</span>
                    {openMenu.mens ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {/* LEVEL 2 (Nested dropdowns under Men's) */}
                  {openMenu.mens && (
                    <div className="px-3 py-2.5 space-y-1 bg-black/40">
                      <button
                        onClick={() => applyNavigationFilter("men", "Shirts", "all")}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
                      >
                        Shirts Collection
                      </button>

                      {/* LEVEL 2: Hoodies with Nested LEVEL 3 style variants */}
                      <div className="space-y-1">
                        <button
                          onClick={() => setOpenMenu(o => ({ ...o, mensHoodies: !o.mensHoodies }))}
                          onMouseEnter={() => setOpenMenu(o => ({ ...o, mensHoodies: true }))}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                            openMenu.mensHoodies ? "text-red-400 bg-zinc-900/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                          )}
                        >
                          <span>Hoodies & Outerwear</span>
                          {openMenu.mensHoodies ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        {/* LEVEL 3 style variants (Normal, Half-Zip, 3/4 Zip) */}
                        {openMenu.mensHoodies && (
                          <div className="pl-4 py-1.5 space-y-1 border-l border-zinc-900 ml-3">
                            <button
                              onClick={() => applyNavigationFilter("men", "Hoodies", "normal")}
                              className="w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Normal Hoodie
                            </button>
                            <button
                              onClick={() => applyNavigationFilter("men", "Hoodies", "half-zip")}
                              className="w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Half-Zip Design
                            </button>
                            <button
                              onClick={() => applyNavigationFilter("men", "Hoodies", "3/4-zip")}
                              className="w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            >
                              3/4 Zip Design
                            </button>
                          </div>
                        )}
                      </div>

                      {/* LEVEL 2: Custom Section (Placement Previewer) */}
                      <button
                        onClick={() => { setSidebarOpen(false); setCustomMockupOpen(true); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-red-500" />
                        Custom Mockups
                      </button>
                    </div>
                  )}
                </div>

                {/* LEVEL 1: Women's Merchandise */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenMenu(o => ({ ...o, womens: !o.womens }))}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                      openMenu.womens ? "bg-red-950/20 text-red-500 border-b border-zinc-900" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                    )}
                  >
                    <span>Women's Merchandise</span>
                    {openMenu.womens ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {/* LEVEL 2 (Nested dropdowns under Women's) */}
                  {openMenu.womens && (
                    <div className="px-3 py-2.5 space-y-1 bg-black/40">
                      <button
                        onClick={() => applyNavigationFilter("women", "Shirts", "all")}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
                      >
                        Shirts Collection
                      </button>

                      {/* LEVEL 2: Hoodies with Nested LEVEL 3 style variants */}
                      <div className="space-y-1">
                        <button
                          onClick={() => setOpenMenu(o => ({ ...o, womensHoodies: !o.womensHoodies }))}
                          onMouseEnter={() => setOpenMenu(o => ({ ...o, womensHoodies: true }))}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                            openMenu.womensHoodies ? "text-red-400 bg-zinc-900/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                          )}
                        >
                          <span>Hoodies & Outerwear</span>
                          {openMenu.womensHoodies ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        {/* LEVEL 3 style variants (Normal, Half-Zip, 3/4 Zip) */}
                        {openMenu.womensHoodies && (
                          <div className="pl-4 py-1.5 space-y-1 border-l border-zinc-900 ml-3">
                            <button
                              onClick={() => applyNavigationFilter("women", "Hoodies", "normal")}
                              className="w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Normal Hoodie
                            </button>
                            <button
                              onClick={() => applyNavigationFilter("women", "Hoodies", "half-zip")}
                              className="w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Half-Zip Design
                            </button>
                            <button
                              onClick={() => applyNavigationFilter("women", "Hoodies", "3/4-zip")}
                              className="w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            >
                              3/4 Zip Design
                            </button>
                          </div>
                        )}
                      </div>

                      {/* LEVEL 2: Custom Section (Placement Previewer) */}
                      <button
                        onClick={() => { setSidebarOpen(false); setCustomMockupOpen(true); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-red-500" />
                        Custom Mockups
                      </button>
                    </div>
                  )}
                </div>

                {/* LEVEL 1: Accessories & Fan Gear */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenMenu(o => ({ ...o, accessories: !o.accessories }))}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                      openMenu.accessories ? "bg-red-950/20 text-red-500 border-b border-zinc-900" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                    )}
                  >
                    <span>Accessories & Fan Gear</span>
                    {openMenu.accessories ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {/* LEVEL 2 (Nested sub-menus) */}
                  {openMenu.accessories && (
                    <div className="px-3 py-2.5 space-y-1 bg-black/40">
                      <button
                        onClick={() => applyNavigationFilter("all", "Accessories", "wristband")}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
                      >
                        Custom LED Wristbands
                      </button>
                      <button
                        onClick={() => applyNavigationFilter("all", "Accessories", "tumbler")}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
                      >
                        Insulated Tumblers
                      </button>
                      <button
                        onClick={() => applyNavigationFilter("all", "Accessories", "cup")}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
                      >
                        Double Layer Cups
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900 mt-6">
            <ConcertQRCodeCard />
          </div>
        </SheetContent>
      </Sheet>

      {/* Design Overlay Mockup Selector Modal */}
      <CustomMockupModal isOpen={customMockupOpen} onClose={() => setCustomMockupOpen(false)} />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
      />
    </div>
  );
}