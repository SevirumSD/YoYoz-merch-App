import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Home, Store, Bell, Package, Menu, X, Flame, QrCode, ChevronRight, ChevronDown, Sparkles } from "lucide-react";
import CartDrawer from "./components/store/CartDrawer";
import { cn } from "@/lib/utils";
import ConcertQRCodeCard from "./components/store/ConcertQRCodeCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import CustomMockupModal from "./components/store/CustomMockupModal";

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
    queryFn: () => base44.entities.CartItem.list(),
  });

  useEffect(() => {
    const handler = () => refetchCart();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [refetchCart]);

  const handleUpdateQuantity = async (id, quantity) => {
    await base44.entities.CartItem.update(id, { quantity });
    refetchCart();
  };

  const handleRemove = async (id) => {
    await base44.entities.CartItem.delete(id);
    refetchCart();
  };

  const navItems = [
    { name: "Home", icon: Home, page: "Home" },
    { name: "Shop", icon: Store, page: "Shop" },
    { name: "Orders", icon: Package, page: "Orders" },
    { name: "Alerts", icon: Bell, page: "Notifications" },
    ...(isAdmin ? [{ name: "QR Tools", icon: QrCode, page: "QRTools" }] : []),
  ];

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
            <aside className="hidden lg:block w-80 shrink-0 py-8">
              <div className="sticky top-24">
                <ConcertQRCodeCard />
              </div>
            </aside>
          </div>
        )}
      </main>

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
      />
    </div>
  );
}