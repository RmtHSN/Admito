import { API_URL as API } from "../utils/config";
import { useEffect, useState } from "react";
import { CountUp, Reveal } from "./Reveal";

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
    <section className="relative z-10 -mt-12 px-3 sm:-mt-14 sm:px-4">
      <div className="mx-auto grid max-w-4xl grid-cols-3 gap-1 rounded-2xl border border-stone-300 bg-white p-2 shadow-xl sm:gap-3 sm:p-4">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 100} className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-center sm:flex-row sm:gap-4 sm:px-4 sm:py-3 sm:text-left">
            <span className="relative flex h-3 w-3 shrink-0">
              {(it.live || it.warn) && (
                <span className={`absolute inset-0 rounded-full ${it.warn ? "bg-red-400" : "bg-emerald-400"}`} style={{ animation: "ping-soft 1.8s ease-out infinite" }} />
              )}
              <span className={`relative h-3 w-3 rounded-full ${it.warn ? "bg-red-500" : it.live ? "bg-emerald-500" : "bg-[#805827]"}`} />
            </span>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-semibold leading-none text-slate-800">
                <CountUp to={it.value} />
              </p>
              <p className="mt-1 text-[0.65rem] font-medium uppercase leading-tight tracking-wide sm:text-xs text-slate-500">{it.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
