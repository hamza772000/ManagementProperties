import { useMemo, useState, useEffect } from "react";
import type { Status } from "../types/Property";
import type { LatLngTuple } from "leaflet";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { MapPin, Home, Bath, BedDouble } from "lucide-react";
import { useProperties } from "../context/DataContext";
import FilterForm from "../components/ui/FilterForm";
import PriceTag from "../components/ui/PriceTag";
import Stat from "../components/ui/Stat";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const cover = (p: any) => {
  const imageUrl = p.images?.[0] ?? p.img;
  if (!imageUrl) {
    // Create a placeholder image with "Pics Coming Soon" text
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="18" fill="#6b7280">
          Pictures Coming Soon
        </text>
      </svg>
    `)}`;
  }
  return imageUrl;
};

// Only allow scroll-zoom when Ctrl/Cmd is pressed by toggling Leaflet's handler.
function CtrlWheelZoom() {
  const map = useMap();
  useEffect(() => {
    // Start disabled; we temporarily enable when Ctrl/Cmd is held during wheel
    map.scrollWheelZoom.disable();
    const container = map.getContainer();
    let disableTimer: number | undefined;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        map.scrollWheelZoom.enable();
        if (disableTimer) window.clearTimeout(disableTimer);
        disableTimer = window.setTimeout(() => {
          map.scrollWheelZoom.disable();
        }, 600);
      } else {
        map.scrollWheelZoom.disable();
      }
    };
    const onLeave = () => {
      map.scrollWheelZoom.disable();
    };
    container.addEventListener("wheel", onWheel, { passive: true });
    container.addEventListener("mouseleave", onLeave);
    return () => {
      if (disableTimer) window.clearTimeout(disableTimer);
      container.removeEventListener("wheel", onWheel as any);
      container.removeEventListener("mouseleave", onLeave as any);
      map.scrollWheelZoom.disable();
    };
  }, [map]);
  return null;
}

