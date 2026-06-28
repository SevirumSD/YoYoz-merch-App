import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Flame } from "lucide-react";

export default function FeaturedBanner() {
  return (
    <section className="px-5 py-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 via-red-800 to-zinc-900 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-red-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span className="text-white/80 text-xs font-bold tracking-wider uppercase">
                Limited Edition
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              2026 WORLD TOUR<br />COLLECTION
            </h2>
            <p className="text-red-200/70 mt-3 text-sm md:text-base max-w-md">
              Exclusive merch only available during the tour. Once it's gone, it's gone forever.
            </p>
            <Link to={createPageUrl("Shop") + "?filter=tour_exclusive"}>
              <Button className="mt-6 bg-white text-black font-bold px-8 py-5 rounded-full hover:bg-red-100 transition-all hover:scale-105">
                Shop Tour Merch
              </Button>
            </Link>
          </div>
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shrink-0 rotate-3 shadow-2xl shadow-red-900/50">
            <img
              src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80"
              alt="Tour merch"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}