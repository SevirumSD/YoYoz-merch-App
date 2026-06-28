import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { getProducts } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../components/store/ProductCard";
import CategoryBar from "../components/store/CategoryBar";
import ConcertQRCodeCard from "../components/store/ConcertQRCodeCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export default function Shop() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialFilter = urlParams.get("filter") || "";

  // Unified filter state supporting category, gender, and style
  const [filters, setFilters] = useState({
    category: "all",
    gender: "all",
    style: "all",
  });
  
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Dynamically query Supabase based on unified filter state
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Supabase handles category, gender, and style filtering dynamically,
    // so we apply new/tour URL tags and search matching client-side.
    if (initialFilter === "new") {
      filtered = filtered.filter((p) => p.is_new);
    } else if (initialFilter === "tour_exclusive") {
      filtered = filtered.filter((p) => p.tour_exclusive);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (sort === "price_low") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sort === "price_high") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, search, sort, initialFilter]);

  const handleQuickAdd = async (product) => {
    await base44.entities.CartItem.create({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      size: product.sizes?.[0] || "",
      color: product.colors?.[0] || "",
      image_url: product.image_url,
    });
    window.dispatchEvent(new Event("cart-updated"));
  };

  // Map filters state to category bar active tab
  const activeCategoryId = useMemo(() => {
    if (filters.category !== "all") {
      return `category_${filters.category}`;
    }
    if (filters.gender !== "all") {
      return `gender_${filters.gender}`;
    }
    if (filters.style !== "all") {
      return `style_${filters.style}`;
    }
    return "all";
  }, [filters]);

  // Handle CategoryBar tab change
  const handleCategoryBarChange = (val) => {
    if (val === "all") {
      setFilters({ category: "all", gender: "all", style: "all" });
    } else if (val.startsWith("category_")) {
      setFilters({ category: val.replace("category_", ""), gender: "all", style: "all" });
    } else if (val.startsWith("gender_")) {
      setFilters({ category: "all", gender: val.replace("gender_", ""), style: "all" });
    } else if (val.startsWith("style_")) {
      setFilters({ category: "all", gender: "all", style: val.replace("style_", "") });
    }
  };

  // Group products when the default "All" view is active
  const isDefaultView = filters.category === "all" && filters.gender === "all" && filters.style === "all" && !search;

  const groupedProducts = useMemo(() => {
    if (!isDefaultView) return null;

    const shirts = filteredProducts.filter(p => p.dbCategory === 'Shirts' || p.category === 't-shirts' || p.category === 'shirts');
    const hoodies = filteredProducts.filter(p => p.dbCategory === 'Hoodies' || p.category === 'hoodies');
    
    // Custom Can Koozies
    const koozies = filteredProducts.filter(p => 
      p.dbCategory?.toLowerCase() === 'koozies' ||
      p.dbCategory?.toLowerCase() === 'can koozies' ||
      p.category?.toLowerCase() === 'koozies' || 
      p.name?.toLowerCase().includes('koozie') ||
      p.koozie
    );

    // Custom Steel Tumblers
    const steelTumblers = filteredProducts.filter(p =>
      p.dbCategory?.toLowerCase() === 'steel tumblers' ||
      p.dbCategory?.toLowerCase() === 'steel_tumbler' ||
      p.name?.toLowerCase().includes('steel tumbler')
    );

    // Custom Wine Tumblers
    const wineTumblers = filteredProducts.filter(p =>
      p.dbCategory?.toLowerCase() === 'wine tumblers' ||
      p.dbCategory?.toLowerCase() === 'wine_tumbler' ||
      p.name?.toLowerCase().includes('wine tumbler')
    );

    const other = filteredProducts.filter(p => 
      !shirts.includes(p) && !hoodies.includes(p) && !koozies.includes(p) && !steelTumblers.includes(p) && !wineTumblers.includes(p)
    );

    return { shirts, hoodies, koozies, steelTumblers, wineTumblers, other };
  }, [filteredProducts, isDefaultView]);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 max-w-7xl mx-auto">
        <h1 className="text-white font-black text-3xl md:text-4xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {initialFilter === "tour_exclusive" ? "TOUR MERCH" : initialFilter === "new" ? "NEW DROPS" : "SHOP ALL"}
        </h1>
        <p className="text-zinc-500 mt-1">
          {filteredProducts.length} products
        </p>
      </div>

      {/* Filters & Actions Panel */}
      <div className="px-5 max-w-7xl mx-auto space-y-4 pb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search merch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white pl-10 rounded-xl placeholder:text-zinc-600 focus-visible:ring-red-500"
            />
          </div>

          {/* Sort Menu */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white rounded-xl">
              <ArrowUpDown className="w-4 h-4 mr-2 text-zinc-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low</SelectItem>
              <SelectItem value="price_high">Price: High</SelectItem>
            </SelectContent>
          </Select>

          {/* Slide-out Sidebar Filter Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4.5 py-2.5 hover:bg-zinc-800 transition-all font-bold text-sm shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-red-500" />
                Refine
              </button>
            </SheetTrigger>
            <SheetContent className="bg-black border-l border-zinc-900 text-white p-6 w-80 sm:w-96 max-h-screen overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-white font-black text-xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Filter & Refine
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6">
                {/* Active Filters Clear Button */}
                {(filters.category !== "all" || filters.gender !== "all" || filters.style !== "all") && (
                  <button 
                    onClick={() => setFilters({ category: "all", gender: "all", style: "all" })}
                    className="w-full text-center text-xs font-black uppercase tracking-wider text-red-500 hover:text-red-400 border border-red-900/30 bg-red-950/20 py-3 rounded-xl transition-all"
                  >
                    Clear All Filters
                  </button>
                )}

                {/* Dropdowns using Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  {/* Men's Apparel Dropdown */}
                  <AccordionItem value="mens" className="border-zinc-900">
                    <AccordionTrigger className="text-sm font-black uppercase text-zinc-200 hover:text-white py-4 hover:no-underline">
                      Men's Apparel
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1.5 pt-1 pb-4">
                      <button 
                        onClick={() => setFilters({ category: "all", gender: "men", style: "all" })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                          filters.gender === "men" && filters.category === "all" && filters.style === "all"
                            ? "bg-red-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        )}
                      >
                        All Men's
                      </button>
                      <button 
                        onClick={() => setFilters({ category: "Shirts", gender: "men", style: "all" })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                          filters.gender === "men" && filters.category === "Shirts" && filters.style !== "v-neck"
                            ? "bg-red-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        )}
                      >
                        Shirts
                      </button>
                      <button 
                        onClick={() => setFilters({ category: "Hoodies", gender: "men", style: "all" })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                          filters.gender === "men" && filters.category === "Hoodies"
                            ? "bg-red-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        )}
                      >
                        Hoodies
                      </button>
                      <button 
                        onClick={() => setFilters({ category: "all", gender: "men", style: "v-neck" })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                          filters.gender === "men" && filters.style === "v-neck"
                            ? "bg-red-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        )}
                      >
                        V-Necks
                      </button>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Women's Apparel Dropdown */}
                  <AccordionItem value="womens" className="border-zinc-900">
                    <AccordionTrigger className="text-sm font-black uppercase text-zinc-200 hover:text-white py-4 hover:no-underline">
                      Women's Apparel
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1.5 pt-1 pb-4">
                      <button 
                        onClick={() => setFilters({ category: "all", gender: "women", style: "all" })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                          filters.gender === "women" && filters.category === "all" && filters.style === "all"
                            ? "bg-red-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        )}
                      >
                        All Women's
                      </button>
                      <button 
                        onClick={() => setFilters({ category: "Shirts", gender: "women", style: "all" })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                          filters.gender === "women" && filters.category === "Shirts" && filters.style !== "v-neck"
                            ? "bg-red-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        )}
                      >
                        Shirts
                      </button>
                      <button 
                        onClick={() => setFilters({ category: "Hoodies", gender: "women", style: "all" })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                          filters.gender === "women" && filters.category === "Hoodies"
                            ? "bg-red-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        )}
                      >
                        Hoodies
                      </button>
                      <button 
                        onClick={() => setFilters({ category: "all", gender: "women", style: "v-neck" })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                          filters.gender === "women" && filters.style === "v-neck"
                            ? "bg-red-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        )}
                      >
                        V-Necks
                      </button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Dedicated V-Necks Filter Button */}
                <div className="pt-5 border-t border-zinc-900">
                  <h4 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-3">Style Filter</h4>
                  <button 
                    onClick={() => setFilters({ category: "all", gender: "all", style: "v-neck" })}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all border",
                      filters.style === "v-neck"
                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    )}
                  >
                    <span>V-Necks Only</span>
                    <span className="text-[10px] bg-black/30 px-2.5 py-0.5 rounded font-black text-red-400">HOT</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <CategoryBar active={activeCategoryId} onChange={handleCategoryBarChange} />
      </div>

      {/* Product Grid / Collection Sections */}
      <div className="px-5 pb-16 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl bg-zinc-900" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-900" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-900" />
                </div>
              ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No products found</p>
            <p className="text-zinc-600 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : isDefaultView ? (
          <div className="space-y-14">
            {/* Shirts Collection */}
            {groupedProducts.shirts.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-end justify-between border-b border-zinc-900 pb-3">
                  <h2 className="text-white font-black text-xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Shirts Collection
                  </h2>
                  <span className="text-zinc-600 text-xs font-bold tracking-wider uppercase">
                    {groupedProducts.shirts.length} items
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {groupedProducts.shirts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hoodies Collection */}
            {groupedProducts.hoodies.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-end justify-between border-b border-zinc-900 pb-3">
                  <h2 className="text-white font-black text-xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Hoodies & Outerwear
                  </h2>
                  <span className="text-zinc-600 text-xs font-bold tracking-wider uppercase">
                    {groupedProducts.hoodies.length} items
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {groupedProducts.hoodies.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Can Koozies Collection */}
            {groupedProducts.koozies.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-end justify-between border-b border-zinc-900 pb-3">
                  <h2 className="text-white font-black text-xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Custom Can Koozies
                  </h2>
                  <span className="text-zinc-600 text-xs font-bold tracking-wider uppercase">
                    {groupedProducts.koozies.length} items
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {groupedProducts.koozies.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Steel Tumblers Collection */}
            {groupedProducts.steelTumblers.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-end justify-between border-b border-zinc-900 pb-3">
                  <h2 className="text-white font-black text-xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Custom Steel Tumblers
                  </h2>
                  <span className="text-zinc-600 text-xs font-bold tracking-wider uppercase">
                    {groupedProducts.steelTumblers.length} items
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {groupedProducts.steelTumblers.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Wine Tumblers Collection */}
            {groupedProducts.wineTumblers.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-end justify-between border-b border-zinc-900 pb-3">
                  <h2 className="text-white font-black text-xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Custom Wine Tumblers
                  </h2>
                  <span className="text-zinc-600 text-xs font-bold tracking-wider uppercase">
                    {groupedProducts.wineTumblers.length} items
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {groupedProducts.wineTumblers.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Concert Gear Section */}
            {groupedProducts.other.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-end justify-between border-b border-zinc-900 pb-3">
                  <h2 className="text-white font-black text-xl tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Other Concert Gear
                  </h2>
                  <span className="text-zinc-600 text-xs font-bold tracking-wider uppercase">
                    {groupedProducts.other.length} items
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {groupedProducts.other.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={handleQuickAdd}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Concert QR Code Block - Centered banner layout at base of collection lists */}
            <div className="pt-8 border-t border-zinc-900 flex justify-center">
              <div className="w-full max-w-md">
                <ConcertQRCodeCard />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickAdd={handleQuickAdd}
                  index={i}
                />
              ))}
              <ConcertQRCodeCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}