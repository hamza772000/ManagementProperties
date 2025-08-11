import React, { useMemo, useState, useEffect, useContext, createContext } from "react";
import { HashRouter as Router, Routes, Route, Link, NavLink, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { Search, MapPin, Home, Bath, BedDouble, PoundSterling } from "lucide-react";
import headerImg from "./assets/header.jpg";
import footerImg from "./assets/footer.jpg";
import ServicesFeesPage from "./pages/services";
import AdminPage from "./pages/admin";
import ContactPage from "./pages/contact";
import ImageGallery from "./components/ImageGallery";
import cmpLogo from "./assets/logos/cmp.png";
import dpsLogo from "./assets/logos/dps.png";
import prsLogo from "./assets/logos/prs.jpg";

// Fix Leaflet's missing default marker assets in Vite by using CDN icons
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MEMBERSHIP_LOGOS = [
  { href: "https://www.ukala.org.uk/client-money-protection/", alt: "CMP Certified – Client Money Protection", src: cmpLogo },
  { href: "https://www.depositprotection.com/", alt: "DPS – Deposit Protection Service", src: dpsLogo },
  { href: "https://www.theprs.co.uk/", alt: "PRS – Property Redress Scheme", src: prsLogo },
];

// --- Types ---
type Status = "rent" | "sale";

type Property = {
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

  // optional extras
  wifi?: boolean;
  billsIncluded?: boolean;
  description?: string;

  // images
  img?: string;          // legacy single image (fallback)
  images?: string[];     // multiple images (preferred)
};

// --- Mock dataset (RAW) ---
const PROPS_RAW: Property[] = [
];

// Ensure every property has an images[] array (fallback to img if provided)
const PROPS: Property[] = PROPS_RAW.map((p) => ({
  ...p,
  images: p.images?.length ? p.images : (p.img ? [p.img] : []),
}));

// --- Data context (live data with fallback to PROPS) ---
const DataContext = createContext<Property[]>(PROPS);

function useProperties() {
  return useContext(DataContext);
}

// --- Helpers ---
function currency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}
function PriceTag({ value, unit }: { value: number; unit: "pcm" | "pa" }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 text-xs font-medium">
      <PoundSterling className="h-3 w-3" />
      {currency(value)} {unit}
    </div>
  );
}
function Stat({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-1 text-zinc-600 text-sm">{icon}{children}</div>;
}
const cover = (p: Property) => p.images?.[0] ?? p.img ?? "";

// --- Header / Footer ---
function Header() {
  const brandGreen = "#8CBF45";

  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: brandGreen }}>
      <div className="w-full" style={{ backgroundColor: "white" }}>
        <img
          src={headerImg}
          alt="Management Properties — Sales, Lettings & Management"
          className="mx-auto object-contain"
          style={{ height: "90px" }}
        />
      </div>

      <nav
        className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6 text-sm text-white"
        style={{ backgroundColor: brandGreen }}
      >
        <NavLink to="/" end className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>Home</NavLink>
        <NavLink to="/for-sale" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>For Sale</NavLink>
        <NavLink to="/for-rent" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>For Rent</NavLink>
        {/* <NavLink to="/landlords" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>Landlords</NavLink> */}
        <NavLink to="/contact" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>Contact</NavLink>
        <NavLink to="/services" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>Services & Fees</NavLink>
        {/* <NavLink to="/admin" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>Admin</NavLink> */}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer
      className="border-t mt-auto"
      style={{ backgroundColor: "white", borderColor: "white", position: "sticky", top: "100vh" }}
    >
      <img
        src={footerImg}
        alt="Management Properties — Contact details"
        className="w-full"
        style={{ height: "120px", objectFit: "contain", objectPosition: "center" }}
      />
    </footer>
  );
}

