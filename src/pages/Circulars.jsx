import { useState, useEffect, useMemo } from "react";
import PageHero from "../components/PageHero";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Flowbite badge color patterns: https://flowbite.com/docs/components/badge/
const STATUS_BADGE = {
  open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  upcoming:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
};

const STATUS_DOT = {
  open: "bg-green-500",
  upcoming: "bg-yellow-500",
  closed: "bg-gray-500",
};

const STATUS_LABEL = {
  open: "Applications Open",
  upcoming: "Upcoming",
  closed: "Closed",
};

const TYPE_BADGE = {
  public: "bg-[#805827]/10 text-[#805827] border border-[#805827]/30",
  private:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
};

function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Circulars() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCirculars() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/circulars`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load circulars");
        const data = await res.json();
        setCirculars(data);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCirculars();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    return circulars
      .filter((c) => {
        const matchesQuery =
          query.trim() === "" ||
          c.university.toLowerCase().includes(query.toLowerCase()) ||
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.unit.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === "all" || c.type === typeFilter;
        const matchesStatus =
          statusFilter === "all" || c.status === statusFilter;
        return matchesQuery && matchesType && matchesStatus;
      })
      .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
  }, [circulars, query, typeFilter, statusFilter]);

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  return (
    <section className="min-h-screen bg-stone-200 pb-16">
      <PageHero badge="Admission Feed" title="Admission Circulars">
        Latest admission notices, exam dates, and application deadlines from
        public and private universities across Bangladesh, all in one feed.
      </PageHero>

      <div className="relative z-10 max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Search input — Flowbite form pattern */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search university, unit, or circular title..."
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#805827] focus:border-[#805827] block w-full ps-10 p-2.5"
              />
            </div>

            {/* Flowbite dropdown-style filter trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-[#805827]/20"
              >
                <svg
                  className="w-4 h-4 me-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4h14M6 8h8m-6 4h4"
                  />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="ms-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-[#805827] rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <svg
                  className="w-3 h-3 ms-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 10 6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              {filterOpen && (
                <div className="absolute right-0 z-10 mt-2 w-64 bg-white divide-y divide-gray-100 rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="mb-4">
                    <h6 className="mb-2 text-sm font-medium text-gray-900">
                      University Type
                    </h6>
                    <ul className="space-y-1 text-sm">
                      {["all", "public", "private"].map((t) => (
                        <li key={t} className="flex items-center">
                          <input
                            id={`type-${t}`}
                            type="radio"
                            checked={typeFilter === t}
                            onChange={() => setTypeFilter(t)}
                            className="w-4 h-4 text-[#805827] bg-gray-100 border-gray-300 focus:ring-[#805827]"
                          />
                          <label
                            htmlFor={`type-${t}`}
                            className="ms-2 text-gray-700 capitalize"
                          >
                            {t === "all" ? "All Universities" : t}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3">
                    <h6 className="mb-2 text-sm font-medium text-gray-900">
                      Status
                    </h6>
                    <ul className="space-y-1 text-sm">
                      {["all", "open", "upcoming", "closed"].map((s) => (
                        <li key={s} className="flex items-center">
                          <input
                            id={`status-${s}`}
                            type="radio"
                            checked={statusFilter === s}
                            onChange={() => setStatusFilter(s)}
                            className="w-4 h-4 text-[#805827] bg-gray-100 border-gray-300 focus:ring-[#805827]"
                          />
                          <label
                            htmlFor={`status-${s}`}
                            className="ms-2 text-gray-700"
                          >
                            {s === "all" ? "All Statuses" : STATUS_LABEL[s]}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {typeFilter !== "all" && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded ${TYPE_BADGE[typeFilter]}`}
                >
                  {typeFilter}
                  <button
                    onClick={() => setTypeFilter("all")}
                    className="hover:opacity-70"
                  >
                    ✕
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded ${STATUS_BADGE[statusFilter]}`}
                >
                  {STATUS_LABEL[statusFilter]}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:opacity-70"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading / error states */}
        {loading && (
          <p className="text-sm text-slate-400 py-10 text-center">
            Loading circulars...
          </p>
        )}
        {!loading && error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Results count */}
            <p className="text-sm text-slate-500 mb-4">
              Showing {filtered.length} of {circulars.length} circulars
            </p>

            {/* Flowbite card grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((c) => (
                <div
                  key={c._id}
                  className="block bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h5 className="text-base font-semibold tracking-tight text-gray-900">
                        {c.university}
                      </h5>
                      <p className="text-xs text-gray-500 mt-0.5">{c.unit}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded ${STATUS_BADGE[c.status]}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status]}`}
                      ></span>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </div>

                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded mb-3 capitalize ${TYPE_BADGE[c.type]}`}
                  >
                    {c.type}
                  </span>

                  <p className="text-sm text-gray-700 mb-4">{c.title}</p>

                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#805827]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Published: {formatDate(c.publishedDate)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#805827]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Exam: {formatDate(c.examDate)}
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <svg
                        className="w-3.5 h-3.5 text-[#805827]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Apply by: {formatDate(c.applyDeadline)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                  {/* Flowbite outline button pattern */}
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-center text-[#805827] hover:text-white border border-[#805827] hover:bg-[#805827] focus:ring-4 focus:outline-none focus:ring-[#805827]/30 rounded-lg px-3 py-1.5 transition-colors duration-150"
                  >
                    View official circular
                    <svg
                      className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 14 10"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </a>

                  {c.status === "closed" ? (
                    <span className="inline-flex items-center text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 cursor-not-allowed">
                      Applications closed
                    </span>
                  ) : (
                    <Link
                      to={`/apply/${c._id}`}
                      className="inline-flex items-center text-sm font-medium text-white bg-[#805827] hover:bg-[#6b4620] focus:ring-4 focus:outline-none focus:ring-[#805827]/30 rounded-lg px-3 py-1.5 transition-colors duration-150"
                    >
                      Apply (demo)
                    </Link>
                  )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-400">
                  No circulars match your search.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}