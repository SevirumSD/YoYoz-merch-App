import React from "react";
import { Lock, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ComingSoonCard({ index = 0 }) {
  // Staggered delay based on index for fade-in entry animation
  const delay = index * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        borderColor: [
          "rgba(220, 38, 38, 0.06)", 
          "rgba(220, 38, 38, 0.22)", 
          "rgba(220, 38, 38, 0.06)"
        ],
        boxShadow: [
          "0 0 15px rgba(220, 38, 38, 0.02), inset 0 0 15px rgba(0,0,0,0.6)",
          "0 0 25px rgba(220, 38, 38, 0.12), inset 0 0 25px rgba(220, 38, 38, 0.03)",
          "0 0 15px rgba(220, 38, 38, 0.02), inset 0 0 15px rgba(0,0,0,0.6)"
        ]
      }}
      whileHover={{
        y: -6,
        borderColor: "rgba(220, 38, 38, 0.45)",
        boxShadow: "0 0 30px rgba(220, 38, 38, 0.22), 0 10px 40px rgba(0,0,0,0.8)",
      }}
      transition={{ 
        opacity: { delay, duration: 0.4 },
        y: { delay, duration: 0.4 },
        borderColor: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        boxShadow: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      className="group relative rounded-2xl overflow-hidden border bg-zinc-950/40 select-none flex flex-col justify-between"
      style={{
        background: "linear-gradient(165deg, #0d0d0d 0%, #050505 100%)",
      }}
    >
      {/* Visual Area */}
      <div
        className="aspect-square relative overflow-hidden bg-zinc-950 flex flex-col items-center justify-center border-b border-zinc-900/30"
        style={{
          background: `radial-gradient(circle at center, rgba(220, 38, 38, 0.03) 0%, #040404 80%)`,
        }}
      >
        {/* Subtle pulsing background glow layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220, 38, 38, 0.06)_0%,transparent_60%)] animate-pulse" style={{ animationDuration: "4s" }} />

        {/* Center Graphic */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-dashed border-red-950/40">
          <div className="absolute inset-0 rounded-full bg-red-950/5 blur-md animate-pulse" />
          <Flame className="w-8 h-8 text-red-900/30 group-hover:text-red-700/40 transition-colors duration-500 animate-pulse" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-red-950/20 group-hover:text-red-600/30 transition-colors duration-500" />
        </div>

        {/* Locked Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="inline-flex items-center gap-1 bg-red-950/20 border border-red-900/20 text-red-500/50 font-black text-[9px] tracking-widest px-2.5 py-1 rounded uppercase">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Info & Buy Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="font-black text-base text-zinc-600 group-hover:text-red-900/60 transition-colors duration-300 uppercase tracking-widest leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            COMING SOON
          </h3>
          
          <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
            <span>Next Design Drop</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>Tour Edition</span>
          </p>
        </div>

        {/* Bottom Lock / Action Area */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-zinc-900/20">
          <span
            className="text-xl font-black text-zinc-800 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            $--.--
          </span>

          <button
            disabled
            className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider bg-zinc-950 border border-zinc-900 text-zinc-700 cursor-not-allowed transition-colors"
          >
            <Lock className="w-3 h-3 text-zinc-800" />
            Locked
          </button>
        </div>
      </div>
    </motion.div>
  );
}
