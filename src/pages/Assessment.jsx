import { useEffect, useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const GROUP_STYLES = {
  Science: "bg-blue-100 text-blue-800",
  Commerce: "bg-emerald-100 text-emerald-800",
  Arts: "bg-purple-100 text-purple-800",
};

const TYPE_BADGE = {
  public: "bg-gold/20 text-amber-700 border border-gold/40",
  private: "bg-indigo-100 text-indigo-800",
};

function MaxMark({ dist }) {
  const total = dist.reduce(
    (sum, d) => sum + (typeof d.marks === "number" ? d.marks : 0),
    0,
  );
  return total;
}

export default function Assessment() {
  const [universities, setUniversities] = useState([]);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_URL || "http://localhost:4000/api";

        const response = await fetch(`${baseUrl}/assessments`);

        if (!response.ok) {
          throw new Error("Failed to load assessments");
        }

        const data = await response.json();

        setUniversities(data);

        if (data.length > 0) {
          setExpandedId(data[0]._id);
        }
      } catch (error) {
        console.error("Error loading assessments:", error);
      }
    };

    fetchAssessments();
  }, []);

  const filtered = useMemo(() => {
    return universities.filter((u) => {
      const matchesQuery =
        query.trim() === "" ||
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.unit.toLowerCase().includes(query.toLowerCase());

      const matchesGroup =
        groupFilter === "all" || u.groups.includes(groupFilter);

      return matchesQuery && matchesGroup;
    });
  }, [query, groupFilter, universities]);

  return (
    <section className="min-h-screen bg-stone-200">
      <PageHero badge="Exam Guide" title="Assessment & Mark Distribution">
        Compare eligibility, subject-wise mark breakdown, and exam patterns
        across public and private universities in Bangladesh — know exactly
        what to prepare for, before you apply.
      </PageHero>

      <div className="relative z-10 max-w-5xl mx-auto px-4 -mt-8 pb-16">
        {/* Search + group filter */}
        <div className="fade-up bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center" style={{ animationDelay: "300ms" }}>
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search university or unit..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["all", "Science", "Commerce", "Arts"].map((g) => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  groupFilter === g
                    ? "bg-gold text-slate-800 border-gold"
                    : "bg-white text-slate-600 border-slate-300 hover:border-gold/50"
                }`}
              >
                {g === "all" ? "All Groups" : g}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Showing {filtered.length} of {universities.length} universities
        </p>

        {/* Accordion list */}
        <div className="space-y-4">
          {filtered.map((u, idx) => {
            const isOpen = expandedId === u._id;

            return (
              <Reveal
                key={u._id}
                delay={Math.min(idx, 5) * 80}
                className="card-lift bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Header — always visible */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : u._id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-stone-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base md:text-lg font-semibold text-slate-800">
                        {u.name}
                      </h3>

                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${TYPE_BADGE[u.type]}`}
                      >
                        {u.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-2">
                      {u.unit}
                    </p>

                    <div className="flex gap-1.5 flex-wrap">
                      {u.groups.map((g) => (
                        <span
                          key={g}
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${GROUP_STYLES[g]}`}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <svg
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="fade-in px-5 pb-5 pt-1 border-t border-slate-100">
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      {/* Eligibility */}
                      <div>
                        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-2">
                          <svg
                            className="w-4 h-4 text-amber-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.6"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Eligibility
                        </h4>

                        <p className="text-sm text-slate-600 mb-2">
                          {u.eligibility.minGPA}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {u.eligibility.requiredSubjects.map((s) => (
                            <span
                              key={s}
                              className="text-xs bg-stone-100 text-slate-600 px-2 py-1 rounded border border-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Exam pattern */}
                      <div>
                        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-2">
                          <svg
                            className="w-4 h-4 text-amber-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.6"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                          Exam Pattern
                        </h4>

                        <dl className="text-sm text-slate-600 space-y-1.5">
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-400">Mode</dt>
                            <dd className="text-right font-medium text-slate-700">
                              {u.examPattern.mode}
                            </dd>
                          </div>

                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-400">Duration</dt>
                            <dd className="text-right font-medium text-slate-700">
                              {u.examPattern.duration}
                            </dd>
                          </div>

                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-400">Total Marks</dt>
                            <dd className="text-right font-medium text-slate-700">
                              {u.examPattern.totalMarks}
                            </dd>
                          </div>

                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-400">Questions</dt>
                            <dd className="text-right font-medium text-slate-700">
                              {u.examPattern.questionCount}
                            </dd>
                          </div>

                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-400">
                              Negative Marking
                            </dt>
                            <dd className="text-right font-medium text-slate-700">
                              {u.examPattern.negativeMarking}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-3">
                        <svg
                          className="w-4 h-4 text-amber-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.6"
                            d="M9 19V6l7-3v13M9 19l-6-2V9l6-3m0 13l7 3V9m0 10l6-3V4l-6-2"
                          />
                        </svg>
                        Mark Distribution
                      </h4>

                      <div className="space-y-2.5">
                        {u.markDistribution.map((d) => {
                          const max = MaxMark({
                            dist: u.markDistribution,
                          });

                          const pct =
                            max > 0 ? (d.marks / max) * 100 : 0;

                          return (
                            <div key={d.subject}>
                              <div className="flex justify-between text-xs text-slate-600 mb-1">
                                <span>{d.subject}</span>

                                <span className="font-medium">
                                  {d.marks} marks
                                </span>
                              </div>

                              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gold rounded-full origin-left"
                                  style={{ width: `${pct}%`, animation: "draw 0.9s cubic-bezier(.2,.7,.2,1) both" }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </Reveal>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400 bg-white rounded-xl">
              No universities match your search.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
