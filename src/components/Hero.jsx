import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getToken } from "../utils/api";
import HeroCarousel from "./HeroCarousel";

const QUICK_LINKS = [
  {
    to: "/circulars",
    title: "Recent Circulars",
    hint: "Notices, exam dates and deadlines",
    icon: "M3 8l9-5 9 5-9 5-9-5zm0 0v8l9 5 9-5V8",
  },
  {
    to: "/applications",
    title: "Application Status",
    hint: "Track every step of your application",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    to: "/important-dates",
    title: "Important Dates",
    hint: "Form fill-up, admit card, results",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
];

const Arrow = () => (
  <svg className="ml-2 -mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

export default function Hero() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
  const [q, setQ] = useState("");

  // update right away after login / logout
  useEffect(() => {
    const sync = () => setIsLoggedIn(!!getToken());
    window.addEventListener("auth-change", sync);
    return () => window.removeEventListener("auth-change", sync);
  }, []);

  const scrollToFeatures = (e) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  // "DU" typed here opens /circulars?q=DU, and Circulars.jsx reads q from the URL
  const onSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/circulars?q=${encodeURIComponent(term)}` : "/circulars");
  };

  const primaryBtn =
    "inline-flex items-center justify-center rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-slate-soft shadow-lg shadow-gold/25 transition hover:-translate-y-0.5";
  const ghostBtn =
    "inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10";

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-navy to-navy-light">
      <HeroCarousel />
      {/* overlay: keeps text readable on any photo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/80 via-navy/60 to-navy/90" />
      <div className="spin-slow pointer-events-none absolute -right-20 -top-20 -z-10 h-80 w-80 rounded-full border border-dashed border-amber-500/40" />
      <div className="float-y pointer-events-none absolute right-5 top-10 -z-10 h-52 w-52 rounded-full border border-gold/20" />
      <div className="float-y pointer-events-none absolute -left-10 top-1/3 -z-10 h-40 w-40 rounded-full bg-gold/10 blur-2xl" style={{ animationDelay: "-3s" }} />

      <div className="mx-auto max-w-screen-xl px-4 pb-32 pt-14 text-center lg:px-12 lg:pb-36 lg:pt-20">
        <Link
          to="/circulars"
          style={{ animationDelay: "50ms" }}
          className="fade-up mb-7 inline-flex items-center rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 text-sm text-slate-100 transition hover:bg-white/15"
        >
          <span className="mr-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-slate-soft">New</span>
          Session 2026&ndash;27 admissions are now open
          <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Link>

        <h1 style={{ animationDelay: "180ms" }}
          className="fade-up font-display mb-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
          Welcome to <span className="shimmer-text italic">Admito</span>
          <br className="hidden md:block" /> begin your session here
        </h1>

        <p style={{ animationDelay: "320ms" }} className="fade-up mx-auto mb-8 max-w-3xl text-lg text-slate-200 lg:text-xl">
          One portal to find circulars, apply, and track everything about your admission: status, important
          dates, and reminders, all in one place.
        </p>

        {/* search */}
        <form onSubmit={onSearch} style={{ animationDelay: "440ms" }} className="fade-up mx-auto mb-8 flex max-w-xl overflow-hidden rounded-xl bg-white shadow-lg">
          <label htmlFor="hero-search" className="sr-only">
            Search university, unit or circular
          </label>
          <input
            id="hero-search"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search university, unit or circular…"
            className="min-w-0 flex-1 border-0 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
          />
          <button type="submit" className="bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark">
            Search
          </button>
        </form>

        {/* calls to action */}
        <div style={{ animationDelay: "560ms" }} className="fade-up mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row lg:mb-16">
          {isLoggedIn ? (
            <Link to="/applications" className={primaryBtn}>
              My applications <Arrow />
            </Link>
          ) : (
            <Link to="/login" className={primaryBtn}>
              Login / Sign up <Arrow />
            </Link>
          )}
          <Link to="/circulars" className={ghostBtn}>
            Browse circulars
          </Link>
          <a href="#features" onClick={scrollToFeatures} className="px-2 py-3 text-sm font-medium text-slate-300 hover:text-gold">
            How it works ↓
          </a>
        </div>

        {/* quick access cards */}
        <div style={{ animationDelay: "680ms" }} className="fade-up mx-auto max-w-5xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">On this portal</span>
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:-translate-y-1 hover:border-gold/40 hover:bg-white/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d={item.icon} />
                  </svg>
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white group-hover:text-gold">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-300">{item.hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}