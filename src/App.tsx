import React, { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { Search, MapPin, Home, Bath, BedDouble, PoundSterling } from "lucide-react";
import headerImg from "./assets/header.jpg";
import footerImg from "./assets/footer.jpg";
import ServicesFeesPage from "./pages/services";


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

// --- Types ---
type Status = "rent" | "sale";

type Property = {
  id: number;
  title: string;
  address: string;
  area: string; // e.g. Kensal Green
  price: number; // integer
  priceUnit: "pcm" | "pa"; // per calendar month / per annum
  status: Status;
  beds: number;
  baths: number;
  wifi?: boolean;
  billsIncluded?: boolean;
  img: string;
  featured?: boolean;
  coord: [number, number]; // [lat, lng]
};

// --- Mock dataset ---
const PROPS: Property[] = [
  { id: 1, title: "Extramead Road, Kensal Green", address: "NW10 5QD", area: "Kensal Green", price: 950, priceUnit: "pcm", status: "rent", beds: 1, baths: 1, wifi: true, billsIncluded: true, img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop", featured: false, coord: [51.531, -0.226] },
  { id: 2, title: "High Road, Willesden", address: "NW10 2DY", area: "Willesden", price: 450000, priceUnit: "pa", status: "sale", beds: 2, baths: 1, img: "https://images.unsplash.com/photo-1599423300746-b62533397364?q=80&w=1200&auto=format&fit=crop", featured: false, coord: [51.548, -0.232] },
  { id: 3, title: "Brindley Close, Alperton", address: "HA0 1BT", area: "Alperton", price: 1295, priceUnit: "pcm", status: "rent", beds: 1, baths: 1, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop", featured: true, coord: [51.538, -0.3006] },
  { id: 4, title: "Lichfield Gardens, Willesden", address: "NW10 2LL", area: "Willesden", price: 2100, priceUnit: "pcm", status: "rent", beds: 3, baths: 2, img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop", featured: true, coord: [51.544, -0.225] },
  { id: 6, title: "Weston Court, Paddington", address: "W2 1ED", area: "Paddington", price: 300000, priceUnit: "pa", status: "sale", beds: 1, baths: 1, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop", featured: false, coord: [51.515, -0.176] },
  { id: 7, title: "Broadway, West Hendon", address: "NW9 7YU", area: "West Hendon", price: 4400, priceUnit: "pcm", status: "rent", beds: 4, baths: 3, img: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop", featured: true, coord: [51.586, -0.238] },
  { id: 8, title: "Dollis Hill House", address: "NW10 1ED", area: "Dollis Hill", price: 1700, priceUnit: "pcm", status: "rent", beds: 2, baths: 2, img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=1200&auto=format&fit=crop", featured: false, coord: [51.564, -0.235] },
  { id: 9, title: "Neasden Village Way", address: "NW10 0LH", area: "Neasden", price: 15000, priceUnit: "pa", status: "sale", beds: 3, baths: 2, img: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=1200&auto=format&fit=crop", featured: true, coord: [51.561, -0.252] },
  { id: 10, title: "Wembley Central Studio", address: "HA9 7AA", area: "Wembley", price: 1250, priceUnit: "pcm", status: "rent", beds: 1, baths: 1, img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop", featured: false, coord: [51.552, -0.296] },
];

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

function Header() {
  const brandGreen = "#8CBF45";

  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: brandGreen }}>
      {/* Compact banner on white so it doesn't look bulky */}
      <div className="w-full" style={{ backgroundColor: "white" }}>
        <img
          src={headerImg}                // <-- use imported image
          alt="Management Properties — Sales, Lettings & Management"
          className="mx-auto object-contain"
          style={{ height: "90px" }}     // tweak this value if you want it smaller/larger
        />
      </div>

      {/* Nav bar in brand green */}
      <nav
        className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6 text-sm text-white"
        style={{ backgroundColor: brandGreen }}
      >
        <NavLink to="/" end className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Home
        </NavLink>
        <NavLink to="/for-sale" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          For Sale
        </NavLink>
        <NavLink to="/for-rent" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          For Rent
        </NavLink>
        <NavLink to="/landlords" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Landlords
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Contact
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Services & Fees
        </NavLink>
        <NavLink
          to="/list"
          className="ml-auto rounded-xl bg-white px-3 py-1"
          style={{ color: brandGreen }}
        >
          List your property
        </NavLink>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer
      className="border-t mt-8"
      style={{ backgroundColor: "white", borderColor: "white" }}
    >
        <img
          src={footerImg}
          alt="Management Properties — Contact details"
          className="w-full"
          style={{
            height: "120px",          // fixed strip height
            objectFit: "contain", // ✅ shows entire image, no crop
            objectPosition: "center" // or "top"/"bottom" if you want to bias it
          }}
        />
    </footer>
  );
}



function FilterForm({
  mode, setMode,
  q, setQ,
  minBeds, setMinBeds,
  minBaths, setMinBaths,
  priceFrom, setPriceFrom,
  priceTo, setPriceTo,
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
        <button
          onClick={() => setMode("rent")}
          className={`px-3 py-1.5 rounded-full text-sm border ${
            mode === "rent" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-zinc-700 border-zinc-300"
          }`}
        >
          For Rent
        </button>
        <button
          onClick={() => setMode("sale")}
          className={`px-3 py-1.5 rounded-full text-sm border ${
            mode === "sale" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-zinc-700 border-zinc-300"
          }`}
        >
          For Sale
        </button>
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
          <select
            value={minBeds}
            onChange={(e) => setMinBeds(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
          >
            {[0,1,2,3,4].map(n => <option key={n} value={n}>{n===0?"Any":n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600">Baths (min)</label>
          <select
            value={minBaths}
            onChange={(e) => setMinBaths(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
          >
            {[0,1,2,3].map(n => <option key={n} value={n}>{n===0?"Any":n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600">Price From</label>
          <input
            type="number"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Any"
            className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600">Price To</label>
          <input
            type="number"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Any"
            className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
          />
        </div>
      </div>
    </>
  );
}

function HomePage() {
  const [mode, setMode] = useState<Status>("rent");
  const [q, setQ] = useState("");
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [priceFrom, setPriceFrom] = useState<number | "">("");
  const [priceTo, setPriceTo] = useState<number | "">("");

  const filtered = useMemo(() => {
    return PROPS.filter((p) => {
      if (p.status !== mode) return false;
      if (q && !(p.area + " " + p.title + " " + p.address).toLowerCase().includes(q.toLowerCase())) return false;
      if (minBeds && p.beds < minBeds) return false;
      if (minBaths && p.baths < minBaths) return false;
      if (priceFrom !== "" && p.price < Number(priceFrom)) return false;
      if (priceTo !== "" && p.price > Number(priceTo)) return false;
      return true;
    });
  }, [mode, q, minBeds, minBaths, priceFrom, priceTo]);

  const center: [number, number] = [51.544, -0.23];

  return (
    <>
      {/* Map & Filters */}
      <section className="relative">
        {/* Mobile: show filters above the map */}
        <div className="lg:hidden px-4 pt-4">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 p-4">
            <FilterForm
              {...{ mode, setMode, q, setQ, minBeds, setMinBeds, minBaths, setMinBaths, priceFrom, setPriceFrom, priceTo, setPriceTo }}
            />
            <div className="mt-3 text-right">
              <span className="text-xs text-zinc-500">{filtered.length} result(s)</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[360px] md:h-[420px] lg:h-[480px] w-full">
          <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((p) => (
              <Marker key={p.id} position={p.coord} icon={markerIcon}>
                <Popup>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-zinc-600 mb-1">{p.address}</div>
                  <PriceTag value={p.price} unit={p.priceUnit} />
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
            <FilterForm
              {...{ mode, setMode, q, setQ, minBeds, setMinBeds, minBaths, setMinBaths, priceFrom, setPriceFrom, priceTo, setPriceTo }}
            />
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
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200"
              >
                <Link to={`/property/${p.id}`}>
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <img src={p.img} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold rounded px-2 py-1 ${
                        p.status === "rent" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {p.status === "rent" ? "For Rent" : "For Sale"}
                    </span>
                    <PriceTag value={p.price} unit={p.priceUnit} />
                  </div>
                  <Link to={`/property/${p.id}`} className="mt-2 block font-semibold text-lg hover:underline">
                    {p.title}
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-zinc-600">
                    <MapPin className="h-4 w-4" /> {p.area}, {p.address}
                  </div>
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
            {PROPS.filter((p) => p.featured).map((p) => (
              <Link
                key={p.id}
                to={`/property/${p.id}`}
                className="flex gap-3 rounded-xl bg-white ring-1 ring-zinc-200 p-2 shadow-sm hover:ring-sky-300"
              >
                <img src={p.img} alt={p.title} className="h-20 w-28 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="text-xs text-zinc-500">{p.area}</div>
                  <div className="font-medium leading-tight">{p.title}</div>
                  <div className="text-xs text-zinc-500">{p.address}</div>
                  <div className="mt-1">
                    <PriceTag value={p.price} unit={p.priceUnit} />
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

// --- Listing pages by status ---
function ListingByStatus({ status }: { status: Status }) {
  const items = useMemo(() => PROPS.filter(p => p.status === status), [status]);
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">{status === "rent" ? "Properties for Rent" : "Properties for Sale"}</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {items.map(p => (
            <article key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
              <Link to={`/property/${p.id}`}>
                <div className="aspect-[16/10] w-full overflow-hidden"><img src={p.img} alt={p.title} className="h-full w-full object-cover" /></div>
              </Link>
              <div className="p-4">
                <Link to={`/property/${p.id}`} className="font-semibold text-lg hover:underline">{p.title}</Link>
                <div className="text-sm text-zinc-600">{p.area}, {p.address}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <aside><h2 className="text-xl font-semibold mb-4">Featured Properties</h2>{/* reuse sidebar if needed */}</aside>
    </main>
  );
}

function ForSalePage(){ return <ListingByStatus status="sale"/> }
function ForRentPage(){ return <ListingByStatus status="rent"/> }

// --- Property detail page ---
function PropertyDetailPage(){
  const { id } = useParams();
  const property = PROPS.find(p=>p.id === Number(id));
  if(!property){
    return <main className="max-w-5xl mx-auto px-4 py-10"><p className="text-zinc-700">Property not found.</p><Link to="/" className="text-sky-600">Back to home</Link></main>;
  }
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl"><img src={property.img} alt={property.title} className="h-full w-full object-cover" /></div>
          <div className="mt-4 text-sm text-zinc-600">{property.area} • {property.address}</div>
        </div>
        <aside className="lg:col-span-2">
          <h1 className="text-2xl font-semibold">{property.title}</h1>
          <div className="mt-3 text-lg font-medium">{currency(property.price)} {property.priceUnit}</div>
          <ul className="mt-4 space-y-1 text-zinc-700">
            <li>Bedrooms: {property.beds}</li>
            <li>Bathrooms: {property.baths}</li>
            <li>Status: {property.status === "rent" ? "For Rent" : "For Sale"}</li>
          </ul>
          <div className="mt-6"><Link to="/contact" className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2">Arrange a viewing</Link></div>
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
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/for-sale" element={<ForSalePage />} />
          <Route path="/for-rent" element={<ForRentPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/landlords" element={<Placeholder text="Landlords page (todo)" />} />
          <Route path="/contact" element={<Placeholder text="Contact page (todo)" />} />
          <Route path="/services" element={<ServicesFeesPage />} />
          <Route path="/list" element={<Placeholder text="List your property form (todo)" />} />
          <Route path="*" element={<Placeholder text="404 – Page not found" />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
