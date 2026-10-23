import { API_URL } from "../utils/config";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Reveal, CountUp } from "../components/Reveal";


const STEP_LABELS = {
  applied: "Application submitted",
  form: "Applications opened",
  deadline: "Application deadline",
  admit_card: "Admit card",
  exam: "Admission exam",
  result: "Result",
};

function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function relativeText(dateStr) {
  const days = daysUntil(dateStr);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

const DOT = 16;

function Timeline({ steps }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;

        const dotStyle = {
          width: DOT,
          height: DOT,
          flexShrink: 0,
          borderRadius: "50%",
          borderWidth: 2,
          borderStyle: "solid",
          ...(s.current
            ? {
                borderColor: "#FFD700",
                background: "#805827",
                boxShadow: "0 0 0 4px rgba(255, 215, 0, 0.3)",
              }
            : s.done
              ? { borderColor: "#805827", background: "#805827" }
              : { borderColor: "#cbd5e1", background: "#ffffff" }),
        };

        const lineColor = steps[i + 1]?.done ? "#805827" : "#e2e8f0";

        return (
          <li key={`${s.key}-${i}`} style={{ display: "flex", gap: 14 }}>
            {/* Left column: dot + connecting line */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: DOT,
                flexShrink: 0,
                paddingTop: 3,
              }}
            >
              <span style={dotStyle} />
              {!isLast && (
                <span
                  style={{
                    width: 2,
                    flex: 1,
                    marginTop: 4,
                    background: lineColor,
                  }}
                />
              )}
            </div>

            {/* Right column: label + date */}
            <div style={{ paddingBottom: isLast ? 0 : 22 }}>
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`text-sm ${
                    s.current
                      ? "font-semibold text-slate-800"
                      : s.done
                        ? "font-medium text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {STEP_LABELS[s.key] || s.title}
                </p>
                {s.current && (
                  <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-semibold text-[#805827]">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {formatDate(s.date)}
                {!s.done && ` · ${relativeText(s.date)}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ApplicationCard({ app, onWithdraw, withdrawing }) {
  const [showTimeline, setShowTimeline] = useState(false);
  const steps = app.timeline || [];
  const doneCount = steps.filter((s) => s.done).length;
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;
  const next = steps.find((s) => !s.done);
  const current = steps.find((s) => s.current);

  return (
    <article className="card-lift overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="h-1.5 bg-gold" />
      <div className="p-5 sm:p-6">
        {/* university + application number */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-slate-800">{app.university}</h2>
            <p className="text-sm text-slate-500">{app.unit}</p>
          </div>
          <div className="rounded-lg bg-[#805827]/10 px-3 py-1.5 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#805827]/70">Application no.</p>
            <p className="font-mono text-sm font-semibold text-[#805827]">{app.applicationNo}</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-700">{app.title}</p>
        <p className="mt-1 text-xs text-slate-400">Applied on {formatDate(app.createdAt)} · Demo application</p>

        {/* progress */}
        <div className="mt-5 rounded-xl bg-stone-50 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-gold" />
              {current ? STEP_LABELS[current.key] || current.title : "Not started"}
            </span>
            <span className="text-slate-400">
              {doneCount} of {steps.length} steps · {percent}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full origin-left rounded-full bg-gold"
              style={{ width: `${percent}%`, animation: "draw 1s cubic-bezier(.2,.7,.2,1) both" }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {next ? (
              <>
                <span className="font-medium text-slate-800">Next:</span> {STEP_LABELS[next.key] || next.title}{" "}
                <span className="font-medium text-[#805827]">{relativeText(next.date)}</span>{" "}
                <span className="text-slate-400">({formatDate(next.date)})</span>
              </>
            ) : (
              "All announced steps are complete. Waiting for the next update."
            )}
          </p>
        </div>

        {/* timeline (collapsed by default to keep the page light) */}
        {steps.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowTimeline((v) => !v)}
              aria-expanded={showTimeline}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#805827] hover:underline"
            >
              {showTimeline ? "Hide timeline" : "View full timeline"}
              <svg className={`h-4 w-4 transition-transform ${showTimeline ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTimeline && (
              <div className="fade-in mt-4 border-t border-slate-100 pt-5">
                <Timeline steps={steps} />
              </div>
            )}
          </div>
        )}

        {/* actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          {app.circular?.link && (
            <a
              href={app.circular.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#805827] hover:underline"
            >
              View official circular
            </a>
          )}
          <button
            type="button"
            onClick={() => onWithdraw(app)}
            disabled={withdrawing}
            className="ml-auto rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {withdrawing ? "Withdrawing..." : "Withdraw"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/applications/my`, {
          headers: authHeaders(),
          signal: controller.signal,
        });
        if (res.status === 401) return handleUnauthorized();
        if (!res.ok) throw new Error("Failed to load your applications");
        setApplications(await res.json());
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWithdraw = async (app) => {
    if (!window.confirm(`Withdraw your application to ${app.university} (${app.unit})?`)) {
      return;
    }
    setWithdrawingId(app._id);
    try {
      const res = await fetch(`${API_URL}/applications/${app._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Could not withdraw the application");
      setApplications((prev) => prev.filter((a) => a._id !== app._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setWithdrawingId(null);
    }
  };

  // quick numbers across all applications
  const totalSteps = applications.reduce((n, a) => n + (a.timeline?.length || 0), 0);
  const doneSteps = applications.reduce((n, a) => n + (a.timeline || []).filter((t) => t.done).length, 0);
  const upcoming = applications
    .flatMap((a) => (a.timeline || []).filter((t) => !t.done && t.date).map((t) => ({ ...t, university: a.university })))
    .sort((x, y) => new Date(x.date) - new Date(y.date))[0];

  return (
    <div className="min-h-screen bg-stone-200 pb-16">
      <PageHero title="My Applications">
        Track every application you have made. Progress updates automatically
        from each university's important dates.
      </PageHero>

      <div className="relative z-10 mx-auto -mt-8 max-w-4xl px-4">
        {!loading && !error && applications.length > 0 && (
          <div className="fade-up mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-md sm:grid-cols-3" style={{ animationDelay: "250ms" }}>
            <div className="px-3 py-2">
              <p className="font-display text-3xl font-semibold leading-none text-slate-800">
                <CountUp to={applications.length} />
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Applications</p>
            </div>
            <div className="px-3 py-2">
              <p className="font-display text-3xl font-semibold leading-none text-slate-800">
                <CountUp to={doneSteps} />
                <span className="text-lg text-slate-400"> / {totalSteps}</span>
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Steps completed</p>
            </div>
            <div className="px-3 py-2">
              <p className="font-display text-xl font-semibold leading-tight text-[#805827]">
                {upcoming ? relativeText(upcoming.date) : "All caught up"}
              </p>
              <p className="mt-1 truncate text-xs font-medium uppercase tracking-wide text-slate-500">
                {upcoming ? `${STEP_LABELS[upcoming.key] || upcoming.title} · ${upcoming.university}` : "No upcoming steps"}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <ul className="space-y-4" aria-busy="true">
            {[0, 1].map((i) => (
              <li key={i} className="animate-pulse rounded-2xl bg-white p-6">
                <div className="h-5 w-1/2 rounded bg-stone-200" />
                <div className="mt-3 h-3 w-1/3 rounded bg-stone-100" />
                <div className="mt-6 h-20 rounded-xl bg-stone-100" />
              </li>
            ))}
          </ul>
        )}

        {!loading && error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-md sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-[#805827]">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M19.5 14.25v-2.63a3.38 3.38 0 00-3.38-3.37h-1.5A1.13 1.13 0 0113.5 7.13v-1.5a3.38 3.38 0 00-3.38-3.38H8.25m2.25 0H5.63c-.62 0-1.13.5-1.13 1.12v17.25c0 .62.5 1.13 1.13 1.13h12.75c.62 0 1.12-.5 1.12-1.13V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="mb-1 font-display text-xl font-semibold text-slate-800">No applications yet</p>
            <p className="mb-5 text-sm text-slate-500">
              Pick a circular and press "Apply (demo)" to get started.
            </p>
            <Link
              to="/circulars"
              className="inline-block rounded-lg bg-[#805827] px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#6b4620]"
            >
              Browse circulars
            </Link>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div className="space-y-5">
            {applications.map((app, i) => (
              <Reveal key={app._id} delay={Math.min(i, 4) * 80}>
                <ApplicationCard
                  app={app}
                  onWithdraw={handleWithdraw}
                  withdrawing={withdrawingId === app._id}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
