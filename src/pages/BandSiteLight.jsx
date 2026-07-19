import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, Play, ArrowUpRight, ArrowRight } from "lucide-react";

// Theme B: light editorial / streetwear take on the band landing page.
// Same sections and placeholder content as BandSite (Theme A, dark glitch)
// so the two can be compared like-for-like.

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
  { title: "AFTERSHOCK", year: "2026", accent: "from-orange-200 to-orange-400" },
  { title: "STATIC BLOOM", year: "2023", accent: "from-stone-200 to-stone-400" },
  { title: "PAPER SUNS", year: "2020", accent: "from-amber-100 to-amber-300" },
  { title: "NULL SIGNAL", year: "2017", accent: "from-neutral-300 to-neutral-500" },
];

const VIDEOS = [
  { title: "Collapse (Official Video)", views: "12M views" },
  { title: "Wire & Bone (Live)", views: "4.2M views" },
  { title: "Aftershock — Behind the Scenes", views: "1.8M views" },
];

const MERCH = [
  { name: "Aftershock Tour Tee", price: "$35" },
  { name: "Glitch Logo Hoodie", price: "$70" },
  { name: "Static Bloom Vinyl", price: "$28" },
  { name: "Redline Snapback", price: "$30" },
];

const NAV_LINKS = ["Music", "Tour", "Video", "Store", "News"];

