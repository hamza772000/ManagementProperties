import { Property } from "../types/Property";

export const PROPS_RAW: Property[] = [
  // Add your mock data here
];

export const PROPS: Property[] = PROPS_RAW.map((p) => ({
  ...p,
  images: p.images?.length ? p.images : (p.img ? [p.img] : []),
}));
