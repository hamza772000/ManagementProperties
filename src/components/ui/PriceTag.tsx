import { PoundSterling } from "lucide-react";

function currency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

export default function PriceTag({ value, unit }: { value: number; unit: "pcm" | "pa" | "Guide Price" | "Fixed Price" | "Offers Over" | "OIEO" | "OIRO" | "Starting Bid" }) {
  // Sale price units should appear before the price
  const saleUnits = ["Guide Price", "Fixed Price", "Offers Over", "OIEO", "OIRO", "Starting Bid"];
  const isSaleUnit = saleUnits.includes(unit as any);

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 text-xs font-medium">
      <PoundSterling className="h-3 w-3" />
      {isSaleUnit ? (
        <>{unit} {currency(value)}</>
      ) : (
        <>{currency(value)} {unit}</>
      )}
    </div>
  );
}
