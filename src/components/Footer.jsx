import { Link } from "react-router-dom";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { to: "/circulars", label: "Circulars" },
      { to: "/important-dates", label: "Important Dates" },
      { to: "/applications", label: "My Applications" },
      { to: "/notifications", label: "Notifications" },
    ],
  },
  {
    heading: "Your account",
    links: [
      { to: "/information", label: "My Profile & Documents" },
      { to: "/account", label: "Account" },
      { to: "/login", label: "Login" },
      { to: "/signup", label: "Sign up" },
    ],
  },
  {
    heading: "Help",
    links: [
      { to: "/contact", label: "Contact" },
      { to: "/about-us", label: "About us" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-300">
      <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-8 lg:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-10">
          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display flex items-center text-2xl font-semibold text-white hover:text-gold">
              <svg className="mr-2 h-8 w-8 text-gold" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Admito
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              One portal for every step of your admission: circulars, application status and important dates,
              all in one place.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold-400">{col.heading}</h2>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="transition hover:text-gold">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} <span className="text-slate-200">Admito</span>. All rights reserved.
          </p>
          <p className="max-w-md sm:text-right">
            Demo project: applications made here are not sent to any university. University names and logos belong
            to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}