import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getToken } from "../utils/api";

const links = [
  { to: "/circulars", label: "Circular" },
  { to: "/assessment", label: "Assessment" },
  { to: "/information", label: "Information" },
];

const BellIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
      clipRule="evenodd"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.75 2.25a.75.75 0 01.75.75v1.5h9V3a.75.75 0 011.5 0v1.5h.75a3 3 0 013 3V9H2.25V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM2.25 10.5h19.5v8.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V10.5z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const location = useLocation();

  // keep login state in sync after login / logout
  useEffect(() => {
    const sync = () => setLoggedIn(!!getToken());
    window.addEventListener("auth-change", sync);
    return () => window.removeEventListener("auth-change", sync);
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadCount(0);
      return;
    }

    let active = true;
    const loadCount = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${getToken()}` } },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active) setUnreadCount(data.unreadCount || 0);
      } catch {
        /* network error: keep the old number */
      }
    };

    loadCount();
    const timer = setInterval(loadCount, 60000); // refresh every minute
    window.addEventListener("notifications-change", loadCount);

    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("notifications-change", loadCount);
    };
  }, [loggedIn, location.pathname]);

  // route change hole menu auto close
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [location.pathname]);

  // menu open thakle background scroll bondho
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // desktop size e gele menu close
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const linkClass = ({ isActive }) =>
    `transition-colors ${
      isActive ? "text-[#D9C6A3]" : "text-slate-200 hover:text-[#D9C6A3]"
    }`;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-slate-800 backdrop-blur-lg">
      {/*nav bar bg atke rakhte backdrop-blur use kora hoise*/}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-8 h-8">
              <img
                src="/Heading.png"
                alt="Admito"
                className="absolute inset-0 w-full h-full object-contain group-hover:opacity-0"
              />
              <img
                src="/HeadingYellow.png"
                alt=""
                className="absolute inset-0 w-full h-full object-contain opacity-0 group-hover:opacity-100"
              />
            </div>
            <span className="text-lg md:text-xl font-medium text-slate-200 group-hover:text-[#D9C6A3]">
              Admito
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-base lg:text-lg">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}

            <NavLink
              to="/important-dates"
              aria-label="Important dates"
              title="Important dates"
              className={linkClass}
            >
              <CalendarIcon />
            </NavLink>

            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative text-slate-200 hover:text-[#D9C6A3] transition-colors"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-semibold text-white bg-red-500 border border-slate-800 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to={loggedIn ? "/account" : "/login"}
              aria-label={loggedIn ? "Account" : "Login"}
              className="text-slate-200 hover:text-[#D9C6A3] transition-colors"
            >
              <UserIcon />
            </Link>
          </div>

          {/* Mobile: bell + hamburger */}
          <div className="flex md:hidden items-center gap-4">
            <NavLink
              to="/important-dates"
              aria-label="Important dates"
              className={linkClass}
            >
              <CalendarIcon />
            </NavLink>

            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative text-slate-200 hover:text-[#D9C6A3]"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-semibold text-white bg-red-500 border border-slate-800 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="p-2 -mr-2 text-slate-200 hover:text-[#D9C6A3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9C6A3] rounded"
            >
              {open ? (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden bg-slate-800 border-t border-slate-700 transition-[max-height,opacity] duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <div className="flex flex-col px-4 py-3 font-medium text-base">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={(s) =>
                `${linkClass(s)} py-3 border-b border-slate-700`
              }
            >
              {l.label}
            </NavLink>
          ))}

          <Link
            to={loggedIn ? "/account" : "/login"}
            className="flex items-center gap-2 py-3 text-slate-200 hover:text-[#D9C6A3]"
          >
            <UserIcon /> Account
          </Link>
        </div>
      </div>
    </nav>
  );
}