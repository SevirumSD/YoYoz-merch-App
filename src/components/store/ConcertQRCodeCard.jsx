import React from "react";
import { QrCode, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ConcertQRCodeCard() {
  const targetUrl = window.location.origin || "https://boogie-the-yo-yoz-merch-store-cop-66b7a717.base44.app";
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    targetUrl
  )}&size=300x300&color=000000&bgcolor=ffffff&margin=15`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden border border-red-600/30 p-6 flex flex-col items-center text-center shadow-[0_0_35px_rgba(220,38,38,0.15)] bg-zinc-950"
      style={{
        background: "linear-gradient(170deg, #101012 0%, #060607 100%)",
      }}
    >
      {/* Decorative Ticket Perforations (Left & Right) */}
      <div className="absolute top-1/2 -left-3 w-6 h-6 bg-black rounded-full border border-red-600/30 z-10" />
      <div className="absolute top-1/2 -right-3 w-6 h-6 bg-black rounded-full border border-red-600/30 z-10" />

      {/* Header Band */}
      <div className="flex items-center gap-2 mb-4 w-full justify-center">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-red-600/50" />
        <Flame className="w-4 h-4 text-red-500 animate-pulse" />
        <span className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase">
          CONCERT PASS
        </span>
        <Flame className="w-4 h-4 text-red-500 animate-pulse" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-red-600/50" />
      </div>

      <div className="relative group mb-5 mt-1 bg-white p-3.5 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:scale-[1.02]">
        {/* QR Code image */}
        <img
          src={qrImageUrl}
          alt="Scan to Download App"
          className="w-40 h-40 md:w-44 md:h-44 object-contain rounded-lg"
        />
        {/* Inner QR Icon overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
          <QrCode className="w-8 h-8 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-white font-black text-sm tracking-tight leading-snug text-center max-w-[240px] uppercase flex flex-col items-center gap-2">
        <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
        Scan here at the concert to download our official app!
      </h4>

      {/* Status Live Dot */}
      <div className="flex items-center gap-1.5 mt-5 bg-red-950/40 border border-red-900/50 px-3.5 py-1.5 rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
          LIVE MERCH TABLE FEED
        </span>
      </div>

      {/* Background Concert Laser Line Effects */}
      <div className="absolute -bottom-10 left-1/4 w-32 h-32 bg-red-600/5 blur-[50px] pointer-events-none rounded-full" />
      <div className="absolute -top-10 right-1/4 w-32 h-32 bg-red-600/5 blur-[50px] pointer-events-none rounded-full" />
    </motion.div>
  );
}
