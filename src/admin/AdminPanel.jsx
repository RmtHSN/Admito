import { useState } from "react";
import AdminLogin from "./AdminLogin";
import ResourceManager from "./ResourceManager";
import AssessmentManager from "./AssessmentManager";
import BannerManager from "./BannerManager";
import { adminApi, getToken } from "./adminApi";

const circularFields = [
  {
    name: "university",
    label: "University",
    type: "text",
    required: true,
    wide: true,
  },
  {
    name: "unit",
    label: "Unit",
    type: "text",
    required: true,
    wide: true,
  },
  {
    name: "title",
    label: "Circular Title",
    type: "text",
    required: true,
    wide: true,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: ["public", "private"],
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["open", "upcoming", "closed"],
    required: true,
  },
  {
    name: "publishedDate",
    label: "Published Date",
    type: "date",
    required: true,
  },
  {
    name: "applyDeadline",
    label: "Apply Deadline",
    type: "date",
    required: true,
  },
  {
    name: "examDate",
    label: "Exam Date (optional)",
    type: "date",
  },
  {
    name: "link",
    label: "Official Link",
    type: "text",
    required: true,
    wide: true,
  },
];

const eventFields = [
  {
    name: "title",
    label: "Event Title",
    type: "text",
    required: true,
    wide: true,
  },
  {
    name: "university",
    label: "University",
    type: "text",
    required: true,
    wide: true,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: ["public", "private"],
    required: true,
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["form", "deadline", "admit_card", "exam", "result"],
    required: true,
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    required: true,
  },
];

export default function AdminPanel() {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("admito_admin");

    return getToken() && stored
      ? JSON.parse(stored)
      : null;
  });

  const [tab, setTab] = useState("circulars");

  const logout = () => {
    localStorage.removeItem("admito_token");
    localStorage.removeItem("admito_admin");
    setAdmin(null);
  };

  if (!admin) {
    return <AdminLogin onLoggedIn={setAdmin} />;
  }

  return (
    <div className="min-h-screen bg-stone-200 pt-20 sm:pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Admito Admin Panel
            </h1>

            <p className="text-sm text-slate-500">
              Signed in as {admin.name} ({admin.email})
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 text-slate-600 text-sm font-medium px-4 py-2 hover:bg-white transition"
          >
            Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 mb-6 w-fit max-w-full overflow-x-auto">
          {[
            { key: "circulars", label: "Circulars" },
            { key: "dates", label: "Important Dates" },
            { key: "assessments", label: "Assessment" },
            { key: "banners", label: "Banners" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-[#805827] text-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "circulars" ? (
          <ResourceManager
            title="Manage Circulars"
            fields={circularFields}
            fetchAll={adminApi.getCirculars}
            onCreate={adminApi.createCircular}
            onUpdate={adminApi.updateCircular}
            onDelete={adminApi.deleteCircular}
          />
        ) : tab === "dates" ? (
          <ResourceManager
            title="Manage Important Dates"
            fields={eventFields}
            fetchAll={adminApi.getImportantDates}
            onCreate={adminApi.createImportantDate}
            onUpdate={adminApi.updateImportantDate}
            onDelete={adminApi.deleteImportantDate}
          />
        ) : tab === "banners" ? (
          <BannerManager />
        ) : (
          <AssessmentManager />
        )}
      </div>
    </div>
  );
}