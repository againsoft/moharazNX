import type { SpecialOfferType } from "@/lib/mock-data/special-offers";

export type OfferLabel = {
  text: string;
  type: "flash" | SpecialOfferType;
};
