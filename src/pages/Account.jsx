import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, logout } from "../utils/api";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const ICONS = {
  user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a7.5 7.5 0 0115 0",
  phone: "M2.25 6.75c0 8.28 6.72 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.37a1.13 1.13 0 00-.85-1.09l-4.42-1.1a1.13 1.13 0 00-1.17.42l-.97 1.29a12.04 12.04 0 01-5.66-5.66l1.29-.97a1.13 1.13 0 00.42-1.17l-1.1-4.42a1.13 1.13 0 00-1.09-.85H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  mail: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.24a2.25 2.25 0 01-1.07 1.92l-7.5 4.62a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.92V6.75",
  doc: "M19.5 14.25v-2.63a3.38 3.38 0 00-3.38-3.37h-1.5A1.13 1.13 0 0113.5 7.13v-1.5a3.38 3.38 0 00-3.38-3.38H8.25m2.25 0H5.63c-.62 0-1.13.5-1.13 1.12v17.25c0 .62.5 1.13 1.13 1.13h12.75c.62 0 1.12-.5 1.12-1.13V11.25a9 9 0 00-9-9z",
  id: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.13a1.88 1.88 0 11-3.75 0 1.88 1.88 0 013.75 0zm1.29 5.88a3.38 3.38 0 00-6.58 0",
  bell: "M14.86 17.08a23.85 23.85 0 005.45-1.31A8.97 8.97 0 0118 9.75v-.7C18 5.58 15.31 2.7 12 2.7S6 5.58 6 9.05v.7a8.97 8.97 0 01-2.31 6.02c1.75.6 3.58 1.04 5.45 1.31m5.71 0a24.3 24.3 0 01-5.71 0m5.71 0a3 3 0 11-5.71 0",
  cal: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
};

const Icon = ({ d, className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const LINKS = [
  { to: "/applications", label: "My Applications", text: "Track every form you've submitted", icon: "doc" },
  { to: "/information", label: "Applicant Profile", text: "Details, records and documents", icon: "id" },
  { to: "/notifications", label: "Notifications", text: "Updates and reminders", icon: "bell" },
  { to: "/important-dates", label: "Important Dates", text: "Deadlines and exam schedule", icon: "cal" },
];

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/users/me")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load account");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const heroProps = { badge: "My Account", title: "Account" };

  if (loading) {
    return (
      <section className="min-h-screen bg-stone-200 pb-16">
        <PageHero {...heroProps}>Loading your details…</PageHero>
        <div className="relative z-10 mx-auto -mt-8 max-w-3xl px-4">
          <div className="animate-pulse rounded-2xl bg-white p-8 shadow-md">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-stone-200" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/2 rounded bg-stone-200" />
                <div className="h-4 w-1/3 rounded bg-stone-100" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="min-h-screen bg-stone-200 pb-16">
        <PageHero {...heroProps}>Sign in to see your account.</PageHero>
        <div className="relative z-10 mx-auto -mt-8 max-w-md px-4">
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="mb-6 text-slate-600">{error || "No user is signed in."}</p>
            <Link to="/login" className="inline-block w-full rounded-lg bg-[#805827] py-3 font-medium text-white transition-colors hover:bg-[#6b4620]">
              Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const details = [
    { label: "Full name", value: user.name, icon: "user" },
    { label: "Phone", value: user.phone, icon: "phone" },
    { label: "Email", value: user.email, icon: "mail" },
  ];

  return (
    <section className="min-h-screen bg-stone-200 pb-16">
      <PageHero {...heroProps}>Manage your profile and jump back into your admission journey.</PageHero>

      <div className="relative z-10 mx-auto -mt-8 max-w-3xl space-y-6 px-4">
        {/* identity card */}
        <Reveal className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="h-1.5 bg-gold" />
          <div className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold font-display text-3xl font-semibold text-slate-800 ring-4 ring-gold/25">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-2xl font-semibold text-slate-800">{user.name}</h2>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Signed in
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </Reveal>

        {/* contact details */}
        <Reveal delay={100} className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#805827]">Contact details</h3>
          <dl className="divide-y divide-stone-100">
            {details.map((d) => (
              <div key={d.label} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#805827]/10 text-[#805827]">
                  <Icon d={ICONS[d.icon]} />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{d.label}</dt>
                  <dd className="truncate text-base text-slate-800">{d.value || "—"}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* quick links */}
        <div className="grid gap-4 sm:grid-cols-2">
          {LINKS.map((l, i) => (
            <Reveal key={l.to} delay={200 + i * 80}>
              <Link to={l.to} className="card-lift group flex h-full items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold transition group-hover:bg-gold group-hover:text-navy">
                  <Icon d={ICONS[l.icon]} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-800">{l.label}</span>
                  <span className="block text-sm text-slate-500">{l.text}</span>
                </span>
                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#805827]">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
