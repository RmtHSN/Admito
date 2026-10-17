import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

const PERKS = [
  "One profile, reused for every university form",
  "Deadline reminders before it's too late",
  "Track every application from submitted to admitted",
  "Exam patterns and mark distribution at a glance",
];

// Split-screen shell used by Login and Signup:
// brand panel on the left (desktop), form card on the right.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <section className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      {/* brand panel */}
      <aside className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="spin-slow pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-dashed border-gold/30" />
        <div className="float-y pointer-events-none absolute -bottom-10 -left-10 h-64 w-64 rounded-full border border-gold/20" />
        <div className="float-y pointer-events-none absolute right-16 top-1/2 h-40 w-40 rounded-full bg-gold/10 blur-3xl" style={{ animationDelay: "-3s" }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />

        <div className="relative max-w-md">
          <span className="fade-up inline-block rounded-full bg-gold px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-slate-800">
            Admission Portal
          </span>
          <h2 style={{ animationDelay: "120ms" }} className="fade-up font-display mt-5 text-4xl font-semibold leading-tight xl:text-5xl">
            Your admission journey, <span className="shimmer-text italic">simplified.</span>
          </h2>
          <p style={{ animationDelay: "240ms" }} className="fade-up mt-4 text-slate-300">
            Everything you need to find, apply and get admitted, in one place.
          </p>

          <ul className="mt-9 space-y-4">
            {PERKS.map((p, i) => (
              <li key={p} style={{ animationDelay: `${400 + i * 130}ms` }} className="fade-up flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <CheckCircle2 size={16} />
                </span>
                <span className="text-slate-200">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* form side */}
      <div className="flex items-center justify-center bg-stone-200 px-4 py-10 sm:py-14">
        <div className="fade-up w-full max-w-md" style={{ animationDelay: "150ms" }}>
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="h-1.5 bg-gold" />
            <div className="p-6 sm:p-8">
              <div className="mb-7 text-center">
                <img src="/Heading.png" alt="Admito" className="mx-auto mb-3 h-12 w-auto" />
                <h1 className="font-display text-3xl font-semibold text-slate-800">{title}</h1>
                <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
          {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
        </div>
      </div>
    </section>
  );
}

// Input with a left icon; type="password" gets a show/hide toggle automatically
export function Field({ label, icon: Icon, type = "text", ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={isPassword && show ? "text" : type}
          className="w-full rounded-lg border border-slate-300 bg-stone-50 py-3 pl-10 pr-11 text-slate-800 transition placeholder:text-slate-400 focus:border-[#805827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#805827]/30 disabled:opacity-60"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#805827]"
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

// error / success banner
export function Notice({ error, success }) {
  if (!error && !success) return null;
  const ok = !!success;
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`fade-up mb-5 flex items-start gap-2 rounded-lg px-3.5 py-3 text-sm ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
    >
      {ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
      <span>{success || error}</span>
    </div>
  );
}

export const submitBtn =
  "w-full rounded-lg bg-[#805827] py-3 font-medium text-white shadow-md shadow-[#805827]/25 transition hover:-translate-y-0.5 hover:bg-[#6b4620] hover:shadow-lg disabled:translate-y-0 disabled:opacity-60";
