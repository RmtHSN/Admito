// Shared dark page header (same look as the Assessment page).
// Put page content in a wrapper with "relative z-10 -mt-8" so it overlaps the header's bottom edge.
export default function PageHero({ badge, title, children, action }) {
  return (
    <div className="relative overflow-hidden bg-navy px-4 pb-20 pt-10 sm:pt-12 md:pt-14">
      <div className="spin-slow pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-dashed border-gold/30" />
      <div className="float-y pointer-events-none absolute right-5 top-10 h-52 w-52 rounded-full border border-gold/15" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-gold/5 blur-2xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        {badge && (
          <span className="fade-up mb-4 inline-block rounded-full bg-gold px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-slate-800">
            {badge}
          </span>
        )}
        <h1 style={{ animationDelay: "120ms" }} className="fade-up font-display mb-3 text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {children && (
          <p style={{ animationDelay: "240ms" }} className="fade-up mx-auto max-w-2xl text-slate-300 lg:text-lg">
            {children}
          </p>
        )}
        {action && (
          <div style={{ animationDelay: "360ms" }} className="fade-up mt-5 flex justify-center">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
