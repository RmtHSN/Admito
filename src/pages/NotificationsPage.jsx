import { useCallback, useEffect, useRef, useState } from "react";
import PageHero from "../components/PageHero";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

const PAGE_SIZE = 20;

// "key" is sent to the backend as ?filter=<key>
const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "circulars", label: "Circulars" },
  { key: "status", label: "Status" },
];

const EMPTY_TEXT = {
  all: "You have no notifications yet.",
  unread: "You're all caught up. No unread notifications.",
  circulars: "No circular notifications yet.",
  status: "No application status updates yet.",
};

// ---------- date helpers ----------

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// how many calendar days ago (0 = today)
const daysAgo = (dateStr) =>
  Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(dateStr))) / 86400000,
  );

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const diff = daysAgo(dateStr);

  if (diff <= 0) {
    const min = Math.floor((Date.now() - date.getTime()) / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  }
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------- category colours (same idea as the Important Dates page) ----------

const ico = (d) => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const CATS = {
  deadline: { label: "Deadline", dot: "bg-red-500", tint: "bg-red-50 text-red-600", bar: "bg-red-500", chip: "bg-red-50 text-red-700", icon: ico("M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z") },
  circular: { label: "Circular", dot: "bg-blue-500", tint: "bg-blue-50 text-blue-600", bar: "bg-blue-500", chip: "bg-blue-50 text-blue-700", icon: ico("M3 8l9-5 9 5-9 5-9-5zm0 0v8l9 5 9-5V8") },
  status: { label: "Status", dot: "bg-purple-500", tint: "bg-purple-50 text-purple-600", bar: "bg-purple-500", chip: "bg-purple-50 text-purple-700", icon: ico("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4") },
  success: { label: "Good news", dot: "bg-emerald-500", tint: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", icon: ico("M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z") },
  alert: { label: "Attention", dot: "bg-orange-500", tint: "bg-orange-50 text-orange-600", bar: "bg-orange-500", chip: "bg-orange-50 text-orange-700", icon: ico("M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z") },
  general: { label: "Update", dot: "bg-[#FFD700]", tint: "bg-yellow-50 text-[#805827]", bar: "bg-[#FFD700]", chip: "bg-yellow-50 text-[#805827]", icon: ico("M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0") },
};

// The backend doesn't send a colour, so work it out from the type field when there is one,
// otherwise from the wording of the notification.
function categoryOf(n) {
  const text = `${n.type || ""} ${n.category || ""} ${n.title || ""} ${n.message || ""} ${n.link || ""}`.toLowerCase();
  if (/reject|declin|incomplete|missing|failed|action required|correction/.test(text)) return CATS.alert;
  if (/admit(ted)?\b|accept|approved|selected|shortlist|congrat|merit|result|success/.test(text)) return CATS.success;
  if (/deadline|last date|closing|closes|due|expire|reminder|ends? (today|tomorrow|soon)/.test(text)) return CATS.deadline;
  if (/circular/.test(text)) return CATS.circular;
  if (/status|application|submitted|review|apply/.test(text)) return CATS.status;
  return CATS.general;
}

// ---------- one notification card ----------

function NotificationItem({ n, onRead }) {
  const unread = !n.read;
  const cat = categoryOf(n);
  const ctaClass =
    "mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#805827] transition hover:text-slate-800";
  const ctaLabel = `${n.linkLabel || "View details"} →`;
  const isExternal = n.link && /^https?:\/\//i.test(n.link);

  return (
    <li
      onClick={() => unread && onRead(n._id)}
      className={`relative flex gap-3 overflow-hidden rounded-xl bg-white p-3 shadow-sm sm:gap-4 sm:p-4 ${
        unread ? "card-lift cursor-pointer" : "opacity-70"
      }`}
    >
      {unread && <span className={`absolute inset-y-0 left-0 w-1 ${cat.bar}`} />}
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 ${cat.tint}`}>
        {cat.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`leading-snug ${unread ? "font-semibold text-slate-800" : "font-medium text-slate-500"}`}>
            {n.title}
          </p>
          {unread && <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${cat.dot}`} aria-label="Unread" />}
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${cat.chip}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
            {cat.label}
          </span>
          <span className="text-slate-400">{timeAgo(n.createdAt)}</span>
        </p>
        {n.link &&
          (isExternal ? (
            <a href={n.link} target="_blank" rel="noopener noreferrer" className={ctaClass} onClick={(e) => e.stopPropagation()}>
              {ctaLabel}
            </a>
          ) : (
            <Link to={n.link} className={ctaClass} onClick={(e) => e.stopPropagation()}>
              {ctaLabel}
            </Link>
          ))}
      </div>
    </li>
  );
}