function MembershipStrip() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text mb-4">Management Properties is a Member of:</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {MEMBERSHIP_LOGOS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              aria-label={l.alt}
              className="shrink-0"
            >
              <img
                src={l.src}
                alt={l.alt}
                className="h-14 md:h-35 object-contain transition" 
                // or: md:h-[30px]
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Filter Form ---
function FilterForm({
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
        <button onClick={() => setMode("rent")} className={`px-3 py-1.5 rounded-full text-sm border ${mode === "rent" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-zinc-700 border-zinc-300"}`}>For Rent</button>
        <button onClick={() => setMode("sale")} className={`px-3 py-1.5 rounded-full text-sm border ${mode === "sale" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-zinc-700 border-zinc-300"}`}>For Sale</button>
      </div>

      <label className="block text-xs font-medium text-zinc-600">Location</label>
      <div className="relative mt-1 mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search area, street or code"
          className="w-full rounded-lg border border-zinc-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
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

// --- Home Page ---
function HomePage() {
  const DATA = useProperties();

  const [mode, setMode] = useState<Status>("rent");
  const [q, setQ] = useState("");
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [priceFrom, setPriceFrom] = useState<number | "">("");
  const [priceTo, setPriceTo] = useState<number | "">("");

  const filtered = useMemo(() => {
    return DATA.filter((p) => {
      if (p.status !== mode) return false;
      if (q && !(p.area + " " + p.title + " " + p.address).toLowerCase().includes(q.toLowerCase())) return false;
      if (minBeds && p.beds < minBeds) return false;
      if (minBaths && p.baths < minBaths) return false;
      if (priceFrom !== "" && p.price < Number(priceFrom)) return false;
      if (priceTo !== "" && p.price > Number(priceTo)) return false;
      return true;
    });
  }, [DATA, mode, q, minBeds, minBaths, priceFrom, priceTo]);

  const center: [number, number] = [51.544, -0.23];

  return (
    <>
      {/* Map & Filters */}
      <section className="relative">
        {/* Mobile: show filters above the map */}
        <div className="lg:hidden px-4 pt-4">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 p-4">
            <FilterForm {...{ mode, setMode, q, setQ, minBeds, setMinBeds, minBaths, setMinBaths, priceFrom, setPriceFrom, priceTo, setPriceTo }} />
            <div className="mt-3 text-right">
              <span className="text-xs text-zinc-500">{filtered.length} result(s)</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[360px] md:h-[420px] lg:h-[480px] w-full">
          <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.map((p) => (
              <Marker key={p.id} position={p.coord} icon={markerIcon}>
                <Popup>
                  <Link to={`/property/${p.id}`} className="block">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-zinc-600 mb-1">{p.address}</div>
                    <PriceTag value={p.price} unit={p.priceUnit} />
                    <div className="mt-2 text-sky-600 underline text-xs">View details</div>
                  </Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Desktop: floating filter over the map */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:block absolute left-20 top-6 z-[1000] w-[320px] rounded-2xl bg-white/95 shadow-xl ring-1 ring-zinc-200 p-4"
          >
            <FilterForm {...{ mode, setMode, q, setQ, minBeds, setMinBeds, minBaths, setMinBaths, priceFrom, setPriceFrom, priceTo, setPriceTo }} />
            <div className="mt-3 text-right">
              <span className="text-xs text-zinc-500">{filtered.length} result(s)</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent */}
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Properties</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {filtered.map((p) => (
              <motion.article key={p.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
                <Link to={`/property/${p.id}`}>
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <img src={cover(p)} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold rounded px-2 py-1 ${p.status === "rent" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                      {p.status === "rent" ? "For Rent" : "For Sale"}
                    </span>
                    <PriceTag value={p.price} unit={p.priceUnit} />
                  </div>
                  <Link to={`/property/${p.id}`} className="mt-2 block font-semibold text-lg hover:underline">{p.title}</Link>
                  <div className="flex items-center gap-1 text-sm text-zinc-600"><MapPin className="h-4 w-4" /> {p.area}, {p.address}</div>
                  <div className="mt-3 flex items-center gap-4">
                    <Stat icon={<BedDouble className="h-4 w-4" />}>{p.beds}</Stat>
                    <Stat icon={<Bath className="h-4 w-4" />}>{p.baths}</Stat>
                    <Stat icon={<Home className="h-4 w-4" />}>{p.priceUnit.toUpperCase()}</Stat>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Featured */}
        <aside>
          <h2 className="text-xl font-semibold mb-4">Featured Properties</h2>
          <div className="space-y-4">
            {DATA.filter((p) => p.featured).map((p) => (
              <Link key={p.id} to={`/property/${p.id}`} className="flex gap-3 rounded-xl bg-white ring-1 ring-zinc-200 p-2 shadow-sm hover:ring-sky-300">
                <img src={cover(p)} alt={p.title} className="h-20 w-28 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="text-xs text-zinc-500">{p.area}</div>
                  <div className="font-medium leading-tight">{p.title}</div>
                  <div className="text-xs text-zinc-500">{p.address}</div>
                  <div className="mt-1"><PriceTag value={p.price} unit={p.priceUnit} /></div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </main>
            {/* Membership logos only on homepage */}
            <MembershipStrip />
    </>
  );
}

// --- Listing pages by status ---
function ListingByStatus({ status }: { status: Status }) {
  const DATA = useProperties();
  const items = useMemo(() => DATA.filter(p => p.status === status), [DATA, status]);
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">{status === "rent" ? "Properties for Rent" : "Properties for Sale"}</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {items.map(p => (
            <article key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
              <Link to={`/property/${p.id}`}>
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <img src={cover(p)} alt={p.title} className="h-full w-full object-cover" />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/property/${p.id}`} className="font-semibold text-lg hover:underline">{p.title}</Link>
                <div className="text-sm text-zinc-600">{p.area}, {p.address}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <aside><h2 className="text-xl font-semibold mb-4">Featured Properties</h2></aside>
    </main>
  );
}

function ForSalePage(){ return <ListingByStatus status="sale"/> }
function ForRentPage(){ return <ListingByStatus status="rent"/> }

// --- Property detail page (with gallery + description) ---
function PropertyDetailPage(){
  const DATA = useProperties();
  const { id } = useParams();
  const property = DATA.find(p => p.id === Number(id));

  if (!property) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-zinc-700">Property not found.</p>
        <Link to="/" className="text-sky-600">Back to home</Link>
      </main>
    );
  }

  const imgs = property.images?.length ? property.images : [cover(property)];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {/* 🔽 Replace your hero + thumbs with this */}
          <ImageGallery images={imgs} />

          <div className="mt-4 text-sm text-zinc-600">
            {property.area} • {property.address}
          </div>

          {property.description && (
            <div className="mt-4 text-zinc-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </div>
          )}
        </div>

        <aside className="lg:col-span-2">
          <h1 className="text-2xl font-semibold">{property.title}</h1>
          <div className="mt-3 text-lg font-medium">
            {currency(property.price)} {property.priceUnit}
          </div>
          <ul className="mt-4 space-y-1 text-zinc-700">
            <li>Bedrooms: {property.beds}</li>
            <li>Bathrooms: {property.baths}</li>
            <li>Status: {property.status === "rent" ? "For Rent" : "For Sale"}</li>
            {property.wifi && <li>Wi-Fi included</li>}
            {property.billsIncluded && <li>Bills included</li>}
          </ul>
          <div className="mt-6">
            <Link to="/contact" className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2">
              Arrange a viewing
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

// --- Simple placeholder page ---
function Placeholder({ text }: { text: string }){
  return <main className="max-w-5xl mx-auto px-4 py-10 text-zinc-700">{text}</main>;
}

// --- App Router (default export for canvas preview) ---
export default function App(){
  // Fetch live data once; fall back to PROPS
  const [live, setLive] = useState<Property[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/properties");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) {
          // ensure images[] exists for safety
          const safe: Property[] = (data as Property[]).map(p => ({
            ...p,
            images: p.images?.length ? p.images : (p.img ? [p.img] : []),
          }));
          setLive(safe);
        }
      } catch (e) {
        console.warn("Using fallback PROPS. Live fetch failed:", e);
        if (!cancelled) setLive(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const DATA = live ?? PROPS;

  return (
    <Router>
      <DataContext.Provider value={DATA}>
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/for-sale" element={<ForSalePage />} />
            <Route path="/for-rent" element={<ForRentPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/landlords" element={<Placeholder text="Landlords page (todo)" />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/services" element={<ServicesFeesPage />} />
            <Route path="/list" element={<Placeholder text="List your property form (todo)" />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Placeholder text="404 – Page not found" />} />
          </Routes>
          <Footer />
        </div>
      </DataContext.Provider>
    </Router>
  );
}
