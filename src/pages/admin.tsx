import { useEffect, useState } from "react";

type NewProp = {
  title: string; address: string; area: string;
  price: number; priceUnit: "pcm"|"pa"; status: "rent"|"sale";
  beds: number; baths: number; lat: number; lng: number;
  imagesText: string; // one URL per line or comma separated
  featured?: boolean;
  description?: string;
};

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

export default function AdminPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<NewProp>({
    title: "", address: "", area: "",
    price: 0, priceUnit: "pcm", status: "rent",
    beds: 0, baths: 0, lat: 0, lng: 0,
    imagesText: "", featured: false, description: ""
  });

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/properties");
    setRows(await r.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed: " + (await res.text()));
      return;
    }
    setForm({ ...form, title: "", address: "", area: "", price: 0, beds: 0, baths: 0, imagesText: "", description: "" });
    load();
  };

  const hide = async (id: number) => {
    if (!confirm("Hide this property?")) return;
    const res = await fetch("/api/properties", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) alert("Failed: " + (await res.text()));
    load();
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Admin — Properties</h1>

      <form onSubmit={submit} className="grid gap-3 p-4 bg-white rounded-xl ring-1 ring-zinc-200">
        <div className="grid md:grid-cols-2 gap-3">
          <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))}/>
          <input className="input" placeholder="Address" value={form.address} onChange={e=>setForm(f=>({...f, address: e.target.value}))}/>
          <input className="input" placeholder="Area" value={form.area} onChange={e=>setForm(f=>({...f, area: e.target.value}))}/>
          <input className="input" type="number" placeholder="Price" value={form.price} onChange={e=>setForm(f=>({...f, price: Number(e.target.value)}))}/>
          <select className="input" value={form.priceUnit} onChange={e=>setForm(f=>({...f, priceUnit: e.target.value as any}))}>
            <option value="pcm">pcm</option><option value="pa">pa</option>
          </select>
          <select className="input" value={form.status} onChange={e=>setForm(f=>({...f, status: e.target.value as any}))}>
            <option value="rent">For Rent</option><option value="sale">For Sale</option>
          </select>
          <input className="input" type="number" placeholder="Beds" value={form.beds} onChange={e=>setForm(f=>({...f, beds: Number(e.target.value)}))}/>
          <input className="input" type="number" placeholder="Baths" value={form.baths} onChange={e=>setForm(f=>({...f, baths: Number(e.target.value)}))}/>
          <input className="input" type="number" placeholder="Lat" value={form.lat} onChange={e=>setForm(f=>({...f, lat: Number(e.target.value)}))}/>
          <input className="input" type="number" placeholder="Lng" value={form.lng} onChange={e=>setForm(f=>({...f, lng: Number(e.target.value)}))}/>
          <textarea className="input md:col-span-2" rows={3} placeholder="Image URLs (one per line or comma separated)" value={form.imagesText} onChange={e=>setForm(f=>({...f, imagesText: e.target.value}))}/>
          <textarea className="input md:col-span-2" rows={3} placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f, description: e.target.value}))}/>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!form.featured} onChange={e=>setForm(f=>({...f, featured: e.target.checked}))}/>
            Featured
          </label>
        </div>
        <button className="rounded-lg bg-sky-600 text-white px-4 py-2 w-fit">Add property</button>
      </form>

      <div className="mt-8">
        <h2 className="font-medium mb-3">Current (active) properties</h2>
        {loading ? <div>Loading…</div> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((p: any) => (
              <div key={p.id} className="rounded-lg bg-white ring-1 ring-zinc-200 p-3">
                <div className="text-sm text-zinc-500">{p.area}</div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm">{p.price} {p.priceUnit}</div>
                <button onClick={() => hide(p.id)} className="mt-2 text-red-600 underline text-sm">Hide</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
