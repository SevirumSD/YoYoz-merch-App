import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingBag, Lock, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { redirectToShopifyCheckout, getShopifyCheckoutUrl } from "@/lib/shopifyClient";

export default function Checkout() {
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart-checkout"],
    queryFn: () => base44.entities.CartItem.list(),
  });

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      redirectToShopifyCheckout(cartItems);
    }
  }, [cartItems]);

  const checkoutUrl = cartItems.length > 0 ? getShopifyCheckoutUrl(cartItems) : "https://www.boogieandtheyoyozmerch.com/cart";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 font-bold uppercase tracking-wider text-sm">
          Preparing secure checkout...
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Your Cart is Empty
        </h2>
        <p className="text-zinc-400 text-sm max-w-sm mb-6">
          Looks like you haven't added any Boogie & The Yo-Yoz merch to your cart yet.
        </p>
        <Link
          to={createPageUrl("Shop")}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-wider transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin mb-6" />
      <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Redirecting to Shopify Secure Checkout...
      </h2>
      <p className="text-zinc-400 text-sm max-w-md mb-8">
        Taking you directly to Shopify to complete your purchase with Shop Pay, Apple Pay, Google Pay, or Credit Card.
      </p>

      <div className="space-y-4">
        <a
          href={checkoutUrl}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-xl uppercase text-sm tracking-wider transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-[1.02]"
        >
          <Lock className="w-4 h-4" /> Click Here to Complete Purchase on Shopify
        </a>

        <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Shopify 256-Bit Encrypted Checkout</span>
        </div>
      </div>
    </div>
  );
}