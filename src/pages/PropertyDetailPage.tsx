import { useParams, Link } from "react-router-dom";
import { useProperties } from "../context/DataContext";
import ImageGallery from "../components/ImageGallery";

function currency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

const cover = (p: any) => p.images?.[0] ?? p.img ?? "";

export default function PropertyDetailPage() {
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
