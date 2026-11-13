// Shared, public validation only. No credentials or environment settings belong here.
export function paypalUrl(value) {
  if (typeof value !== "string") return null;
  const url = value.trim();
  return /^https:\/\/www\.paypal\.com\/ncp\/payment\/[A-Za-z0-9_-]+$/.test(url)
    ? url
    : null;
}

export function euroCents(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  const cents = Math.round(value * 100);
  return Number.isSafeInteger(cents) && Math.abs(value * 100 - cents) < 0.000001
    ? cents
    : null;
}

export function paypalCheckoutUrl(item, enabled) {
  const price = euroCents(item.priceEUR);
  return enabled === true && item.availability === "available" && price !== null &&
    price === euroCents(item.paypalPriceEUR)
    ? paypalUrl(item.paypalUrl)
    : null;
}
