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

const bellIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
      clipRule="evenodd"
    />
  </svg>
);

// ---------- one notification card ----------

function NotificationItem({ n, onRead }) {
  const unread = !n.read;
  const ctaClass =
    "mt-2 inline-block text-xs font-semibold text-[#805827] hover:text-[#FFD700]";
  const ctaLabel = `${n.linkLabel || "View details"} →`;
  const isExternal = n.link && /^https?:\/\//i.test(n.link);

  return (
    <div
      onClick={() => unread && onRead(n._id)}
      className={`relative flex gap-4 rounded-xl border border-slate-200 p-4 transition hover:shadow-md ${
        unread ? "cursor-pointer bg-white" : "bg-white/60"
      }`}
    >
      {unread && (
        <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#FFD700]" />
      )}
      <div
        className={`ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          unread
            ? "bg-[#805827]/10 text-[#805827]"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {bellIcon}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm ${
              unread
                ? "font-semibold text-slate-800"
                : "font-medium text-slate-500"
            }`}
          >
            {n.title}
          </p>
          <span className="whitespace-nowrap text-xs text-slate-400">
            {timeAgo(n.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">{n.message}</p>
        {n.link &&
          (isExternal ? (
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaClass}
            >
              {ctaLabel}
            </a>
          ) : (
            <Link to={n.link} className={ctaClass}>
              {ctaLabel}
            </Link>
          ))}
      </div>
    </div>
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

      {/* Filter tabs */}
      <div className="relative z-10 mx-auto -mt-8 max-w-3xl px-6">
        <div className="mb-6 flex items-center gap-2 overflow-x-auto overflow-y-hidden rounded-xl bg-white px-3 shadow-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm transition ${
                  active
                    ? "border-b-2 border-[#FFD700] font-semibold text-slate-800"
                    : "border-b-2 border-transparent font-medium text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                {tab.key === "unread" && unreadCount > 0 && (
                  <span className="rounded-full bg-[#805827]/10 px-1.5 text-[11px] font-semibold text-[#805827]">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification list */}
      <div className="mx-auto max-w-3xl space-y-3 px-6 pb-20">
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
              <div className="rounded-xl border border-dashed border-slate-300 py-14 text-center text-sm text-slate-500">
                {EMPTY_TEXT[filter]}
              </div>
            )}

            {today.length > 0 && (
              <>
                <p className="pb-1 pt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Today
                </p>
                {today.map((n) => (
                  <NotificationItem key={n._id} n={n} onRead={markRead} />
                ))}
              </>
            )}

            {earlier.length > 0 && (
              <>
                <p className="pb-1 pt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Earlier
                </p>
                {earlier.map((n) => (
                  <NotificationItem key={n._id} n={n} onRead={markRead} />
                ))}
              </>
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
