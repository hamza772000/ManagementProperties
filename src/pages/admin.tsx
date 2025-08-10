// src/pages/Admin.tsx
import { useEffect, useMemo, useState } from "react";

type ApiProperty = {
  id: number;
  title: string;
  address: string;
  area: string;
  price: number;
  priceUnit: "pcm" | "pa";
  status: "rent" | "sale";
  beds: number;
  baths: number;
  featured?: boolean;
  coord: [number, number];
  images: string[];
  img?: string;
  description?: string;
  active?: boolean; // <-- we use this for show/hide
};

type NewProp = {
  title: string; address: string; area: string;
  price: number; priceUnit: "pcm"|"pa"; status: "rent"|"sale";
  beds: number; baths: number; lat: number; lng: number;
  imagesText: string;
  featured?: boolean;
  description?: string;
};

// ---------- util ----------
const clsInput =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

// Upload helper (Vercel Blob presigned route)
async function uploadFiles(files: File[], token: string) {
  const out: string[] = [];
  for (const f of files) {
    const res = await fetch(`/api/upload?filename=${encodeURIComponent(f.name)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": f.type || "application/octet-stream",
      },
      body: f,
    });
    if (!res.ok) throw new Error(await res.text());
    const j = await res.json(); // { url, pathname, size, ... }
    out.push(j.url);
  }
  return out;
}

// ---------- login gate ----------
function useAdminToken() {
  const buildToken = import.meta.env.VITE_ADMIN_TOKEN || "";
  const [token, setToken] = useState<string>(
    localStorage.getItem("admin_token") || buildToken
  );
  const [authed, setAuthed] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const validate = async (candidate: string) => {
    setChecking(true);
    setErr("");
    try {
      // We call POST with an empty body on purpose:
      // - if token OK => 400 "missing required fields" (that's success for us)
      // - if token bad => 401 "unauthorized"
      const r = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${candidate}`,
        },
        body: JSON.stringify({}),
      });
      if (r.status === 401) {
        setErr("Invalid token");
        setAuthed(false);
        return false;
      }
      setAuthed(true);
      localStorage.setItem("admin_token", candidate);
      setToken(candidate);
      return true;
    } catch (e: any) {
      setErr(e.message || "Network error");
      setAuthed(false);
      return false;
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    // silent validate on load
    validate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setAuthed(false);
  };

  return { token, setToken, authed, checking, err, validate, logout };
}

