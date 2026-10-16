import { useEffect, useState } from "react";
import { CountUp, Reveal } from "./Reveal";

const API = import.meta.env.VITE_API_URL;
const DAY = 86400000;

// Real numbers from your own circulars, so the home page always reflects the portal's current state
export default function LiveStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let live = true;
    fetch(`${API}/circulars`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!live || !Array.isArray(list)) return;
        const now = Date.now();
        setStats({
          total: list.length,
          open: list.filter((c) => c.status === "open").length,
          closing: list.filter((c) => c.status === "open" && new Date(c.applyDeadline) - now > 0 && new Date(c.applyDeadline) - now <= 7 * DAY).length,
        });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (!stats) return null;

  const items = [
    { label: "Circulars published", value: stats.total },
    { label: "Open for applications", value: stats.open, live: true },
    { label: "Closing within 7 days", value: stats.closing, warn: true },
  ];

  return (
    <section className="relative z-10 -mt-14 px-4">
      <div className="mx-auto grid max-w-4xl gap-3 rounded-2xl border border-stone-300 bg-white p-4 shadow-xl sm:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 100} className="flex items-center gap-4 rounded-xl px-4 py-3">
            <span className="relative flex h-3 w-3 shrink-0">
              {(it.live || it.warn) && (
                <span className={`absolute inset-0 rounded-full ${it.warn ? "bg-red-400" : "bg-emerald-400"}`} style={{ animation: "ping-soft 1.8s ease-out infinite" }} />
              )}
              <span className={`relative h-3 w-3 rounded-full ${it.warn ? "bg-red-500" : it.live ? "bg-emerald-500" : "bg-[#805827]"}`} />
            </span>
            <div>
              <p className="font-display text-3xl font-semibold leading-none text-slate-800">
                <CountUp to={it.value} />
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{it.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
