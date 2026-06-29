import React, { useState } from "react";
import { X, Sparkles, Check, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CANVASES = [
  { id: "tee", name: "Classic Concert Tee", bg: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80", color: "#18181b" },
  { id: "hoodie", name: "Tour Pullover Hoodie", bg: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", color: "#09090b" },
  { id: "koozie", name: "Insulated Can Koozie", bg: "https://images.unsplash.com/photo-1597075095401-4475517fa2b6?w=600&q=80", color: "#ff003c" },
  { id: "tumbler", name: "20oz Steel Tumbler", bg: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80", color: "#18181b" },
];

const PLACEMENTS = [
  { id: "front", name: "Front Center", style: { top: "45%", left: "50%", transform: "translate(-50%, -50%)" } },
  { id: "chest", name: "Left Chest", style: { top: "35%", left: "38%", transform: "translate(-50%, -50%) scale(0.6)" } },
  { id: "back", name: "Back Print", style: { top: "45%", left: "50%", transform: "translate(-50%, -50%) scale(1.2)", opacity: 0.85 } },
  { id: "wrap", name: "Full Wrap", style: { top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-90deg) scale(1.3)", opacity: 0.7 } },
];

const GRAPHICS = [
  { id: "flame", name: "Band Flame Logo", svg: (
    <svg className="w-full h-full text-red-600 fill-current drop-shadow-[0_4px_12px_rgba(239,68,68,0.5)]" viewBox="0 0 24 24">
      <path d="M12 2C11.38 2.04 8.78 3.82 8.24 6.72C7.75 9.35 8.94 11.23 8.94 11.23C8.94 11.23 7.82 9.77 6.84 9.77C5.86 9.77 5 10.96 5 12.35C5 15.65 8.35 18 12 18C15.65 18 19 15.65 19 12.35C19 8.5 14.5 5 12 2ZM12 16C9.79 16 8 14.21 8 12C8 10.74 8.78 9.37 10 9C10 9 9.5 10.5 10.5 11.5C11.5 12.5 13 12.5 13 14C13 15.1 12.1 16 12 16Z"/>
    </svg>
  )},
  { id: "text", name: "Classic Yo-Yoz Insignia", svg: (
    <div className="font-black text-center tracking-tighter uppercase leading-none select-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]">
      <span className="text-white text-sm block">BOOGIE</span>
      <span className="text-red-500 text-[8px] tracking-[0.2em] block font-bold">& THE YO-YOZ</span>
    </div>
  )},
];

export default function CustomMockupModal({ isOpen, onClose }) {
  const [selectedCanvas, setSelectedCanvas] = useState(CANVASES[0]);
  const [selectedPlacement, setSelectedPlacement] = useState(PLACEMENTS[0]);
  const [selectedGraphic, setSelectedGraphic] = useState(GRAPHICS[0]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-zinc-950 border border-zinc-900 w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(220,38,38,0.15)] z-10"
        >
          {/* Mockup Canvas Area */}
          <div className="relative flex-1 bg-zinc-900/40 p-6 flex flex-col items-center justify-center min-h-[350px] md:min-h-[480px]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0%,transparent_75%)]" />

            <div className="absolute top-4 left-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Visual Placement Mockup</span>
            </div>

            {/* Canvas Template Outer Container */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950">
              <img
                src={selectedCanvas.bg}
                alt={selectedCanvas.name}
                className="w-full h-full object-cover opacity-85"
              />

              {/* Placement Overlay */}
              <div
                className="absolute w-24 h-24 flex items-center justify-center pointer-events-none transition-all duration-500"
                style={selectedPlacement.style}
              >
                {selectedGraphic.svg}
              </div>

              {/* Canvas Name Tag */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 text-[9px] font-black text-white uppercase tracking-wider">
                {selectedCanvas.name}
              </div>
            </div>
          </div>

          {/* Configurator Panel */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-900 p-6 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-6">
                <div>
                  <h3 className="text-white font-black text-base uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Custom Canvas
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Mockup Studio</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-zinc-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 1. Canvas Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">1. Select Canvas</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CANVASES.map((canvas) => (
                      <button
                        key={canvas.id}
                        onClick={() => setSelectedCanvas(canvas)}
                        className={cn(
                          "py-2.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border text-center flex flex-col items-center justify-center gap-1 cursor-pointer",
                          selectedCanvas.id === canvas.id
                            ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                            : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        )}
                      >
                        <ImageIcon className="w-3.5 h-3.5 mb-0.5" />
                        {canvas.name.split(" ")[0]} {canvas.name.split(" ").slice(-1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Placement Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">2. Select Placement</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLACEMENTS.map((placement) => (
                      <button
                        key={placement.id}
                        onClick={() => setSelectedPlacement(placement)}
                        className={cn(
                          "py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border text-center cursor-pointer",
                          selectedPlacement.id === placement.id
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        )}
                      >
                        {placement.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Graphic Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">3. Select Graphic</label>
                  <div className="space-y-1.5">
                    {GRAPHICS.map((graphic) => (
                      <button
                        key={graphic.id}
                        onClick={() => setSelectedGraphic(graphic)}
                        className={cn(
                          "w-full py-2.5 px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center justify-between cursor-pointer",
                          selectedGraphic.id === graphic.id
                            ? "bg-red-950/40 border-red-800 text-red-500"
                            : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        )}
                      >
                        <span>{graphic.name}</span>
                        {selectedGraphic.id === graphic.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-900 mt-6">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-white/5"
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
