import React, { useState } from "react";
import { ShoppingCart, Eye, Package, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

// Concert Red & Black themed accents for visual interest
const ACCENTS = [
  { color: "#ff003c", glow: "rgba(255,0,60,0.4)", label: "rgba(255,0,60,0.85)" },   // Neon Concert Red
  { color: "#e50914", glow: "rgba(229,9,20,0.4)", label: "rgba(229,9,20,0.85)" },   // Classic Band Red
  { color: "#ff3333", glow: "rgba(255,51,51,0.4)", label: "rgba(255,51,51,0.85)" }, // Flame Crimson
  { color: "#ff0055", glow: "rgba(255,0,85,0.4)", label: "rgba(255,0,85,0.85)" },   // Electric Ruby
];

export default function ProductCard({ product, onQuickAdd, onAddToCart, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const accent = ACCENTS[index % ACCENTS.length];

  const handleAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(product);
    } else if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 border"
      style={{
        background: "linear-gradient(165deg, #121212 0%, #080808 100%)",
        borderColor: isHovered ? `${accent.color}66` : "rgba(255,255,255,0.05)",
        boxShadow: isHovered
          ? `0 0 30px ${accent.glow}, 0 10px 40px rgba(0,0,0,0.8)`
          : "none",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={createPageUrl("ProductDetail") + `?id=${product.id}`} className="block">
        {/* Product Image Area */}
        <div
          className="aspect-square relative overflow-hidden bg-zinc-950"
          style={{
            background: `radial-gradient(circle at center, ${accent.color}15 0%, #060606 80%)`,
          }}
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Package className="w-12 h-12" style={{ color: `${accent.color}50` }} />
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${accent.color}70` }}>
                {product.category || "Merch"}
              </p>
            </div>
          )}

          {/* Glowing Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.is_new && (
              <span className="inline-flex items-center gap-1 bg-red-600 text-white font-black text-[9px] tracking-wider px-2.5 py-1 rounded uppercase shadow-[0_0_12px_rgba(220,38,38,0.5)]">
                <Flame className="w-3 h-3 fill-white" />
                NEW
              </span>
            )}
            {product.tour_exclusive && (
              <span className="inline-flex items-center bg-white text-black font-black text-[9px] tracking-wider px-2.5 py-1 rounded uppercase">
                TOUR EXCLUSIVE
              </span>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-[2px] z-10">
              <span className="font-black uppercase tracking-widest text-xs text-zinc-500 border border-zinc-800 px-4 py-2 rounded">
                Sold Out
              </span>
            </div>
          )}

          {/* Quick view indicator on Hover */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity duration-300"
            style={{ opacity: isHovered && product.stock !== 0 ? 1 : 0 }}
          >
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider bg-black/60 border border-white/10 px-4 py-2.5 rounded-full backdrop-blur-md">
              <Eye className="w-3.5 h-3.5" />
              View Details
            </div>
          </div>

          {/* High-contrast Red Bottom Highlight Bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)`,
              opacity: isHovered ? 1 : 0.4,
            }}
          />
        </div>
      </Link>

      {/* Info & Buy Area */}
      <div className="p-5">
        <h3
          className="font-black text-base text-zinc-100 group-hover:text-white transition-colors duration-200 line-clamp-1 leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {product.name}
        </h3>
        
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">
          {product.category?.replace(/_/g, " ")}
        </p>

        <div className="flex items-center justify-between gap-4 mt-5">
          <span
            className="text-2xl font-black transition-all duration-300"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: isHovered ? accent.color : "#ffffff",
              textShadow: isHovered ? `0 0 15px ${accent.glow}` : "none",
            }}
          >
            ${product.price}
          </span>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAction}
            disabled={product.stock === 0}
            className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: product.stock === 0 ? "rgba(255,255,255,0.03)" : `${accent.color}15`,
              border: `1px solid ${product.stock === 0 ? "rgba(255,255,255,0.08)" : `${accent.color}44`}`,
              color: product.stock === 0 ? "rgba(255,255,255,0.3)" : accent.color,
              boxShadow: isHovered && product.stock !== 0 ? `0 0 15px ${accent.glow}` : "none",
            }}
            onMouseEnter={e => {
              if (product.stock !== 0) {
                e.currentTarget.style.background = accent.color;
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = accent.color;
              }
            }}
            onMouseLeave={e => {
              if (product.stock !== 0) {
                e.currentTarget.style.background = `${accent.color}15`;
                e.currentTarget.style.color = accent.color;
                e.currentTarget.style.borderColor = `${accent.color}44`;
              }
            }}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
}