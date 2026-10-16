import { useState, useRef, useEffect } from "react";

// Works whether VITE_API_URL is "http://host:4000" or "http://host:4000/api"
const API = (import.meta.env.VITE_API_URL || "http://localhost:4000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");
const MAX_FILE_SIZE = 2 * 1024 * 1024; // keep in sync with the backend limit
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Fields marked with * must be filled before the profile can be saved
const REQUIRED = {
  personal: {
    nameEn: "Full Name (English)", nameBn: "Full Name (বাংলা)", dob: "Date of Birth",
    gender: "Gender", birthRegNo: "Birth Registration No.",
  },
  academic: {
    sscBoard: "SSC Board", sscGroup: "SSC Group", sscYear: "SSC Passing Year",
    sscRoll: "SSC Roll No.", sscRegNo: "SSC Registration No.", sscGpa: "SSC GPA",
    hscBoard: "HSC Board", hscGroup: "HSC Group", hscYear: "HSC Passing Year",
    hscRoll: "HSC Roll No.", hscRegNo: "HSC Registration No.", hscGpa: "HSC GPA",
  },
  guardian: {
    fatherName: "Father's Name", motherName: "Mother's Name", applicantPhone: "Mobile Number",
    presentAddress: "Present Address", permanentAddress: "Permanent Address",
    division: "Division", district: "District",
  },
  documents: {
    photo: "Passport Size Photo", signature: "Signature", nidSelf: "Your NID / Birth Reg.",
    nidFather: "Father's NID", nidMother: "Mother's NID",
    sscCertificate: "SSC Certificate / Marksheet", hscCertificate: "HSC Certificate / Marksheet",
  },
};

// Returns { tab, message } for the first tab with problems, or null if everything is valid
function validateProfile({ personal, academic, guardian, documents }) {
  const values = { personal, academic, guardian, documents };
  for (const tab of ["personal", "academic", "guardian", "documents"]) {
    const missing = Object.entries(REQUIRED[tab])
      .filter(([key]) => {
        const v = values[tab][key];
        return tab === "documents" ? !v : !String(v ?? "").trim();
      })
      .map(([, label]) => label);
    if (missing.length) {
      return { tab, message: `Please fill in the required fields: ${missing.join(", ")}.` };
    }
  }
  if (guardian.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardian.guardianEmail)) {
    return { tab: "guardian", message: "Please enter a valid email address." };
  }
  return null;
}

const TABS = [
  { id: "personal", label: "Personal" },
  { id: "academic", label: "Academic Records" },
  { id: "guardian", label: "Guardian & Contact" },
  { id: "documents", label: "Documents" },
];

// Flowbite standard input pattern (label above, no floating overlap)
// https://flowbite.com/docs/forms/input-field/
function Field({ label, required, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#805827] focus:border-[#805827] block w-full p-2.5"
      />
    </div>
  );
}

