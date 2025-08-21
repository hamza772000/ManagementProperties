import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "../context/DataContext";

const cover = (p: any) => p.images?.[0] ?? p.img ?? "";

export default function CommercialListing() {
  const DATA = useProperties();
  const items = useMemo(() => DATA.filter(p => p.status === 'commercial'), [DATA]);
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Commercial Properties</h2>
        {items.length === 0 ? (
          <div className="text-sm text-zinc-600">No commercial listings available right now.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {items.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200"
              >
                <Link to={`/property/${p.id}`}>
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={cover(p)}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link
                    to={`/property/${p.id}`}
                    className="font-semibold text-lg hover:underline"
                  >
                    {p.title}
                  </Link>
                  <div className="text-sm text-zinc-600">
                    {p.area}, {p.address}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <aside>
        <h2 className="text-xl font-semibold mb-4">Featured Properties</h2>
      </aside>
    </main>
  );
}
