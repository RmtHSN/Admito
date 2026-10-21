import { useState } from "react";
import { useCarbonFootprint } from "react-carbon-footprint";

// The numbers are small, so show milligrams until we reach 1 gram
const formatCO2 = (g) => (g >= 1 ? `${g.toFixed(2)} g` : `${(g * 1000).toFixed(2)} mg`);

const formatBytes = (b) =>
  b < 1024
    ? `${b} B`
    : b < 1024 * 1024
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / 1024 / 1024).toFixed(2)} MB`;

const LeafIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c2-4 5-7 9-9"
    />
  </svg>
);

export default function CarbonFootprintDisplay() {
  const [gCO2, bytesTransferred] = useCarbonFootprint();
  const [open, setOpen] = useState(() => typeof window === "undefined" || window.innerWidth >= 640);

  if (import.meta.env?.VITE_SHOW_CARBON === "false") return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show network carbon footprint"
        className="fixed bottom-3 right-3 z-40 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[0.7rem] sm:bottom-4 sm:right-4 sm:px-3 sm:py-1.5 sm:text-xs font-medium text-[#805827] shadow-md backdrop-blur transition hover:bg-white"
      >
        <LeafIcon />
        {formatCO2(gCO2)} CO₂
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-40 w-56 sm:bottom-4 sm:right-4 sm:w-60 rounded-xl border border-slate-200 bg-white/90 p-3 text-slate-800 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#805827]">
          <LeafIcon />
          Network carbon footprint
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Minimize"
          className="rounded p-1 text-slate-400 hover:text-slate-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 12h12" />
          </svg>
        </button>
      </div>

      <dl className="space-y-1 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Data transferred</dt>
          <dd className="font-medium">{formatBytes(bytesTransferred)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">CO₂ emissions</dt>
          <dd className="font-medium">{formatCO2(gCO2)} CO₂eq</dd>
        </div>
      </dl>

      <p className="mt-2 text-[11px] leading-snug text-slate-400">
        Estimate based on the network data transferred during this session.
      </p>
    </div>
  );
}
