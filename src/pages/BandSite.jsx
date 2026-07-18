import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, Play, ArrowUpRight, ChevronRight } from "lucide-react";

// Band-site landing page styled after modern rock-band websites
// (dark, red/black, glitch-industrial aesthetic). All content is
// original placeholder material for the fictional band "YOYOZ".

const TOUR_DATES = [
  { date: "AUG 14", city: "Los Angeles, CA", venue: "Echo Arena", status: "TICKETS" },
  { date: "AUG 17", city: "Phoenix, AZ", venue: "Desert Sound Amphitheater", status: "TICKETS" },
  { date: "AUG 21", city: "Denver, CO", venue: "Redline Stadium", status: "LOW STOCK" },
  { date: "AUG 25", city: "Chicago, IL", venue: "Union Hall", status: "TICKETS" },
  { date: "AUG 29", city: "New York, NY", venue: "Meridian Garden", status: "SOLD OUT" },
  { date: "SEP 02", city: "Boston, MA", venue: "Harbor Pavilion", status: "TICKETS" },
  { date: "SEP 06", city: "Atlanta, GA", venue: "Southside Arena", status: "TICKETS" },
];

const ALBUMS = [
  { title: "AFTERSHOCK", year: "2026", accent: "from-red-600 to-red-950" },
  { title: "STATIC BLOOM", year: "2023", accent: "from-zinc-400 to-zinc-800" },
  { title: "PAPER SUNS", year: "2020", accent: "from-amber-500 to-red-900" },
  { title: "NULL SIGNAL", year: "2017", accent: "from-slate-500 to-black" },
];

const VIDEOS = [
  { title: "COLLAPSE (Official Video)", views: "12M views" },
  { title: "WIRE & BONE (Live)", views: "4.2M views" },
  { title: "AFTERSHOCK — Behind the Scenes", views: "1.8M views" },
];

const MERCH = [
  { name: "Aftershock Tour Tee", price: "$35" },
  { name: "Glitch Logo Hoodie", price: "$70" },
  { name: "Static Bloom Vinyl", price: "$28" },
  { name: "Redline Snapback", price: "$30" },
];

const NAV_LINKS = ["MUSIC", "TOUR", "VIDEO", "STORE", "NEWS"];

