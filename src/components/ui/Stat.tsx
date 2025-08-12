import React from "react";

export default function Stat({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-1 text-zinc-600 text-sm">{icon}{children}</div>;
}
