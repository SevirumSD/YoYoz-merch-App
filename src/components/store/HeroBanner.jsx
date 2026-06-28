import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
    title: "BOOGIE & THE YO-YOZ",
    subtitle: "Official Merch Store",
    cta: "Shop Now",
  },
  {
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80",
    title: "2026 WORLD TOUR",
    subtitle: "Exclusive Tour Gear Available",
    cta: "Tour Merch",
  },
  {
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
    title: "NEW DROPS",
    subtitle: "Fresh Designs Just Landed",
    cta: "See What's New",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[85vh] min-h-[500px] max-h-[700px] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroSlides[current].image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />

      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 px-6 text-center">
        {/* Logo mark */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="inline-flex items-center gap-2 bg-red-600/90 backdrop-blur-sm px-4 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold tracking-[0.3em] uppercase">
              Official Store
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-none mb-3">
              {heroSlides[current].title}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-light mb-8">
              {heroSlides[current].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4">
          <Link to={createPageUrl("Shop")}>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 text-lg rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]">
              Shop Now
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <Link to={createPageUrl("Shop") + "?filter=tour_exclusive"}>
            <Button
              variant="outline"
              className="border-2 border-white/30 text-white font-bold px-8 py-6 text-lg rounded-full hover:bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
            >
              Tour Gear
            </Button>
          </Link>
        </div>

        {/* Slide indicators */}
        <div className="flex gap-2 mt-8">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-red-500" : "w-4 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}