export default function HomePage() {
  const DATA = useProperties();
  const [mode, setMode] = useState<Status | "all">("all");
  const [q, setQ] = useState<string>("");
  const [minBeds, setMinBeds] = useState<number>(0);
  const [minBaths, setMinBaths] = useState<number>(0);
  const [priceFrom, setPriceFrom] = useState<number | "">("");
  const [priceTo, setPriceTo] = useState<number | "">("");

  const filtered = useMemo(() => {
    return DATA.filter((p) => {
      if (mode !== "all" && p.status !== mode) return false;
      if (q && !(p.area + " " + p.title + " " + p.address).toLowerCase().includes(q.toLowerCase())) return false;
      if (minBeds && p.beds < minBeds) return false;
      if (minBaths && p.baths < minBaths) return false;
      if (priceFrom !== "" && p.price < Number(priceFrom)) return false;
      if (priceTo !== "" && p.price > Number(priceTo)) return false;
      return true;
    });
  }, [DATA, mode, q, minBeds, minBaths, priceFrom, priceTo]);

  const center: LatLngTuple = [51.5282744, -0.1975558]; // 15 Malvern Road, NW6 5PS

  return (
    <>
      <section className="relative">
        <div className="lg:hidden px-4 pt-4">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 p-4">
            <FilterForm {...{ mode, setMode, q, setQ, minBeds, setMinBeds, minBaths, setMinBaths, priceFrom, setPriceFrom, priceTo, setPriceTo }} />
            <div className="mt-3 text-right">
              <span className="text-xs text-zinc-500">{filtered.length} result(s)</span>
            </div>
          </div>
        </div>
        <div className="relative h-[360px] md:h-[420px] lg:h-[480px] w-full">
          <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-full w-full">
            <CtrlWheelZoom />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.map((p) => (
              <Marker key={p.id} position={p.coord} icon={markerIcon}>
                <Popup>
                  <Link to={`/property/${p.id}`} className="block">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-zinc-600 mb-1">{p.address}</div>
                    <div className="mb-1">
                      <span className={`inline-block text-[10px] font-semibold rounded px-1.5 py-0.5 ${p.availability ? 'bg-sky-50 text-sky-700' : p.status === 'rent' ? 'bg-amber-50 text-amber-700' : p.status === 'sale' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {p.availability ?? (p.status === 'rent' ? 'Rent' : p.status === 'sale' ? 'Sale' : 'Commercial')}
                      </span>
                    </div>
                    <PriceTag
                      value={p.price}
                      unit={p.status === "rent"
                        ? p.priceUnit
                        : p.status === "sale"
                        ? p.salePriceUnit || "Guide Price"
                        : p.priceUnit || p.salePriceUnit || "PCM"}
                    />
                    <div className="mt-2 text-sky-600 underline text-xs">View details</div>
                  </Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {/* Hint: how to zoom */}
          <div className="absolute left-3 bottom-3 z-[1000] pointer-events-none">
            <div className="rounded-md bg-white/90 backdrop-blur-sm shadow ring-1 ring-zinc-200 px-2 py-0.5 text-[11px] text-zinc-700">
              Ctrl+scroll to zoom
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:block absolute right-6 top-6 z-[1000] w-[320px] rounded-2xl bg-white/95 shadow-xl ring-1 ring-zinc-200 p-4">
            <FilterForm {...{ mode, setMode, q, setQ, minBeds, setMinBeds, minBaths, setMinBaths, priceFrom, setPriceFrom, priceTo, setPriceTo }} />
            <div className="mt-3 text-right">
              <span className="text-xs text-zinc-500">{filtered.length} result(s)</span>
            </div>
          </motion.div>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Properties</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {filtered.map((p) => (
              <motion.article key={p.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
                <Link to={`/property/${p.id}`}>
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {p.availability && (
                      <div className={`absolute top-0 left-0 right-0 text-center text-[12px] font-semibold tracking-widest uppercase text-white py-1 ${'bg-emerald-600/85'}`}>
                        {p.availability}
                      </div>
                    )}
                    <img src={cover(p)} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold rounded px-2 py-1 ${p.availability ? 'bg-sky-50 text-sky-700' : p.status === 'rent' ? 'bg-amber-50 text-amber-700' : p.status === 'sale' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {p.availability ?? (p.status === 'rent' ? 'Rent' : p.status === 'sale' ? 'Sale' : 'Commercial')}
                    </span>
                    <PriceTag
                      value={p.price}
                      unit={p.status === "rent"
                        ? p.priceUnit
                        : p.status === "sale"
                        ? p.salePriceUnit || "Guide Price"
                        : p.priceUnit || p.salePriceUnit || "PCM"}
                    />
                  </div>
                  <Link to={`/property/${p.id}`} className="mt-2 block font-semibold text-lg hover:underline">{p.title}</Link>
                  <div className="flex items-center gap-1 text-sm text-zinc-600"><MapPin className="h-4 w-4" /> {p.area}, {p.address}</div>
                  <div className="mt-3 flex items-center gap-4">
                    <Stat icon={<BedDouble className="h-4 w-4" />}>{p.beds}</Stat>
                    <Stat icon={<Bath className="h-4 w-4" />}>{p.baths}</Stat>
                    <Stat icon={<Home className="h-4 w-4" />}>{(p.status === "rent"
                      ? p.priceUnit
                      : p.status === "sale"
                      ? p.salePriceUnit || "Guide Price"
                      : p.priceUnit || p.salePriceUnit || "PCM").toUpperCase()}</Stat>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
        <aside>
          <h2 className="text-xl font-semibold mb-4">Featured Properties</h2>
          <div className="space-y-4">
            {DATA.filter((p) => p.featured).map((p) => (
              <Link key={p.id} to={`/property/${p.id}`} className="flex gap-3 rounded-xl bg-white ring-1 ring-zinc-200 p-2 shadow-sm hover:ring-sky-300">
                <div className="relative h-20 w-28 rounded-lg overflow-hidden">
                  {p.availability && (
                    <div className={`absolute top-0 left-0 right-0 text-center text-[10px] font-semibold tracking-widest uppercase text-white py-0.5 ${'bg-emerald-600/85'}`}>
                      {p.availability}
                    </div>
                  )}
                  <img src={cover(p)} alt={p.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-zinc-500">{p.area}</div>
                  <div className="font-medium leading-tight">{p.title}</div>
                  <div className="text-xs text-zinc-500">{p.address}</div>
                  <div className="mt-1">
                    <PriceTag
                      value={p.price}
                      unit={p.status === "rent"
                        ? p.priceUnit
                        : p.status === "sale"
                        ? p.salePriceUnit || "Guide Price"
                        : p.priceUnit || p.salePriceUnit || "PCM"}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </main>
    </>
  );
}
