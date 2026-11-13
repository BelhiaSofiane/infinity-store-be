import "server-only";

export function paypalLinksEnabled(): boolean {
  return process.env.PAYPAL_LINKS_ENABLED === "true" &&
    process.env.CATALOG_SOURCE === "google-sheets";
}
