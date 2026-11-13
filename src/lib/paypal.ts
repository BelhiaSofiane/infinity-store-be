import "server-only";

export function paypalLinksEnabled(env = process.env): boolean {
  return env.PAYPAL_LINKS_ENABLED === "true" &&
    env.CATALOG_SOURCE === "google-sheets";
}