export default function BandSiteLight() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const el = document.getElementById("bandsite-light-scroll");
    const onScroll = () => setScrolled(el.scrollTop > 40);
    el?.addEventListener("scroll", onScroll);
    return () => el?.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(`bsl-${id.toLowerCase()}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      id="bandsite-light-scroll"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#faf7f2] text-neutral-900"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ── Nav ───────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 h-16 transition-all duration-300 ${
          scrolled ? "bg-[#faf7f2]/95 backdrop-blur border-b border-neutral-200" : "bg-transparent"
        }`}
      >
        <button onClick={() => scrollTo("hero")} className="text-xl font-black tracking-tight">
          YOYOZ<span className="text-orange-500">.</span>
        </button>
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <button
              key={l}
              onClick={() => scrollTo(l)}
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              {l}
            </button>
          ))}
          <Link
            to={createPageUrl("Shop")}
            className="bg-neutral-900 text-white rounded-full px-5 py-2 hover:bg-orange-500 transition-colors"
          >
            Shop now
          </Link>
        </nav>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#faf7f2] flex flex-col items-center justify-center gap-8 text-3xl font-black md:hidden">
          {NAV_LINKS.map((l) => (
            <button key={l} onClick={() => scrollTo(l)} className="hover:text-orange-500">
              {l}
            </button>
          ))}
          <Link to={createPageUrl("Shop")} className="text-orange-500">
            Shop now
          </Link>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        id="bsl-hero"
        className="relative min-h-screen flex flex-col justify-end px-5 md:px-12 pb-20 pt-32 border-b border-neutral-200"
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 75% 30%, rgba(249,115,22,0.18), transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-6xl">
          <p className="text-orange-600 font-semibold tracking-widest text-sm uppercase mb-4">
            The new album
          </p>
          <h1 className="text-[16vw] md:text-[10rem] leading-[0.85] font-black tracking-tighter">
            AFTER
            <br />
            SHOCK<span className="text-orange-500">.</span>
          </h1>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <button
              onClick={() => scrollTo("music")}
              className="flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-full px-8 py-4 font-semibold hover:bg-orange-500 transition-colors"
            >
              <Play className="w-4 h-4 fill-current" /> Listen now
            </button>
            <button
              onClick={() => scrollTo("tour")}
              className="flex items-center justify-center gap-2 font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              See tour dates <ArrowRight className="w-4 h-4" />
            </button>
            <p className="sm:ml-auto text-neutral-400 text-sm">Out now — stream everywhere</p>
          </div>
        </div>
      </section>

      {/* ── Tour ──────────────────────────────────────────── */}
      <section id="bsl-tour" className="py-24 px-5 md:px-12 max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Tour</h2>
          <p className="text-neutral-400 text-sm hidden sm:block">Aftershock Tour 2026 — North America</p>
        </div>
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {TOUR_DATES.map((show) => (
            <div
              key={`${show.date}-${show.city}`}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 py-6 group"
            >
              <span className="text-neutral-400 font-mono text-sm w-20 shrink-0">{show.date}</span>
              <div className="flex-1">
                <p className="font-bold text-xl tracking-tight group-hover:text-orange-600 transition-colors">
                  {show.city}
                </p>
                <p className="text-neutral-400 text-sm">{show.venue}</p>
              </div>
              <button
                disabled={show.status === "SOLD OUT"}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                  show.status === "SOLD OUT"
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    : "bg-neutral-900 text-white hover:bg-orange-500"
                }`}
              >
                {show.status === "SOLD OUT" ? "Sold out" : show.status === "LOW STOCK" ? "Low stock" : "Tickets"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Music ─────────────────────────────────────────── */}
      <section id="bsl-music" className="py-24 px-5 md:px-12 max-w-6xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-12">Music</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {ALBUMS.map((album) => (
            <div key={album.title} className="group cursor-pointer">
              <div
                className={`aspect-square rounded-2xl bg-gradient-to-br ${album.accent} relative overflow-hidden flex items-end p-5 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all`}
              >
                <span className="font-black text-lg md:text-xl tracking-tight text-neutral-900/80">
                  {album.title}
                </span>
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 fill-neutral-900 text-neutral-900 ml-0.5" />
                </div>
              </div>
              <p className="mt-3 text-neutral-400 text-sm">{album.year}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Video ─────────────────────────────────────────── */}
      <section id="bsl-video" className="py-24 px-5 md:px-12 max-w-6xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-12">Video</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {VIDEOS.map((video) => (
            <div key={video.title} className="group cursor-pointer">
              <div className="aspect-video rounded-2xl bg-neutral-200 relative flex items-center justify-center overflow-hidden group-hover:bg-neutral-300 transition-colors">
                <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-neutral-900 text-neutral-900 ml-0.5" />
                </div>
              </div>
              <p className="mt-3 font-semibold">{video.title}</p>
              <p className="text-neutral-400 text-sm">{video.views}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Store ─────────────────────────────────────────── */}
      <section id="bsl-store" className="py-24 px-5 md:px-12 max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Store</h2>
          <Link
            to={createPageUrl("Shop")}
            className="flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-500 text-sm"
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {MERCH.map((item) => (
            <Link to={createPageUrl("Shop")} key={item.name} className="group">
              <div className="aspect-square rounded-2xl bg-white border border-neutral-200 group-hover:border-orange-400 group-hover:shadow-lg transition-all flex items-center justify-center">
                <span className="text-5xl font-black text-neutral-200 group-hover:text-orange-200 transition-colors">
                  YZ
                </span>
              </div>
              <p className="mt-3 font-semibold">{item.name}</p>
              <p className="text-neutral-400">{item.price}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── News / Newsletter ─────────────────────────────── */}
      <section id="bsl-news" className="py-24 px-5 md:px-12 bg-neutral-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            Join the underground<span className="text-orange-500">.</span>
          </h2>
          <p className="text-neutral-400 mb-10">
            Tour presales, drops, and news — straight to your inbox. No spam, just noise.
          </p>
          {subscribed ? (
            <p className="text-orange-400 font-bold text-lg">You're in. Welcome.</p>
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
                placeholder="Email address"
                className="flex-1 bg-neutral-800 border border-neutral-700 focus:border-orange-500 outline-none rounded-full px-6 py-4 placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-400 font-bold rounded-full px-8 py-4 transition-colors"
              >
                Sign up
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-12 px-5 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-neutral-400 text-sm bg-neutral-900 border-t border-neutral-800">
        <span className="text-lg font-black text-white">
          YOYOZ<span className="text-orange-500">.</span>
        </span>
        <div className="flex gap-6">
          {["Instagram", "YouTube", "TikTok", "X"].map((s) => (
            <span key={s} className="hover:text-orange-400 cursor-pointer transition-colors">
              {s}
            </span>
          ))}
        </div>
        <span>© 2026 YOYOZ. All rights reserved.</span>
      </footer>
    </div>
  );
}
