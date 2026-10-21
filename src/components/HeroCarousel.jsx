/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
const INTERVAL = 6000; // ms per slide

// Shown until you upload your own slides in Admin → Banners
const FALLBACK = [
  {
    _id: "f1",
    bg: "bg-gradient-to-br from-[#4a3213] via-navy to-navy-light",
    title: "Session 2026–27 admissions are open",
    subtitle: "Find your circular and apply in minutes.",
    ctaLabel: "Browse circulars",
    ctaLink: "/circulars",
  },
  {
    _id: "f2",
    bg: "bg-gradient-to-br from-[#0b3b4a] via-navy to-navy-light",
    title: "Never miss a deadline again",
    subtitle: "Reminders for forms, admit cards and exams, automatically.",
    ctaLabel: "Important dates",
    ctaLink: "/important-dates",
  },
  {
    _id: "f3",
    bg: "bg-gradient-to-br from-[#2b2358] via-navy to-navy-light",
    title: "Track every application in one place",
    subtitle: "From submitted to admitted, see exactly where you stand.",
    ctaLabel: "My applications",
    ctaLink: "/applications",
  },
];

const Cta = ({ to, children }) => {
  const cls =
    "inline-flex items-center gap-1 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-slate-soft transition hover:-translate-y-0.5 hover:bg-gold-400";
  return /^https?:/i.test(to) ? (
    <a href={to} target="_blank" rel="noreferrer" className={cls}>{children} →</a>
  ) : (
    <Link to={to} className={cls}>{children} →</Link>
  );
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState(FALLBACK);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = slides.length;
  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // load slides the admin uploaded; keep the fallback if there are none or the API is down
  useEffect(() => {
    let live = true;
    fetch(`${API}/banners`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (live && Array.isArray(data) && data.length) {
          setSlides(data);
          setIndex(0);
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  // autoplay (restarts whenever the slide changes)
  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, count, go, reduceMotion]);

  // don't keep spinning while the tab is hidden
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  const onKey = (e) => {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  };

  const cur = slides[index];
  const arrow = "flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-gold hover:text-slate-soft";

  return (
    <>
      {/* picture layer */}
      <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
        {slides.map((s, i) => (
          <div key={s._id} className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}>
            {s.imageUrl ? (
              <img
                src={s.imageUrl}
                alt=""
                decoding="async"
                loading={i === 0 ? "eager" : "lazy"}
                className={`h-full w-full object-cover ${i === index ? "kenburns" : ""}`}
              />
            ) : (
              <div className={`h-full w-full ${s.bg}`} />
            )}
          </div>
        ))}
      </div>

      {/* controls + caption */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured announcements"
        tabIndex={0}
        onKeyDown={onKey}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        className="absolute inset-x-0 bottom-0 z-10 outline-none"
      >
        <div className="relative mx-auto flex max-w-screen-xl flex-col items-center gap-3 px-4 pb-[4.5rem] sm:gap-4 sm:pb-24 lg:px-12">
          <div key={cur._id} className="fade-up min-h-[3.5rem] text-center" aria-live="polite">
            {cur.title && <p className="font-display text-base font-semibold text-white sm:text-xl">{cur.title}</p>}
            {cur.subtitle && <p className="mt-0.5 text-[0.8rem] text-slate-200 sm:text-sm">{cur.subtitle}</p>}
            {cur.ctaLabel && cur.ctaLink && (
              <div className="mt-2">
                <Cta to={cur.ctaLink}>{cur.ctaLabel}</Cta>
              </div>
            )}
          </div>

          {count > 1 && (
            <div className="flex items-center gap-3 sm:absolute sm:bottom-24 sm:right-6 lg:right-20">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className={arrow}>‹</button>
              <div className="flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index}
                    className={`relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all ${i === index ? "w-10" : "w-4 hover:bg-white/60"}`}
                  >
                    {i === index && (
                      <span
                        key={`${index}-${paused}`}
                        className="absolute inset-0 origin-left rounded-full bg-gold"
                        style={{ animation: reduceMotion ? "none" : `progress ${INTERVAL}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className={arrow}>›</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
