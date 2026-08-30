import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { getCollectionProducts, RED_BLACK_COLLECTION_HANDLE } from "@/lib/shopifyClient";
import { Smartphone, Sparkles } from "lucide-react";

/**
 * Promo banner for the app-exclusive Red & Black Collection — the
 * recolored "Can You Feel It" tour set. Only renders once the collection
 * actually has products (avoids showing an empty promo before the Red
 * Printify variants are live).
 *
 * discountCode is left undefined until the Shopify discount is created;
 * pass it in once that exists to show the code teaser.
 */
export default function RedBlackPromoBanner({ discountCode }) {
  const { data: products = [] } = useQuery({
    queryKey: ["collection-products", RED_BLACK_COLLECTION_HANDLE],
    queryFn: () => getCollectionProducts(RED_BLACK_COLLECTION_HANDLE),
  });

  if (products.length === 0) return null;

  const heroImage = products.find((p) => p.image_url)?.image_url;

  return (
    <section className="px-5 py-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl">
        {/* Diagonal black/red split background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(115deg, #0a0a0a 0%, #0a0a0a 45%, #7f1d1d 45%, #dc2626 100%)",
          }}
        />
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.5)]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
              <Smartphone className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-bold tracking-wider uppercase">
                App Exclusive
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              RED &amp; BLACK<br />COLLECTION
            </h2>
            <p className="text-white/70 mt-3 text-sm md:text-base max-w-md">
              The Can You Feel It set, recolored. Available only to app users.
            </p>

            {discountCode && (
              <div className="mt-4 inline-flex items-center gap-2 bg-black/40 border border-white/20 rounded-full px-4 py-2">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span className="text-white text-xs font-bold">
                  Use code <span className="tracking-wider">{discountCode}</span> at checkout
                </span>
              </div>
            )}

            <div>
              <Link to={createPageUrl("Shop") + `?collection=${RED_BLACK_COLLECTION_HANDLE}`}>
                <Button className="mt-6 bg-white text-black font-bold px-8 py-5 rounded-full hover:bg-zinc-200 transition-all hover:scale-105">
                  Shop The Set
                </Button>
              </Link>
            </div>
          </div>

          {heroImage && (
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shrink-0 -rotate-3 shadow-2xl shadow-black/50 border-2 border-white/10">
              <img src={heroImage} alt="Red & Black Collection" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