// ---------- Admin Page ----------
export default function AdminPage() {
  const { token, authed, checking, err, validate, logout } = useAdminToken();

  const [rows, setRows] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [form, setForm] = useState<NewProp>({
    title: "", address: "", area: "",
    price: 0, priceUnit: "pcm", status: "rent",
    beds: 0, baths: 0, lat: 0, lng: 0,
    imagesText: "", featured: false, description: ""
  });

  // Edit modal state
  const [editing, setEditing] = useState<ApiProperty | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load properties (all = active + hidden)
  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/properties?all=1");
    const data = await r.json();
    setRows(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Create
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.imagesText.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
    const payload = {
      title: form.title, address: form.address, area: form.area,
      price: Number(form.price), priceUnit: form.priceUnit, status: form.status,
      beds: Number(form.beds), baths: Number(form.baths),
      coord: [Number(form.lat), Number(form.lng)],
      featured: !!form.featured,
      description: form.description || "",
      images
    };

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed: " + (await res.text()));
      return;
    }
    setForm({
      title: "", address: "", area: "",
      price: 0, priceUnit: "pcm", status: "rent",
      beds: 0, baths: 0, lat: 0, lng: 0,
      imagesText: "", featured: false, description: ""
    });
    load();
  };

  // Toggle active
  const setActive = async (id: number, active: boolean) => {
    if (!confirm(`${active ? "Show" : "Hide"} this property?`)) return;
    const res = await fetch("/api/properties", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, active }),
    });
    if (!res.ok) alert("Failed: " + (await res.text()));
    load();
  };

  // Start edit
  const startEdit = (p: ApiProperty) => {
    setEditing(p);
    setEditImages(p.images?.length ? [...p.images] : (p.img ? [p.img] : []));
  };

  // Upload new images to Blob
  const onDropFiles = async (files: FileList | null) => {
    if (!files || !editing) return;
    setSaving(true);
    try {
      const urls = await uploadFiles(Array.from(files), token);
      setEditImages(prev => [...prev, ...urls].slice(0, 6));
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Save edit
  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      id: editing.id,
      title: editing.title,
      address: editing.address,
      area: editing.area,
      price: editing.price,
      priceUnit: editing.priceUnit,
      status: editing.status,
      beds: editing.beds,
      baths: editing.baths,
      coord: editing.coord,
      featured: !!editing.featured,
      description: editing.description || "",
      images: editImages
    };
    const res = await fetch("/api/properties", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { alert("Save failed: " + (await res.text())); return; }
    setEditing(null);
    load();
  };

  // Better list ordering (active first, then area/title)
  const sorted = useMemo(() => {
    return rows.slice().sort((a, b) => {
      const aActive = a.active !== false ? 0 : 1;
      const bActive = b.active !== false ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      const byArea = String(a.area).localeCompare(String(b.area));
      if (byArea !== 0) return byArea;
      return String(a.title).localeCompare(String(b.title));
    });
  }, [rows]);

  // --------------- UI ---------------
  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-2">Admin</h1>
        <p className="text-sm text-zinc-600 mb-6">Enter your admin token to continue.</p>
        <LoginCard onValidate={validate} checking={checking} error={err} />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin — Properties</h1>
          <p className="text-sm text-zinc-500">Add, edit, reorder images, and show/hide properties.</p>
        </div>
        <button
          onClick={logout}
          className="text-sm rounded-lg px-3 py-1.5 ring-1 ring-zinc-300 hover:bg-zinc-50"
        >
          Log out
        </button>
      </div>

      {/* ADD NEW */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3">Add new property</h2>
        <form onSubmit={submit} className="grid gap-3 p-4 bg-white rounded-xl ring-1 ring-zinc-200">
          <div className="grid md:grid-cols-2 gap-3">
            <input className={clsInput} placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))}/>
            <input className={clsInput} placeholder="Address" value={form.address} onChange={e=>setForm(f=>({...f, address: e.target.value}))}/>
            <input className={clsInput} placeholder="Area" value={form.area} onChange={e=>setForm(f=>({...f, area: e.target.value}))}/>
            <input className={clsInput} type="number" placeholder="Price" value={form.price || ""} onChange={e=>setForm(f=>({...f, price: Number(e.target.value)}))}/>
            <select className={clsInput} value={form.priceUnit} onChange={e=>setForm(f=>({...f, priceUnit: e.target.value as any}))}>
              <option value="pcm">pcm</option><option value="pa">pa</option>
            </select>
            <select className={clsInput} value={form.status} onChange={e=>setForm(f=>({...f, status: e.target.value as any}))}>
              <option value="rent">For Rent</option><option value="sale">For Sale</option>
            </select>
            <input className={clsInput} type="number" placeholder="Beds" value={form.beds || ""} onChange={e=>setForm(f=>({...f, beds: Number(e.target.value)}))}/>
            <input className={clsInput} type="number" placeholder="Baths" value={form.baths || ""} onChange={e=>setForm(f=>({...f, baths: Number(e.target.value)}))}/>
            <input className={clsInput} type="number" placeholder="Lat" value={form.lat || ""} onChange={e=>setForm(f=>({...f, lat: Number(e.target.value)}))}/>
            <input className={clsInput} type="number" placeholder="Lng" value={form.lng || ""} onChange={e=>setForm(f=>({...f, lng: Number(e.target.value)}))}/>
            <textarea className={`${clsInput} md:col-span-2`} rows={2} placeholder="Image URLs (one per line or comma separated)" value={form.imagesText} onChange={e=>setForm(f=>({...f, imagesText: e.target.value}))}/>
            <textarea className={`${clsInput} md:col-span-2`} rows={3} placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f, description: e.target.value}))}/>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!form.featured} onChange={e=>setForm(f=>({...f, featured: e.target.checked}))}/>
              Featured
            </label>
          </div>
          <button className="rounded-lg bg-sky-600 text-white px-4 py-2 w-fit">Add property</button>
        </form>
      </section>

      {/* LIST */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">All properties</h2>
          <span className="text-sm text-zinc-500">{rows.length} total</span>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((p) => (
              <div key={p.id} className="rounded-xl bg-white ring-1 ring-zinc-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500">{p.area}</div>
                  <div className="flex items-center gap-2">
                    {p.featured ? <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs">Featured</span> : null}
                    {p.active === false ? (
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-xs">Hidden</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">Active</span>
                    )}
                  </div>
                </div>
                <div className="font-medium mt-1">{p.title}</div>
                <div className="text-sm text-zinc-600">{p.price} {p.priceUnit} — {p.beds} bed / {p.baths} bath</div>
                <div className="mt-3 flex items-center gap-3">
                  <button onClick={() => startEdit(p)} className="rounded px-2 py-1 ring-1 ring-sky-200 text-sky-700 text-sm">Edit</button>
                  {p.active === false ? (
                    <button onClick={() => setActive(p.id, true)} className="rounded px-2 py-1 ring-1 ring-emerald-200 text-emerald-700 text-sm">Show</button>
                  ) : (
                    <button onClick={() => setActive(p.id, false)} className="rounded px-2 py-1 ring-1 ring-red-200 text-red-700 text-sm">Hide</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[min(760px,92vw)] max-h-[88vh] overflow-auto rounded-xl p-4 ring-1 ring-zinc-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Edit property</h3>
              <button onClick={()=>setEditing(null)} className="text-sm underline">Close</button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input className={clsInput} placeholder="Title" value={editing.title} onChange={e=>setEditing(p=>p && ({...p, title: e.target.value}))}/>
              <input className={clsInput} placeholder="Address" value={editing.address} onChange={e=>setEditing(p=>p && ({...p, address: e.target.value}))}/>
              <input className={clsInput} placeholder="Area" value={editing.area} onChange={e=>setEditing(p=>p && ({...p, area: e.target.value}))}/>
              <input className={clsInput} type="number" placeholder="Price" value={editing.price} onChange={e=>setEditing(p=>p && ({...p, price: Number(e.target.value)}))}/>
              <select className={clsInput} value={editing.priceUnit} onChange={e=>setEditing(p=>p && ({...p, priceUnit: e.target.value as any}))}>
                <option value="pcm">pcm</option><option value="pa">pa</option>
              </select>
              <select className={clsInput} value={editing.status} onChange={e=>setEditing(p=>p && ({...p, status: e.target.value as any}))}>
                <option value="rent">For Rent</option><option value="sale">For Sale</option>
              </select>
              <input className={clsInput} type="number" placeholder="Beds" value={editing.beds} onChange={e=>setEditing(p=>p && ({...p, beds: Number(e.target.value)}))}/>
              <input className={clsInput} type="number" placeholder="Baths" value={editing.baths} onChange={e=>setEditing(p=>p && ({...p, baths: Number(e.target.value)}))}/>
              <input className={clsInput} type="number" placeholder="Lat" value={editing.coord?.[0] ?? 0} onChange={e=>setEditing(p=>p && ({...p, coord: [Number(e.target.value), p!.coord?.[1] ?? 0] as [number,number]}))}/>
              <input className={clsInput} type="number" placeholder="Lng" value={editing.coord?.[1] ?? 0} onChange={e=>setEditing(p=>p && ({...p, coord: [p!.coord?.[0] ?? 0, Number(e.target.value)] as [number,number]}))}/>
              <textarea className={`${clsInput} md:col-span-2`} rows={3} placeholder="Description" value={editing.description ?? ""} onChange={e=>setEditing(p=>p && ({...p, description: e.target.value}))}/>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!editing.featured} onChange={e=>setEditing(p=>p && ({...p, featured: e.target.checked}))}/>
                Featured
              </label>
            </div>

            {/* IMAGES */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Images</h4>
                <input type="file" multiple accept="image/*" onChange={(e)=>onDropFiles(e.target.files)} />
              </div>

              {/* Drop zone */}
              <div
                className="rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-600"
                onDragOver={(e)=>e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files || []);
                  if (!files.length) return;
                  await onDropFiles(e.dataTransfer.files);
                }}
              >
                Drag & drop images here (or use the file picker). Max 6 images.
              </div>

              {/* Thumbs (reorder + remove) */}
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {editImages.map((u, i) => (
                  <div
                    key={u+i}
                    draggable
                    onDragStart={(e)=>e.dataTransfer.setData('text/plain', String(i))}
                    onDrop={(e)=>{
                      e.preventDefault();
                      const from = Number(e.dataTransfer.getData('text/plain'));
                      setEditImages(arr=>{
                        const copy = [...arr];
                        const [moved] = copy.splice(from,1);
                        copy.splice(i,0,moved);
                        return copy;
                      });
                    }}
                    onDragOver={(e)=>e.preventDefault()}
                    className="relative rounded overflow-hidden ring-1 ring-zinc-200"
                    title="Drag to reorder"
                  >
                    <img src={u} className="w-full h-24 object-cover" />
                    <button
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded"
                      onClick={()=>setEditImages(arr=>arr.filter((_,idx)=>idx!==i))}
                      type="button"
                    >
                      ✕
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white">Cover</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button disabled={saving} onClick={saveEdit} className="rounded-lg bg-sky-600 text-white px-4 py-2">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={()=>setEditing(null)} className="text-sm underline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ---------- Small login card ----------
function LoginCard({
  onValidate, checking, error
}: { onValidate: (t: string)=>Promise<boolean>; checking: boolean; error?: string; }) {
  const [t, setT] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!t.trim()) return;
    await onValidate(t.trim());
  };

  return (
    <form onSubmit={submit} className="rounded-xl bg-white ring-1 ring-zinc-200 p-4">
      <label className="block text-sm mb-2">Admin token</label>
      <input
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        placeholder="Paste your token…"
        value={t}
        onChange={e=>setT(e.target.value)}
      />
      {error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
      <button
        disabled={checking}
        className="mt-3 rounded-lg bg-sky-600 text-white px-4 py-2"
      >
        {checking ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}