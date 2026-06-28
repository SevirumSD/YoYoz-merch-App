import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Home, Store, Bell, Package, Menu, X, Flame, QrCode } from "lucide-react";
import CartDrawer from "./components/store/CartDrawer";
import { cn } from "@/lib/utils";
import ConcertQRCodeCard from "./components/store/ConcertQRCodeCard";

export default function Layout({ children, currentPageName }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <Menu className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-900 px-5 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
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
            </div>
            <div className="pt-2 border-t border-zinc-905">
              <ConcertQRCodeCard />
            </div>
          </div>
        )}
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