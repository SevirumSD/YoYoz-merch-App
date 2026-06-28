import React from "react";
import ProductCard from "./ProductCard";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NewDropsSection({ products, onQuickAdd }) {
  const newProducts = products.filter((p) => p.is_new).slice(0, 4);
  if (newProducts.length === 0) return null;

  return (
    <section className="px-5 py-16 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-white font-black text-2xl tracking-tight">
              NEW DROPS
            </h2>
            <p className="text-zinc-500 text-sm">Fresh from the studio</p>
          </div>
        </div>
        <Link
          to={createPageUrl("Shop") + "?filter=new"}
          className="text-red-500 text-sm font-bold hover:text-red-400 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {newProducts.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickAdd={onQuickAdd}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}