export default function BandSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const el = document.getElementById("bandsite-scroll");
    const onScroll = () => setScrolled(el.scrollTop > 40);
    el?.addEventListener("scroll", onScroll);
    return () => el?.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(`bs-${id.toLowerCase()}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      id="bandsite-scroll"
      className="fixed inset-0 z-50 overflow-y-auto bg-black text-white"
      style={{ fontFamily: "'Arial Narrow', 'Helvetica Neue Condensed', Impact, sans-serif" }}
    >
      <style>{`
        @keyframes bs-glitch {
          0%, 90%, 100% { transform: translate(0); clip-path: inset(0 0 0 0); }
          92% { transform: translate(-3px, 2px); clip-path: inset(10% 0 60% 0); }
          94% { transform: translate(3px, -2px); clip-path: inset(60% 0 10% 0); }
          96% { transform: translate(-2px, 0); clip-path: inset(30% 0 40% 0); }
        }
        @keyframes bs-flicker {
          0%, 100% { opacity: 1; } 97% { opacity: 1; } 98% { opacity: 0.6; } 99% { opacity: 0.9; }
        }
        .bs-glitch-text { position: relative; animation: bs-flicker 6s infinite; }
        .bs-glitch-text::before, .bs-glitch-text::after {
          content: attr(data-text); position: absolute; inset: 0;
        }
        .bs-glitch-text::before { color: #ef4444; animation: bs-glitch 4s infinite; z-index: -1; }
        .bs-glitch-text::after { color: #38bdf8; animation: bs-glitch 4.3s infinite reverse; z-index: -2; }
        .bs-scanlines::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.25) 3px 4px);
        }
        .bs-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* ── Fixed nav ─────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 h-16 transition-colors duration-300 ${
          scrolled ? "bg-black/90 backdrop-blur border-b border-red-900/40" : "bg-transparent"
        }`}
      >
        <button onClick={() => scrollTo("hero")} className="text-2xl font-black tracking-[0.35em] italic">
          YO<span className="text-red-600">YO</span>Z
        </button>
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-[0.25em]">
          {NAV_LINKS.map((l) => (
            <button key={l} onClick={() => scrollTo(l)} className="hover:text-red-500 transition-colors">
              {l}
            </button>
          ))}
          <Link
            to={createPageUrl("Shop")}
            className="border border-red-600 text-red-500 px-4 py-1.5 hover:bg-red-600 hover:text-white transition-colors"
          >
            SHOP NOW
          </Link>
        </nav>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 flex flex-col items-center justify-center gap-8 text-2xl font-black tracking-[0.3em] md:hidden">
          {NAV_LINKS.map((l) => (
            <button key={l} onClick={() => scrollTo(l)} className="hover:text-red-500">
              {l}
            </button>
          ))}
          <Link to={createPageUrl("Shop")} className="text-red-500">
            SHOP NOW
          </Link>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        id="bs-hero"
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bs-scanlines bs-noise"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/60 via-black to-black" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(220,38,38,0.45), transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center px-4">
          <p className="text-red-500 tracking-[0.6em] text-sm md:text-base font-bold mb-6">THE NEW ALBUM</p>
          <h1
            className="bs-glitch-text text-6xl md:text-9xl font-black tracking-tighter italic"
            data-text="AFTERSHOCK"
          >
            AFTERSHOCK
          </h1>
          <p className="mt-6 text-zinc-400 tracking-[0.3em] text-sm md:text-base">OUT NOW — STREAM EVERYWHERE</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo("music")}
              className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black tracking-[0.2em] px-8 py-4 transition-colors"
            >
              <Play className="w-5 h-5 fill-current" /> LISTEN NOW
            </button>
            <button
              onClick={() => scrollTo("tour")}
              className="border border-white/40 hover:border-red-500 hover:text-red-500 font-black tracking-[0.2em] px-8 py-4 transition-colors"
            >
              TOUR DATES
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600 text-xs tracking-[0.4em] animate-bounce">
          SCROLL
        </div>
      </section>

      {/* ── Tour ──────────────────────────────────────────── */}
      <section id="bs-tour" className="relative py-24 px-5 md:px-16 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2">
          WORLD <span className="text-red-600">TOUR</span>
        </h2>
        <p className="text-zinc-500 tracking-[0.3em] text-sm mb-12">AFTERSHOCK TOUR 2026 — NORTH AMERICA LEG</p>
        <div className="divide-y divide-zinc-800 border-y border-zinc-800">
          {TOUR_DATES.map((show) => (
            <div
              key={`${show.date}-${show.city}`}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-5 group hover:bg-red-950/20 transition-colors px-2"
            >
              <span className="text-red-500 font-black text-xl w-24 shrink-0">{show.date}</span>
              <div className="flex-1">
                <p className="font-black text-lg tracking-wide">{show.city}</p>
                <p className="text-zinc-500 text-sm">{show.venue}</p>
              </div>
              <button
                disabled={show.status === "SOLD OUT"}
                className={`px-6 py-2 font-black tracking-[0.2em] text-sm border transition-colors ${
                  show.status === "SOLD OUT"
                    ? "border-zinc-700 text-zinc-600 cursor-not-allowed"
                    : "border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                }`}
              >
                {show.status}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Music ─────────────────────────────────────────── */}
      <section id="bs-music" className="py-24 px-5 md:px-16 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-12">
          <span className="text-red-600">MUSIC</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {ALBUMS.map((album) => (
            <div key={album.title} className="group cursor-pointer">
              <div
                className={`aspect-square bg-gradient-to-br ${album.accent} relative overflow-hidden bs-noise flex items-end p-4 group-hover:scale-[1.02] transition-transform`}
              >
                <span className="font-black italic text-xl md:text-2xl tracking-tighter drop-shadow-lg">
                  {album.title}
                </span>
                <Play className="absolute top-4 right-4 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
              </div>
              <p className="mt-3 text-zinc-500 text-sm tracking-[0.2em]">{album.year}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Video ─────────────────────────────────────────── */}
      <section id="bs-video" className="py-24 px-5 md:px-16 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-12">
          <span className="text-red-600">VIDEO</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {VIDEOS.map((video) => (
            <div key={video.title} className="group cursor-pointer">
              <div className="aspect-video bg-zinc-900 bs-scanlines relative flex items-center justify-center border border-zinc-800 group-hover:border-red-600 transition-colors">
                <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white text-white ml-1" />
                </div>
              </div>
              <p className="mt-3 font-bold tracking-wide">{video.title}</p>
              <p className="text-zinc-500 text-sm">{video.views}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Store ─────────────────────────────────────────── */}
      <section id="bs-store" className="py-24 px-5 md:px-16 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">
            OFFICIAL <span className="text-red-600">STORE</span>
          </h2>
          <Link
            to={createPageUrl("Shop")}
            className="hidden sm:flex items-center gap-1 text-red-500 font-black tracking-[0.2em] text-sm hover:text-red-400"
          >
            VIEW ALL <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {MERCH.map((item) => (
            <Link to={createPageUrl("Shop")} key={item.name} className="group">
              <div className="aspect-square bg-zinc-900 border border-zinc-800 group-hover:border-red-600 transition-colors flex items-center justify-center bs-noise">
                <span className="text-5xl font-black italic text-zinc-700 group-hover:text-red-900 transition-colors">
                  YZ
                </span>
              </div>
              <p className="mt-3 font-bold tracking-wide">{item.name}</p>
              <p className="text-red-500 font-black">{item.price}</p>
            </Link>
          ))}
        </div>
        <Link
          to={createPageUrl("Shop")}
          className="sm:hidden mt-8 flex items-center justify-center gap-1 text-red-500 font-black tracking-[0.2em] text-sm"
        >
          VIEW ALL <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── News / Newsletter ─────────────────────────────── */}
      <section id="bs-news" className="py-24 px-5 md:px-16 bg-red-950/20 border-y border-red-900/30 bs-noise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">
            JOIN THE <span className="text-red-600">UNDERGROUND</span>
          </h2>
          <p className="text-zinc-400 tracking-wide mb-10">
            Tour presales, drops, and news — straight to your inbox. No spam, just noise.
          </p>
          {subscribed ? (
            <p className="text-red-500 font-black tracking-[0.3em] text-lg">YOU'RE IN. WELCOME.</p>
          ) : (
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="flex-1 bg-black border border-zinc-700 focus:border-red-600 outline-none px-5 py-4 tracking-[0.15em] placeholder:text-zinc-600"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-500 font-black tracking-[0.25em] px-8 py-4 transition-colors flex items-center justify-center gap-1"
              >
                SIGN UP <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-12 px-5 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-600 text-xs tracking-[0.2em]">
        <span className="text-xl font-black tracking-[0.35em] italic text-white">
          YO<span className="text-red-600">YO</span>Z
        </span>
        <div className="flex gap-6">
          {["INSTAGRAM", "YOUTUBE", "TIKTOK", "X"].map((s) => (
            <span key={s} className="hover:text-red-500 cursor-pointer transition-colors">
              {s}
            </span>
          ))}
        </div>
        <span>© 2026 YOYOZ. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  );
}
