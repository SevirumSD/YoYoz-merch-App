import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Copy, Zap, Flame, Check, Lock, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const QUICK_TEMPLATES = [
  { label: "QR to App Home",        icon: "🏠", labelText: "Scan for Yo-Yoz Merch!" },
  { label: "New Drops",             icon: "⚡", labelText: "NEW DROPS — Scan Now!" },
  { label: "Tour Exclusives",       icon: "🎸", labelText: "Tour Exclusives Here!" },
  { label: "TikTok Funnel",         icon: "📱", labelText: "Scan for Show Perks!" },
  { label: "Post-Show Restock",     icon: "🔄", labelText: "Post-Show Restocks Here!" },
  { label: "App Download Prompt",   icon: "⬇️", labelText: "Download for Show Perks!" },
];

const LABEL_SUGGESTIONS = [
  "Scan for Yo-Yoz App Exclusives!",
  "Post-Show Restocks Here!",
  "Download for Show Perks!",
  "Scan to Shop Merch 🎸",
  "Don't Miss Out — Scan Now!",
];

export default function QRTools() {
  const cardRef = useRef(null);

  const [url, setUrl] = useState(() => window.location.origin);
  const [labelText, setLabelText] = useState("Scan for Yo-Yoz App Exclusives!");
  const [qrUrl, setQrUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me-qr"],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const buildQrImageUrl = (targetUrl) =>
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(targetUrl)}&size=400x400&color=000000&bgcolor=ffffff&margin=10`;

  const templateUrls = {
    "QR to App Home":       window.location.origin,
    "New Drops":            `${window.location.origin}${createPageUrl("Shop")}?filter=new`,
    "Tour Exclusives":      `${window.location.origin}${createPageUrl("Shop")}?filter=tour_exclusive`,
    "TikTok Funnel":        window.location.origin,
    "Post-Show Restock":    `${window.location.origin}${createPageUrl("Shop")}`,
    "App Download Prompt":  window.location.origin,
  };

  const handleTemplate = (t) => {
    const targetUrl = templateUrls[t.label] || window.location.origin;
    setUrl(targetUrl);
    setLabelText(t.labelText);
    setQrUrl(buildQrImageUrl(targetUrl));
  };

  const handleGenerate = () => {
    if (!url) return;
    setQrUrl(buildQrImageUrl(url));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      backgroundColor: "#000000",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "boogie-yo-yoz-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloading(false);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-white font-black text-2xl mb-2">ADMIN ONLY</h2>
          <p className="text-zinc-500 mb-6 max-w-xs mx-auto">QR Tools are reserved for band admins & merchants at the merch table.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-red-600 hover:bg-red-700 rounded-full px-8">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-28">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight leading-none">MERCH TABLE QR</h1>
            <p className="text-red-500 text-xs font-bold tracking-widest uppercase mt-0.5">Admin Tools</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm leading-relaxed">
            <span className="text-red-500 font-bold">📋 Print these at your merch table</span> — fans scan to access app exclusives & restocks without pulling sales away from the table!
          </p>
        </div>
      </div>

      <div className="px-5 max-w-2xl mx-auto space-y-6">

        {/* Quick Templates */}
        <div>
          <h2 className="text-white font-black text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-red-500" />
            Quick Templates
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => handleTemplate(t)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-600/50 rounded-xl p-3 text-left transition-all group"
              >
                <span className="text-xl block mb-1">{t.icon}</span>
                <p className="text-white font-bold text-xs group-hover:text-red-400 transition-colors leading-tight">{t.label}</p>
                <p className="text-zinc-600 text-[10px] mt-1 truncate">{t.labelText}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Form */}
        <div className="bg-zinc-900 rounded-2xl p-5 space-y-5">
          <h2 className="text-white font-black text-xs tracking-widest uppercase flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Custom QR Code
          </h2>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-medium">URL / Link to encode</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl text-sm"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: "Homepage", path: "" },
                { label: "Shop", path: createPageUrl("Shop") },
                { label: "New Drops", path: createPageUrl("Shop") + "?filter=new" },
                { label: "Tour Merch", path: createPageUrl("Shop") + "?filter=tour_exclusive" },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setUrl(window.location.origin + p.path)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-zinc-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-medium">Label / Call-to-action text</Label>
            <Input
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="e.g. Scan for Yo-Yoz App Exclusives!"
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl text-sm"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {LABEL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setLabelText(s)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-zinc-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!url}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-xl text-base transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Generate QR Code
          </Button>
        </div>

        {/* Generated QR */}
        {qrUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Printable Card */}
            <div
              ref={cardRef}
              className="bg-black border-2 border-red-600 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(220,38,38,0.15)]"
            >
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="h-px w-8 bg-red-600" />
                <Flame className="w-4 h-4 text-red-500" />
                <span className="text-white font-black text-sm tracking-[0.25em] uppercase">
                  BOOGIE & THE YO-YOZ
                </span>
                <Flame className="w-4 h-4 text-red-500" />
                <div className="h-px w-8 bg-red-600" />
              </div>

              <div className="bg-white rounded-2xl p-3 inline-block shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  crossOrigin="anonymous"
                  className="w-52 h-52 md:w-64 md:h-64 block"
                />
              </div>

              <p className="text-red-500 font-black text-xl md:text-2xl mt-5 uppercase tracking-wide leading-tight">
                {labelText}
              </p>

              <p className="text-zinc-700 text-[10px] mt-3 break-all font-mono px-4">
                {url}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold rounded-xl py-5 transition-all"
              >
                {downloading
                  ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  : <Download className="w-4 h-4 mr-2" />}
                {downloading ? "Saving…" : "Download PNG"}
              </Button>
              <Button
                onClick={handleCopy}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold rounded-xl py-5 transition-all"
              >
                {copied
                  ? <Check className="w-4 h-4 mr-2 text-green-500" />
                  : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy URL"}
              </Button>
            </div>

            <p className="text-zinc-600 text-xs text-center">
              Download the PNG to print on flyers, posters, or show it on your phone at the merch table 🤘
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}