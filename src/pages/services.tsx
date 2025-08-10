import { Link } from "react-router-dom";

const brandGreen = "#8CBF45";

type Card = { title: string; items?: string[]; cta?: string; to?: string };

const topRow: Card[] = [
  {
    title: "Letting Only",
    items: [
      "Annual Fee",
      "7%",
      "Sourcing a tenant",
      "Full referencing",
      "Arrangement of EPC’s, Gas Safety Inspections",
      "In-house inventory",
    ],
  },
  {
    title: "Rent Collection",
    items: [
      "Fees collected on a Monthly basis",
      "8%",
      "Monthly rental collection",
      "Pursue non-payment of rent and advice on rent arrears",
      "Sourcing a tenant",
      "Full referencing",
      "Arrangement of EPC’s, Gas Safety Inspections",
      "In-house inventory",
    ],
  },
  {
    title: "Fully Managed",
    items: [
      "Fees collected on a Monthly basis",
      "10%",
      "Monthly rental collection",
      "Pursue non-payment of rent and advice on rent arrears",
      "Sourcing a tenant",
      "Full referencing",
      "Arrangement of EPC’s, Gas Safety Inspections",
      "In-house inventory",
      "Routine inspections",
      "First point of contact for Tenants",
      "Obtaining quotes and arranging for repairs",
    ],
  },
];

const bottomRow: Card[] = [
  { title: "Other Landlord Fees", cta: "Click here", to: "#" },
  { title: "Tenants Fees", cta: "Click here", to: "#" },
];

const salesCard: Card = {
  title: "Sales",
  items: [
    "On Completion",
    "Comprehensive Marketing",
    "Arrangement of EPC’s",
    "Accompanied viewings if required",
  ],
};

function CardBox({ card }: { card: Card }) {
  return (
    <article className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 overflow-hidden">
      {/* header */}
      <div className="px-5 py-3 text-white font-semibold" style={{ backgroundColor: brandGreen }}>
        {card.title}
      </div>

      {/* body */}
      <div className="p-5">
        {card.items && (
          <ul className="text-sm text-zinc-700">
            {card.items.map((it, i) => (
              <li key={i} className="py-2">
                {it}
                {i !== card.items!.length - 1 && (
                  <div className="mt-2 border-t border-zinc-200/70" />
                )}
              </li>
            ))}
          </ul>
        )}

        {card.cta && (
          <div className="mt-4">
            <Link
              to={card.to || "#"}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: brandGreen }}
            >
              {card.cta}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

export default function ServicesFeesPage() {
  return (
    <main className="bg-zinc-50">
      {/* Page title */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Services &amp; Fees</h1>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-8 grid gap-6">
        {/* top row: 3 columns */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topRow.map((c, i) => (
            <CardBox key={i} card={c} />
          ))}
        </div>

        {/* bottom row: 2 small cards + 1 tall sales card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
          {/* two small */}
          {bottomRow.map((c, i) => (
            <CardBox key={i} card={c} />
          ))}

          {/* sales card (taller) */}
          <article className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 overflow-hidden lg:row-span-2">
            <div className="px-5 py-3 text-white font-semibold" style={{ backgroundColor: brandGreen }}>
              {salesCard.title}
            </div>
            <div className="p-5">
              <ul className="text-sm text-zinc-700">
                {salesCard.items!.map((it, i) => (
                  <li key={i} className="py-2">
                    {it}
                    {i !== salesCard.items!.length - 1 && (
                      <div className="mt-2 border-t border-zinc-200/70" />
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link
                  to="#"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-white"
                  style={{ backgroundColor: brandGreen }}
                >
                  More Info
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Need more info strip */}
      <section className="border-t py-10" style={{ borderColor: brandGreen }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-medium text-zinc-900 mb-2">Need More Information?</h2>
          <p className="text-sm text-zinc-600">
            One of our friendly experienced staff can answer all your questions. Call us today on{" "}
            <a href="tel:02084518888" className="font-medium underline">
              020 8451 8888
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
