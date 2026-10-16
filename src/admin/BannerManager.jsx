import { useEffect, useRef, useState } from "react";
import { adminApi } from "./adminApi";

const input =
  "w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#805827] focus:border-[#805827] p-2.5";

const empty = { title: "", subtitle: "", ctaLabel: "", ctaLink: "" };

export default function BannerManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminApi.getBanners());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  // preview the chosen file
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const reset = () => {
    setForm(empty);
    setFile(null);
    setPreview("");
    setEditingId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!editingId && !file) return setError("Please choose an image for the new slide.");
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("image", file);
      if (editingId) await adminApi.updateBanner(editingId, fd);
      else await adminApi.createBanner(fd);
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setForm({ title: b.title, subtitle: b.subtitle, ctaLabel: b.ctaLabel, ctaLink: b.ctaLink });
    setFile(null);
    setPreview(b.imageUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggle = async (b) => {
    const fd = new FormData();
    fd.append("active", String(!b.active));
    await adminApi.updateBanner(b._id, fd).catch((e) => setError(e.message));
    load();
  };

  // swap order numbers with the neighbour
  const move = async (index, dir) => {
    const other = items[index + dir];
    if (!other) return;
    const a = items[index];
    const send = (id, order) => {
      const fd = new FormData();
      fd.append("order", String(order));
      return adminApi.updateBanner(id, fd);
    };
    // use positions so equal order numbers can't block a swap
    await Promise.all([send(a._id, index + dir), send(other._id, index)]).catch((e) => setError(e.message));
    load();
  };

  const remove = async (b) => {
    if (!window.confirm("Delete this slide permanently?")) return;
    await adminApi.deleteBanner(b._id).catch((e) => setError(e.message));
    load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">{editingId ? "Edit slide" : "Add a slide"}</h2>
        <p className="mb-4 text-sm text-slate-500">
          Best size: 1920×1080 (16:9), JPG / PNG / WebP, up to 4 MB. Text and button are optional.
        </p>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#805827] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#6b4a20]"
            />
            {preview && <img src={preview} alt="Preview" className="mt-3 aspect-video w-full max-w-sm rounded-lg object-cover" />}
          </div>
          <input className={input} placeholder="Headline (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={input} placeholder="Sub-text (optional)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <input className={input} placeholder="Button label, e.g. Apply now" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
          <input className={input} placeholder="Button link, e.g. /circulars" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
        </div>

        <div className="mt-5 flex gap-2">
          <button disabled={saving} className="rounded-lg bg-[#805827] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6b4a20] disabled:opacity-60">
            {saving ? "Uploading…" : editingId ? "Save changes" : "Add slide"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-stone-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Slides ({items.length})</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">No slides yet. The home page shows built-in default slides until you add one.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((b, i) => (
              <li key={b._id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3">
                <img src={b.imageUrl} alt="" className={`h-16 w-28 rounded-md object-cover ${b.active ? "" : "opacity-40 grayscale"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{b.title || "(no headline)"}</p>
                  <p className="truncate text-xs text-slate-500">{b.active ? "Visible" : "Hidden"} · position {i + 1}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs font-medium">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-30">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-30">↓</button>
                  <button onClick={() => toggle(b)} className="rounded border border-slate-300 px-2.5 py-1">{b.active ? "Hide" : "Show"}</button>
                  <button onClick={() => startEdit(b)} className="rounded border border-slate-300 px-2.5 py-1">Edit</button>
                  <button onClick={() => remove(b)} className="rounded border border-red-200 px-2.5 py-1 text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
