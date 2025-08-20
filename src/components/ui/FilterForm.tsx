import { Search } from "lucide-react";
import { Status } from "../../types/Property";

export default function FilterForm({
  mode, setMode, q, setQ, minBeds, setMinBeds, minBaths, setMinBaths, priceFrom, setPriceFrom, priceTo, setPriceTo,
}: {
  mode: Status; setMode: (s: Status) => void;
  q: string; setQ: (v: string) => void;
  minBeds: number; setMinBeds: (n: number) => void;
  minBaths: number; setMinBaths: (n: number) => void;
  priceFrom: number | ""; setPriceFrom: (v: number | "") => void;
  priceTo: number | ""; setPriceTo: (v: number | "") => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => setMode("rent")} className={`px-3 py-1.5 rounded-full text-sm border ${mode === "rent" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-zinc-700 border-zinc-300"}`}>Rent</button>
        <button onClick={() => setMode("sale")} className={`px-3 py-1.5 rounded-full text-sm border ${mode === "sale" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-zinc-700 border-zinc-300"}`}>Sale</button>
      </div>
      <label className="block text-xs font-medium text-zinc-600">Location</label>
      <div className="relative mt-1 mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search area, street or code" className="w-full rounded-lg border border-zinc-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600">Beds (min)</label>
          <select value={minBeds} onChange={(e) => setMinBeds(Number(e.target.value))} className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm">
            {[0,1,2,3,4].map(n => <option key={n} value={n}>{n===0?"Any":n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600">Baths (min)</label>
          <select value={minBaths} onChange={(e) => setMinBaths(Number(e.target.value))} className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm">
            {[0,1,2,3].map(n => <option key={n} value={n}>{n===0?"Any":n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600">Price From</label>
          <input type="number" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Any" className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600">Price To</label>
          <input type="number" value={priceTo} onChange={(e) => setPriceTo(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Any" className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm" />
        </div>
      </div>
    </>
  );
}
