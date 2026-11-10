export type CatalogLocale = "fr" | "nl";
export type CatalogItem = {
  sku: string;
  slug: string;
  groupId: string;
  category: string;
  status: "pending_review";
  edition: string;
  priceEUR: number;
  availability: "available" | "sold_out" | "unconfirmed";
  imageKey: string;
  sortOrder: number;
  translations: Record<
    CatalogLocale,
    { name: string; description: string; variant: string }
  >;
};
export type CatalogCategory = {
  id: string;
  translations: Record<CatalogLocale, string>;
  sortOrder: number;
};
export type CatalogSnapshot = {
  status: "ready" | "unavailable";
  source: "local" | "google-sheets";
  fetchedAt: number;
  products: CatalogItem[];
  categories: CatalogCategory[];
};
