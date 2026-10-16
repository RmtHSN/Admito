const ITEMS = [
  "Circulars", "Admit cards", "Merit lists", "Application tracking", "Deadline reminders",
  "Document vault", "Assessments", "Exam dates", "Public & private universities",
];

// slim gold scrolling band; the list is doubled so the loop is seamless
export default function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="ticker mt-14 overflow-hidden border-y border-[#805827]/20 bg-[#805827] py-2.5" aria-hidden="true">
      <div className="ticker-track flex gap-10 whitespace-nowrap text-sm font-medium text-amber-50">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
