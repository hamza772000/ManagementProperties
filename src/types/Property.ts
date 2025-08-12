export type Status = "rent" | "sale";

export type Property = {
  id: number;
  title: string;
  address: string;
  area: string;
  price: number;
  priceUnit: "pcm" | "pa";
  status: Status;
  beds: number;
  baths: number;
  featured?: boolean;
  coord: [number, number];
  wifi?: boolean;
  billsIncluded?: boolean;
  description?: string;
  img?: string;
  images?: string[];
};
