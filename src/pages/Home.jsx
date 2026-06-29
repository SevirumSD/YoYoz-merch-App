import React from "react";
import { base44 } from "@/api/base44Client";
import { getProducts } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import HeroBanner from "../components/store/HeroBanner";
import NewDropsSection from "../components/store/NewDropsSection";
import FeaturedBanner from "../components/store/FeaturedBanner";
import ProductCard from "../components/store/ProductCard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, Music, Disc3, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const handleQuickAdd = async (product) => {
    await base44.entities.CartItem.create({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      size: product.selectedSize || product.sizes?.[0] || "",
      color: product.selectedColor || product.colors?.[0] || "",
      image_url: product.image_url,
    });
    window.dispatchEvent(new Event("cart-updated"));
  };

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-black">
      <HeroBanner />

      <NewDropsSection products={products} onQuickAdd={handleQuickAdd} />

      <FeaturedBanner />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="px-5 py-16 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-white font-black text-2xl tracking-tight">
                  FAN FAVORITES
                </h2>
                <p className="text-zinc-500 text-sm">Best sellers from the crew</p>
              </div>
            </div>
            <Link
              to={createPageUrl("Shop")}
              className="text-red-500 text-sm font-bold hover:text-red-400 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAdd={handleQuickAdd}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Band CTA */}
      <section className="px-5 py-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <Disc3 className="w-6 h-6 text-red-500 animate-spin" style={{ animationDuration: "3s" }} />
            <Music className="w-5 h-5 text-zinc-600" />
            <Disc3 className="w-6 h-6 text-red-500 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            ROCK THE MERCH
          </h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8">
            Rep Boogie & the Yo-Yoz everywhere you go. New designs dropping every month.
          </p>
          <Link to={createPageUrl("Shop")}>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-full text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              Explore Full Collection
              <ChevronRight className="w-5 h-5 ml-2 inline" />
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}