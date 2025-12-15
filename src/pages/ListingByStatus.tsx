import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "../context/DataContext";

const cover = (p: any) => p.images?.[0] ?? p.img ?? "";

export default function ListingByStatus({ status }: { status: string }) {
  const DATA = useProperties();
  const items = useMemo(() => DATA.filter((p) => p.status === status), [DATA, status]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">
          {status === "rent" ? "Properties for Rent" : "Properties for Sale"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {items.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200"
            >
              <Link to={`/property/${p.id}`} className="block">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {/* Corner ribbon (won't get cut off) */}
                    {p.availability && (
                      <div className="pointer-events-none absolute top-2 left-2 h-32 w-32">
                        <div className="absolute top-7 left-[-54px] w-56 rotate-[-45deg] bg-emerald-600 text-white text-[11px] font-semibold tracking-[0.22em] uppercase text-center py-1 shadow-md ring-1 ring-white/25">
                          {p.availability}
                        </div>
                      </div>
                    )}
                  <img
                    src={cover(p)}
                    alt={p.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/property/${p.id}`} className="font-semibold text-lg hover:underline">
                  {p.title}
                </Link>
                <div className="text-sm text-zinc-600">
                  {p.area}, {p.address}
                </div>

                {p.availability && (
                  <div className="mt-1">
                    <span className="inline-block text-[10px] font-semibold rounded px-1.5 py-0.5 bg-sky-50 text-sky-700">
                      {p.availability}
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