// ---------- page ----------

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  // ignore answers from old requests (e.g. user clicks tabs quickly)
  const requestId = useRef(0);

  const load = useCallback(async (nextFilter, nextPage) => {
    const id = ++requestId.current;
    const append = nextPage > 1;

    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");

    try {
      const res = await apiFetch(
        `/notifications?filter=${nextFilter}&page=${nextPage}&limit=${PAGE_SIZE}`,
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        throw new Error(
          data?.message ||
            `Could not load notifications (server returned ${res.status})`,
        );
      }
      if (id !== requestId.current) return;

      setItems((prev) => {
        if (!append) return data.notifications;
        const seen = new Set(prev.map((i) => i._id));
        return [...prev, ...data.notifications.filter((i) => !seen.has(i._id))];
      });
      setUnreadCount(data.unreadCount);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {
      if (id === requestId.current) setError(err.message);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  // first load + every time a tab is clicked
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(filter, 1);
  }, [filter, load]);

  // tell the Navbar bell to refresh its badge
  const notifyNavbar = () =>
    window.dispatchEvent(new Event("notifications-change"));

  const markRead = async (id) => {
    // update the screen first, undo if the server says no
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, read: true } : i)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      const res = await apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed");
      notifyNavbar();
    } catch {
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, read: false } : i)),
      );
      setUnreadCount((c) => c + 1);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await apiFetch("/notifications/read-all", {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      setUnreadCount(0);
      notifyNavbar();
    } catch {
      setError("Could not mark notifications as read. Please try again.");
    } finally {
      setMarkingAll(false);
    }
  };

  const today = items.filter((n) => daysAgo(n.createdAt) <= 0);
  const earlier = items.filter((n) => daysAgo(n.createdAt) > 0);

  return (
    <div className="min-h-screen bg-stone-200 pb-16">
      <PageHero
        badge="Inbox"
        title="Notifications"
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            {unreadCount > 0 && (
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-gold">
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0 || markingAll}
              className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-gold hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        }
      >
        Updates on your application, circulars, and important dates.
      </PageHero>

      {/* Filter chips */}
      <div className="relative z-10 mx-auto -mt-8 max-w-3xl px-4">
        <div className="fade-up mb-5 rounded-xl bg-white p-3 shadow-md sm:p-4" style={{ animationDelay: "250ms" }}>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => {
              const active = filter === tab.key;
              const dot = { unread: "bg-[#FFD700]", circulars: CATS.circular.dot, status: CATS.status.dot }[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  aria-pressed={active}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    active ? "border-navy bg-navy text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                  {tab.label}
                  {tab.key === "unread" && unreadCount > 0 && (
                    <span className={`rounded-full px-1.5 text-[11px] font-semibold ${active ? "bg-gold text-slate-800" : "bg-[#805827]/10 text-[#805827]"}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className="mx-auto max-w-3xl px-4 pb-20">
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={() => load(filter, 1)}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Loading notifications...
          </p>
        ) : (
          <>
            {!error && items.length === 0 && (
              <div className="rounded-xl bg-white/70 py-14 text-center text-sm text-slate-500 shadow-sm">
                {EMPTY_TEXT[filter]}
              </div>
            )}

            {today.length > 0 && (
              <section>
                <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-[#805827]" /> Today
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 shadow-sm">{today.length}</span>
                </h2>
                <ul className="space-y-2.5">
                  {today.map((n) => (
                    <NotificationItem key={n._id} n={n} onRead={markRead} />
                  ))}
                </ul>
              </section>
            )}

            {earlier.length > 0 && (
              <section className={today.length > 0 ? "mt-6" : ""}>
                <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-400" /> Earlier
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 shadow-sm">{earlier.length}</span>
                </h2>
                <ul className="space-y-2.5">
                  {earlier.map((n) => (
                    <NotificationItem key={n._id} n={n} onRead={markRead} />
                  ))}
                </ul>
              </section>
            )}

            {hasMore && (
              <div className="pt-6 text-center">
                <button
                  onClick={() => load(filter, page + 1)}
                  disabled={loadingMore}
                  className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "Load earlier notifications"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
