import React from "react";
import { PoundSterling } from "lucide-react";

function currency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

export default function PriceTag({ value, unit }: { value: number; unit: "pcm" | "pa" }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 text-xs font-medium">
      <PoundSterling className="h-3 w-3" />
      {currency(value)} {unit}
    </div>
  );
}
