export type Status = "rent" | "sale" | "commercial";

export type Property = {
  id: number;
  title: string;
  address: string;
  area: string;
  price: number;
  priceUnit: "pcm" | "pa";
  salePriceUnit?: "Guide Price" | "Fixed Price" | "Offers Over" | "OIEO" | "OIRO" | "Starting Bid";
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
