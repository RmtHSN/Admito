import { useState, useEffect, useMemo } from "react";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// one colour + one label per category (this also acts as the legend, so no separate one is needed)
const CATS = {
  deadline: { label: "Deadline", dot: "bg-red-500", tint: "bg-red-50 text-red-700" },
  form: { label: "Form fill-up", dot: "bg-blue-500", tint: "bg-blue-50 text-blue-700" },
  admit_card: { label: "Admit card", dot: "bg-purple-500", tint: "bg-purple-50 text-purple-700" },
  exam: { label: "Exam", dot: "bg-[#FFD700]", tint: "bg-yellow-50 text-[#805827]" },
  result: { label: "Result", dot: "bg-emerald-500", tint: "bg-emerald-50 text-emerald-700" },
};

const DAY = 86400000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const daysFromToday = (date) => Math.round((startOfDay(date) - startOfDay(new Date())) / DAY);

function relative(n) {
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  return n > 0 ? `In ${n} days` : `${-n} days ago`;
}

function EventRow({ e }) {
  const cat = CATS[e.category] || CATS.exam;
  const d = new Date(e.date);
  const n = daysFromToday(d);
  const urgent = n >= 0 && n <= 3;

  return (
    <li className={`flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm sm:gap-4 sm:p-4 ${n < 0 ? "opacity-60" : "card-lift"}`}>
      <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg ${cat.tint}`}>
        <span className="text-[10px] font-semibold uppercase leading-none tracking-wide">
          {d.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-xl font-bold leading-tight">{d.getDate()}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug text-slate-800">{e.title}</p>
        <p className="mt-0.5 text-sm text-slate-500">
          {e.university} · {e.type === "public" ? "Public" : "Private"}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
            <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
            {cat.label}
          </span>
          <span className={urgent ? "font-semibold text-red-600" : "text-slate-400"}>{relative(n)}</span>
        </p>
      </div>
    </li>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Month grid. Tap a day to see its dates underneath (works well on phones).
function CalendarView({ events, monthDate, setMonthDate }) {
  const [selected, setSelected] = useState(null); // { y, m, d }
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const today = new Date();

  const byDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    return map;
  }, [events, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = new Date(year, month, 1).getDay();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;
  const firstEventDay = Object.keys(byDay).map(Number).sort((a, b) => a - b)[0] ?? null;
  const defaultDay = isThisMonth ? today.getDate() : firstEventDay;
  const activeDay = selected && selected.y === year && selected.m === month ? selected.d : defaultDay;
  const dayEvents = activeDay ? byDay[activeDay] || [] : [];
  const monthTotal = Object.values(byDay).reduce((n, a) => n + a.length, 0);

  const shift = (delta) => setMonthDate(new Date(year, month + delta, 1));
  const goToday = () => {
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected({ y: today.getFullYear(), m: today.getMonth(), d: today.getDate() });
  };

  const navBtn = "flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-stone-100";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-5">
        {/* month header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <button onClick={() => shift(-1)} aria-label="Previous month" className={navBtn}>‹</button>
          <div className="text-center">
            <p className="font-display text-lg font-semibold text-slate-800">
              {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <p className="text-xs text-slate-400">
              {monthTotal === 0 ? "No dates this month" : `${monthTotal} date${monthTotal > 1 ? "s" : ""} this month`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={goToday} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#805827] transition hover:bg-[#805827]/10">
              Today
            </button>
            <button onClick={() => shift(1)} aria-label="Next month" className={navBtn}>›</button>
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1">
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline">{d}</span>
            </span>
          ))}
        </div>

        {/* day grid (re-fades whenever the month changes) */}
        <div key={`${year}-${month}`} className="fade-in grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`b${i}`} />;
            const list = byDay[day] || [];
            const isToday = isThisMonth && day === today.getDate();
            const isActive = day === activeDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelected({ y: year, m: month, d: day })}
                aria-label={`${day} ${monthDate.toLocaleDateString("en-US", { month: "long" })}, ${list.length} date${list.length === 1 ? "" : "s"}`}
                aria-pressed={isActive}
                className={`flex min-h-[3.4rem] flex-col items-center rounded-lg border p-1 text-left transition sm:min-h-[5.2rem] sm:items-stretch sm:p-1.5 ${
                  isActive
                    ? "border-navy bg-navy text-white shadow"
                    : isToday
                      ? "border-gold bg-gold/10 text-slate-800"
                      : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-stone-50"
                }`}
              >
                <span className={`text-xs sm:text-sm ${list.length || isToday ? "font-bold" : "font-medium"} ${!list.length && !isActive && !isToday ? "text-slate-400" : ""}`}>
                  {day}
                </span>

                {/* mobile: dots */}
                <span className="mt-1 flex flex-wrap justify-center gap-0.5 sm:hidden">
                  {list.slice(0, 3).map((e) => (
                    <span key={e._id} className={`h-1.5 w-1.5 rounded-full ${(CATS[e.category] || CATS.exam).dot}`} />
                  ))}
                </span>

                {/* tablet/desktop: short labels */}
                <span className="mt-1 hidden w-full space-y-0.5 sm:block">
                  {list.slice(0, 2).map((e) => (
                    <span key={e._id} className={`block truncate rounded px-1 text-[10px] font-medium ${isActive ? "bg-white/15 text-white" : (CATS[e.category] || CATS.exam).tint}`}>
                      {e.university}
                    </span>
                  ))}
                  {list.length > 2 && <span className={`block px-1 text-[10px] ${isActive ? "text-white/70" : "text-slate-400"}`}>+{list.length - 2} more</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* selected day */}
      <div>
        {activeDay ? (
          <>
            <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-[#805827]">
              {new Date(year, month, activeDay).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
              <span className="h-px flex-1 bg-[#805827]/20" />
            </h2>
            {dayEvents.length ? (
              <ul className="space-y-3">
                {dayEvents.map((e) => (
                  <EventRow key={e._id} e={e} />
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-slate-400">Nothing scheduled on this day.</p>
            )}
          </>
        ) : (
          <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-slate-400">Tap a day to see its dates.</p>
        )}
      </div>
    </div>
  );
}

export default function ImportantDates() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [when, setWhen] = useState("upcoming"); // "upcoming" | "past"
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all"); // "all" | "public" | "private"
  const [view, setView] = useState("list"); // "list" | "calendar"
  const [monthDate, setMonthDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_URL}/important-dates`, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load important dates");
        const data = await res.json();
        setEvents(data);
        const t = new Date();
        const hasThisMonth = data.some((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth();
        });
        if (!hasThisMonth && data.length) {
          const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
          const target = sorted.find((e) => daysFromToday(new Date(e.date)) >= 0) || sorted[sorted.length - 1];
          const d = new Date(target.date);
          setMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
        }
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // filters (category + university type) applied first, then split into upcoming / past
  const matching = useMemo(
    () => events.filter((e) => (category === "all" || e.category === category) && (type === "all" || e.type === type)),
    [events, category, type]
  );
  const upcoming = useMemo(
    () => matching.filter((e) => daysFromToday(new Date(e.date)) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [matching]
  );
  const past = useMemo(
    () => matching.filter((e) => daysFromToday(new Date(e.date)) < 0).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [matching]
  );

  const shown = when === "upcoming" ? upcoming : past;

  // group by month, keeping order
  const groups = useMemo(() => {
    const out = [];
    shown.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      let g = out[out.length - 1];
      if (!g || g.key !== key) {
        g = { key, label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }), items: [] };
        out.push(g);
      }
      g.items.push(e);
    });
    return out;
  }, [shown]);

  const filtersOn = category !== "all" || type !== "all";
  const clear = () => {
    setCategory("all");
    setType("all");
  };

  const seg = (active) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition ${active ? "bg-navy text-white shadow" : "text-slate-500 hover:text-slate-800"}`;

  return (
    <div className="min-h-screen bg-stone-200 pb-16">
      <PageHero badge="Calendar" title="Important Dates">
        Form fill-up, deadlines, exam dates and results. Switch between a timeline and a calendar.
      </PageHero>

      <div className="relative z-10 mx-auto -mt-8 max-w-3xl px-4">
        {/* controls */}
        <div className="fade-up mb-6 space-y-3 rounded-xl bg-white p-3 shadow-md sm:p-4" style={{ animationDelay: "250ms" }}>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[["all", "All"], ...Object.entries(CATS).map(([k, v]) => [k, v.label])].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                aria-pressed={category === key}
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  category === key ? "border-navy bg-navy text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {key !== "all" && <span className={`h-2 w-2 rounded-full ${CATS[key].dot}`} />}
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-slate-200 bg-stone-50 p-1">
                <button onClick={() => setView("list")} className={seg(view === "list")}>List</button>
                <button onClick={() => setView("calendar")} className={seg(view === "calendar")}>Calendar</button>
              </div>

              {view === "list" && (
                <div className="flex rounded-lg border border-slate-200 bg-stone-50 p-1">
                  <button onClick={() => setWhen("upcoming")} className={seg(when === "upcoming")}>
                    Upcoming <span className="opacity-60">{upcoming.length}</span>
                  </button>
                  <button onClick={() => setWhen("past")} className={seg(when === "past")}>
                    Past <span className="opacity-60">{past.length}</span>
                  </button>
                </div>
              )}
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="University type"
              className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-[#805827] focus:outline-none focus:ring-2 focus:ring-[#805827]/30"
            >
              <option value="all">All universities</option>
              <option value="public">Public only</option>
              <option value="private">Private only</option>
            </select>
          </div>
        </div>

        {/* content */}
        {loading && (
          <ul className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex animate-pulse items-center gap-4 rounded-xl bg-white p-4">
                <div className="h-14 w-14 rounded-lg bg-stone-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-stone-200" />
                  <div className="h-3 w-1/3 rounded bg-stone-100" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {!loading && !error && view === "calendar" && (
          <CalendarView events={matching} monthDate={monthDate} setMonthDate={setMonthDate} />
        )}

        {!loading && !error && view === "list" && groups.length === 0 && (
          <div className="rounded-xl bg-white px-6 py-12 text-center">
            <p className="font-medium text-slate-700">
              {filtersOn ? "No dates match these filters." : when === "upcoming" ? "No upcoming dates." : "No past dates."}
            </p>
            {filtersOn ? (
              <button onClick={clear} className="mt-3 text-sm font-semibold text-[#805827] hover:underline">
                Clear filters
              </button>
            ) : (
              when === "upcoming" &&
              past.length > 0 && (
                <button onClick={() => setWhen("past")} className="mt-3 text-sm font-semibold text-[#805827] hover:underline">
                  View past dates
                </button>
              )
            )}
          </div>
        )}

        {!loading &&
          !error &&
          view === "list" &&
          groups.map((g) => (
            <Reveal key={g.key + when} className="mb-6">
              <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-[#805827]">
                {g.label}
                <span className="h-px flex-1 bg-[#805827]/20" />
              </h2>
              <ul className="space-y-3">
                {g.items.map((e) => (
                  <EventRow key={e._id} e={e} />
                ))}
              </ul>
            </Reveal>
          ))}
      </div>
    </div>
  );
}
