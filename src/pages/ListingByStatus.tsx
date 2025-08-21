import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "../context/DataContext";

const cover = (p: any) => p.images?.[0] ?? p.img ?? "";

export default function ListingByStatus({ status }: { status: string }) {
  const DATA = useProperties();
  const items = useMemo(() => DATA.filter(p => p.status === status), [DATA, status]);
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">{status === "rent" ? "Properties for Rent" : "Properties for Sale"}</h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
    </main>
  );
}
