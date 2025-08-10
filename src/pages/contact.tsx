import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || ""; // e.g. property id or title passed as ?ref=...
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ref ? `I'm interested in property: ${ref}` : "",
    honeypot: "", // spam trap
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | "ok" | "err">(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(null);

    // basic validation
    if (!form.name || (!form.email && !form.phone) || !form.message) {
      setDone("err");
      return;
    }
    if (form.honeypot) return; // bot filled hidden field

    setBusy(true);
    try {
        const r = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, message: form.message, ref }),
        });
      
        if (!r.ok) {
          const { error } = await r.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(error || "bad status");
        }
      
        setDone("ok");
        setForm({ name: "", email: "", phone: "", message: ref ? `I'm interested in property: ${ref}` : "", honeypot: "" });
      } catch (e: any) {
        console.error("GOT THIS ERROR",e);
        setDone("err");
      }finally {
      setBusy(false);
    }
  }

  const label = "block text-xs font-medium text-zinc-600";
  const input = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white";

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Contact us</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: contact details */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-zinc-500" />
              <div>
                <div className="text-sm text-zinc-500">Email</div>
                <a href="mailto:info@managementproperties.co.uk" className="text-sky-700 hover:underline">
                  info@managementproperties.co.uk
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-zinc-500" />
              <div>
                <div className="text-sm text-zinc-500">Phone</div>
                <a href="tel:+442076247665" className="text-sky-700 hover:underline">020 7624 7665</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-zinc-500" />
              <div>
                <div className="text-sm text-zinc-500">Address</div>
                <div className="text-zinc-700">
                  15 Malvern Road, London, NW6 5PS
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: form */}
        <section className="lg:col-span-2">
          <form onSubmit={submit} className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 p-5 space-y-4">
            {ref && (
              <div className="rounded-md bg-emerald-50 text-emerald-800 text-sm px-3 py-2">
                Enquiry reference: <span className="font-medium">{ref}</span>
              </div>
            )}
            <div>
              <label className={label}>Name *</label>
              <input
                className={input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Email</label>
                <input
                  type="email"
                  className={input}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className={label}>Phone</label>
                <input
                  className={input}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <label className={label}>Message *</label>
              <textarea
                className={input}
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            {/* Honeypot for bots */}
            <input
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              value={form.honeypot}
              onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
              name="company"
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                Send enquiry
              </button>
              {done === "ok" && <span className="text-sm text-emerald-700">Thanks! We’ll be in touch shortly.</span>}
              {done === "err" && <span className="text-sm text-rose-600">Please check required fields or try again.</span>}
            </div>
          </form>
        </section>
      </div>
      <iframe
      title="Office location map"
      className="mt-8 w-full h-64 rounded-2xl ring-1 ring-zinc-200"
      loading="lazy"
      allowFullScreen
      src="https://www.google.com/maps?q=15%20Malvern%20Road,%20NW6%205PS&output=embed"
      />
    </main>
  );
}
