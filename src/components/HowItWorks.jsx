import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "../utils/api";
import { Reveal } from "./Reveal";

const STEPS = [
  { n: "01", title: "Create your account", text: "Sign up in a minute with your email.", to: "/signup" },
  { n: "02", title: "Complete your profile", text: "Add details and upload documents once, reuse everywhere.", to: "/information" },
  { n: "03", title: "Apply to circulars", text: "Pick a circular and apply without re-typing anything.", to: "/circulars" },
  { n: "04", title: "Track & get reminded", text: "Status updates and deadline alerts land in your inbox.", to: "/applications" },
];

export default function HowItWorks() {
  const [loggedIn, setLoggedIn] = useState(() => !!getToken());
  useEffect(() => {
    const sync = () => setLoggedIn(!!getToken());
    window.addEventListener("auth-change", sync);
    return () => window.removeEventListener("auth-change", sync);
  }, []);

  return (
    <section className="bg-stone-100 py-16">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-6">
        <Reveal className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#805827]">Your journey</span>
          <h2 className="font-display mt-2 text-3xl font-semibold text-slate-800 md:text-4xl">From sign-up to admission in four steps</h2>
        </Reveal>

        <div className="relative grid gap-8 md:grid-cols-4">
          {/* connecting line (desktop) draws itself when scrolled into view */}
          <Reveal className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 bg-[#805827]/25 md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 140} className="relative text-center">
              <Link to={s.to} className="group block card-lift rounded-2xl p-4">
                <span className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#805827]/40 bg-white font-display text-lg font-semibold text-[#805827] shadow transition group-hover:border-[#805827] group-hover:bg-[#805827] group-hover:text-white">
                  {s.n}
                </span>
                <h3 className="mb-1 text-lg font-semibold text-slate-800">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-14 overflow-hidden rounded-2xl bg-navy p-8 text-center shadow-xl sm:p-10">
          <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Ready to begin your <span className="shimmer-text italic">session</span>?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-slate-300">Everything you need for your admission, waiting in one account.</p>
          <Link
            to={loggedIn ? "/applications" : "/signup"}
            className="mt-6 inline-flex items-center rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-slate-soft shadow-lg shadow-gold/25 transition hover:-translate-y-0.5"
          >
            {loggedIn ? "Go to my applications" : "Create free account"} →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