// Flowbite select pattern
function SelectField({ label, required, value, onChange, options }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#805827] focus:border-[#805827] block w-full p-2.5"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// Flowbite file upload dropzone pattern
// https://flowbite.com/docs/forms/file-input/
function UploadSlot({ label, required, shape, value, onUpload, hint }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large (max 2 MB).");
      e.target.value = "";
      return;
    }
    onUpload(file);
  };

  const sizeClass =
    shape === "square" ? "w-[200px] aspect-square shrink-0" : "w-[200px] h-20 shrink-0";

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label
        className={`${sizeClass} flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative group`}
      >
        {value?.preview ? (
          value.isPdf ? (
            <div className="flex flex-col items-center justify-center gap-1 p-2">
              <svg className="w-8 h-8 text-[#805827]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[11px] text-gray-500 text-center break-all px-1">{value.name}</span>
            </div>
          ) : (
            <img src={value.preview} alt={label} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="flex flex-col items-center justify-center pt-2 pb-3">
            <svg
              className="w-6 h-6 mb-1 text-gray-400"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Click to upload</span>
            </p>
          </div>
        )}
        {value?.preview && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-xs font-medium">Replace</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleFile}
          className="hidden"
        />
      </label>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const BOARDS = ["Dhaka", "Rajshahi", "Chittagong", "Sylhet", "Barisal", "Comilla", "Dinajpur", "Jessore", "Mymensingh", "Madrasah", "Technical"];
const GROUPS = ["Science", "Commerce", "Arts/Humanities"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DIVISIONS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];

export default function Information() {
  const [activeTab, setActiveTab] = useState("personal");
  const [saved, setSaved] = useState(false);

  const [personal, setPersonal] = useState({
    nameEn: "", nameBn: "", dob: "", gender: "", religion: "",
    nationality: "Bangladeshi", bloodGroup: "", nid: "", birthRegNo: "",
  });

  const [academic, setAcademic] = useState({
    sscBoard: "", sscRoll: "", sscRegNo: "", sscYear: "", sscGpa: "", sscGroup: "",
    hscBoard: "", hscRoll: "", hscRegNo: "", hscYear: "", hscGpa: "", hscGroup: "",
  });

  const [guardian, setGuardian] = useState({
    fatherName: "", fatherOccupation: "", fatherPhone: "",
    motherName: "", motherOccupation: "", motherPhone: "",
    guardianEmail: "", applicantPhone: "",
    presentAddress: "", permanentAddress: "", division: "", district: "", postCode: "",
  });

  const [documents, setDocuments] = useState({
    photo: null, signature: null, nidSelf: null, nidFather: null,
    nidMother: null, sscCertificate: null, hscCertificate: null,
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // A picked file: keep the File itself (sent on save) + a temporary preview URL
  const setDoc = (key) => (file) => {
    setDocuments((prev) => {
      if (prev[key]?.preview?.startsWith("blob:")) URL.revokeObjectURL(prev[key].preview);
      return {
        ...prev,
        [key]: {
          file,
          name: file.name,
          isPdf: file.type === "application/pdf",
          preview: URL.createObjectURL(file),
        },
      };
    });
  };

  // Load the saved profile from the backend on mount, so every field shows what was saved (and stays editable)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/profile`, { headers: authHeaders() });
        if (cancelled) return;
        if (res.status === 401) {
          setError("Your session has expired. Please log in again to load your saved details.");
          return;
        }
        if (!res.ok) {
          setError(`Could not load your saved details (${res.status}).`);
          return;
        }
        const data = await res.json(); // null when nothing has been saved yet
        if (!data) return;

        if (data.personal) setPersonal((p) => ({ ...p, ...data.personal }));
        if (data.academic) setAcademic((a) => ({ ...a, ...data.academic }));
        if (data.guardian) setGuardian((g) => ({ ...g, ...data.guardian }));
        setLoading(false); // text fields are ready; images keep loading in the background

        // Files are private, so <img src> can't send the token. Fetch each as a blob instead.
        for (const [key, meta] of Object.entries(data.documents || {})) {
          if (!meta?.publicId) continue;
          const r = await fetch(`${API}/api/profile/documents/${key}`, { headers: authHeaders() });
          if (!r.ok || cancelled) continue;
          const blob = await r.blob();
          if (cancelled) return;
          setDocuments((prev) => ({
            ...prev,
            [key]: {
              file: null, // already on the server, nothing to upload
              name: meta.originalName,
              isPdf: meta.mimeType === "application/pdf",
              preview: URL.createObjectURL(blob),
            },
          }));
        }
      } catch (err) {
        if (!cancelled) setError("Could not reach the server to load your saved details.");
        console.error("Could not load profile", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setError("");
    const problem = validateProfile({ personal, academic, guardian, documents });
    if (problem) {
      setActiveTab(problem.tab); // jump to the tab that needs attention
      setError(problem.message);
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append("personal", JSON.stringify(personal));
      form.append("academic", JSON.stringify(academic));
      form.append("guardian", JSON.stringify(guardian));
      // Only send files the user picked this session
      Object.entries(documents).forEach(([key, doc]) => {
        if (doc?.file) form.append(key, doc.file);
      });

      const res = await fetch(`${API}/api/profile`, {
        method: "PUT",
        headers: authHeaders(), 
        body: form,
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* server sent non-JSON (e.g. an HTML 404 page) */ }
      if (!res.ok) {
        throw new Error(data.message || `Save failed (${res.status}) at ${res.url} - is the backend route registered and running?`);
      }

      // Uploaded files are now on the server
      setDocuments((prev) =>
        Object.fromEntries(Object.entries(prev).map(([k, d]) => [k, d ? { ...d, file: null } : d]))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const docCount = Object.values(documents).filter(Boolean).length;

  return (
    <section className="min-h-screen bg-stone-200 pt-24 sm:pt-28 md:pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full border border-amber-700"></div>
      <div className="pointer-events-none absolute top-10 right-5 h-52 w-52 rounded-full border border-gold/15"></div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-2">
            Applicant Profile
          </h1>
          <p className="text-slate-500 max-w-2xl">
            Save your details, academic records, and documents here — reuse
            them as a quick reference to fill out any university's form
            faster and with fewer errors.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Flowbite Tabs — underline style */}
          {/* https://flowbite.com/docs/components/tabs/ */}
          <div className="border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center overflow-x-auto" role="tablist">
              {TABS.map((tab) => (
                <li key={tab.id} className="me-2" role="presentation">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-[#805827] border-[#805827]"
                        : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300"
                    }`}
                    role="tab"
                  >
                    {tab.label}
                    {tab.id === "documents" && docCount > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-white bg-[#805827] rounded-full">
                        {docCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6">
            {/* Personal tab */}
            {activeTab === "personal" && (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                <Field label="Full Name (English)" required value={personal.nameEn}
                  onChange={(e) => setPersonal({ ...personal, nameEn: e.target.value })} />
                <Field label="Full Name (বাংলা)" required value={personal.nameBn}
                  onChange={(e) => setPersonal({ ...personal, nameBn: e.target.value })} />
                <Field label="Date of Birth" required type="date" value={personal.dob}
                  onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} />
                <SelectField label="Gender" required value={personal.gender}
                  onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                  options={["Male", "Female", "Other"]} />
                <SelectField label="Religion" value={personal.religion}
                  onChange={(e) => setPersonal({ ...personal, religion: e.target.value })}
                  options={["Islam", "Hinduism", "Christianity", "Buddhism", "Other"]} />
                <Field label="Nationality" value={personal.nationality}
                  onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })} />
                <SelectField label="Blood Group" value={personal.bloodGroup}
                  onChange={(e) => setPersonal({ ...personal, bloodGroup: e.target.value })}
                  options={BLOOD_GROUPS} />
                <Field label="NID / Smart Card No." value={personal.nid}
                  onChange={(e) => setPersonal({ ...personal, nid: e.target.value })} />
                <Field label="Birth Registration No." required value={personal.birthRegNo}
                  onChange={(e) => setPersonal({ ...personal, birthRegNo: e.target.value })} />
              </div>
            )}

            {/* Academic tab */}
            {activeTab === "academic" && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#805827]"></span>
                    SSC / Equivalent
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-x-6 gap-y-5">
                    <SelectField label="Board" required value={academic.sscBoard}
                      onChange={(e) => setAcademic({ ...academic, sscBoard: e.target.value })} options={BOARDS} />
                    <SelectField label="Group" required value={academic.sscGroup}
                      onChange={(e) => setAcademic({ ...academic, sscGroup: e.target.value })} options={GROUPS} />
                    <Field label="Passing Year" required value={academic.sscYear}
                      onChange={(e) => setAcademic({ ...academic, sscYear: e.target.value })} />
                    <Field label="Roll No." required value={academic.sscRoll}
                      onChange={(e) => setAcademic({ ...academic, sscRoll: e.target.value })} />
                    <Field label="Registration No." required value={academic.sscRegNo}
                      onChange={(e) => setAcademic({ ...academic, sscRegNo: e.target.value })} />
                    <Field label="GPA" required value={academic.sscGpa}
                      onChange={(e) => setAcademic({ ...academic, sscGpa: e.target.value })} />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#805827]"></span>
                    HSC / Equivalent
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-x-6 gap-y-5">
                    <SelectField label="Board" required value={academic.hscBoard}
                      onChange={(e) => setAcademic({ ...academic, hscBoard: e.target.value })} options={BOARDS} />
                    <SelectField label="Group" required value={academic.hscGroup}
                      onChange={(e) => setAcademic({ ...academic, hscGroup: e.target.value })} options={GROUPS} />
                    <Field label="Passing Year" required value={academic.hscYear}
                      onChange={(e) => setAcademic({ ...academic, hscYear: e.target.value })} />
                    <Field label="Roll No." required value={academic.hscRoll}
                      onChange={(e) => setAcademic({ ...academic, hscRoll: e.target.value })} />
                    <Field label="Registration No." required value={academic.hscRegNo}
                      onChange={(e) => setAcademic({ ...academic, hscRegNo: e.target.value })} />
                    <Field label="GPA" required value={academic.hscGpa}
                      onChange={(e) => setAcademic({ ...academic, hscGpa: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Guardian & contact tab */}
            {activeTab === "guardian" && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#805827]"></span>
                    Guardian Details
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                    <Field label="Father's Name" required value={guardian.fatherName}
                      onChange={(e) => setGuardian({ ...guardian, fatherName: e.target.value })} />
                    <Field label="Father's Occupation" value={guardian.fatherOccupation}
                      onChange={(e) => setGuardian({ ...guardian, fatherOccupation: e.target.value })} />
                    <Field label="Father's Phone" value={guardian.fatherPhone}
                      onChange={(e) => setGuardian({ ...guardian, fatherPhone: e.target.value })} />
                    <Field label="Mother's Name" required value={guardian.motherName}
                      onChange={(e) => setGuardian({ ...guardian, motherName: e.target.value })} />
                    <Field label="Mother's Occupation" value={guardian.motherOccupation}
                      onChange={(e) => setGuardian({ ...guardian, motherOccupation: e.target.value })} />
                    <Field label="Mother's Phone" value={guardian.motherPhone}
                      onChange={(e) => setGuardian({ ...guardian, motherPhone: e.target.value })} />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#805827]"></span>
                    Your Contact
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                    <Field label="Mobile Number" required value={guardian.applicantPhone}
                      onChange={(e) => setGuardian({ ...guardian, applicantPhone: e.target.value })} />
                    <Field label="Email" type="email" value={guardian.guardianEmail}
                      onChange={(e) => setGuardian({ ...guardian, guardianEmail: e.target.value })} />
                    <Field label="Present Address" required value={guardian.presentAddress}
                      onChange={(e) => setGuardian({ ...guardian, presentAddress: e.target.value })} />
                    <Field label="Permanent Address" required value={guardian.permanentAddress}
                      onChange={(e) => setGuardian({ ...guardian, permanentAddress: e.target.value })} />
                    <SelectField label="Division" required value={guardian.division}
                      onChange={(e) => setGuardian({ ...guardian, division: e.target.value })} options={DIVISIONS} />
                    <Field label="District" required value={guardian.district}
                      onChange={(e) => setGuardian({ ...guardian, district: e.target.value })} />
                    <Field label="Post Code" value={guardian.postCode}
                      onChange={(e) => setGuardian({ ...guardian, postCode: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Documents tab */}
            {activeTab === "documents" && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#805827]"></span>
                    Photo & Signature
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <UploadSlot label="Passport Size Photo" required shape="square"
                      value={documents.photo} onUpload={setDoc("photo")}
                      hint="White background, recent, JPG/PNG" />
                    <UploadSlot label="Signature" required shape="rect"
                      value={documents.signature} onUpload={setDoc("signature")}
                      hint="Scanned, on white background" />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#805827]"></span>
                    National ID / Birth Registration
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <UploadSlot label="Your NID / Birth Reg." required shape="rect"
                      value={documents.nidSelf} onUpload={setDoc("nidSelf")} />
                    <UploadSlot label="Father's NID" required shape="rect"
                      value={documents.nidFather} onUpload={setDoc("nidFather")} />
                    <UploadSlot label="Mother's NID" required shape="rect"
                      value={documents.nidMother} onUpload={setDoc("nidMother")} />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#805827]"></span>
                    Academic Certificates
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <UploadSlot label="SSC Certificate / Marksheet" required shape="rect"
                      value={documents.sscCertificate} onUpload={setDoc("sscCertificate")}
                      hint="PDF or scanned image" />
                    <UploadSlot label="HSC Certificate / Marksheet" required shape="rect"
                      value={documents.hscCertificate} onUpload={setDoc("hscCertificate")}
                      hint="PDF or scanned image" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save bar — Flowbite button pattern */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className={`text-xs font-medium ${error ? "text-red-500" : "text-gray-500"}`}>
              {error ||
                (loading && "Loading your saved details...") ||
                "Saved details are stored securely on your account and reused to help you fill out individual university forms faster."}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="shrink-0 inline-flex items-center gap-2 text-white bg-[#805827] hover:bg-[#6b4820] focus:ring-4 focus:outline-none focus:ring-[#805827]/30 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
            >
              {saved ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : (
                saving ? "Saving..." : "Save Profile"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}