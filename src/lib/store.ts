import 'server-only';
import business from '../../content/business.json';
import products from '../../content/products.json';
import policies from '../../content/policies.json';
import reviews from '../../private/reviews.json';
import { productBlockers, siteBlockers } from '../../scripts/validation.mjs';
export { business, policies };
export type Locale = 'fr' | 'nl';
export type Product = {
  sku: string; slug: string; category: string; status: string; image: string; priceEUR: number;
  edition: string; territory: string; devices: string; duration?: string;
  manufacturer?: string; euResponsiblePerson?: string; safety?: string; model?: string;
  translations: Record<Locale, { name: string; description: string; conditions: string; assistance: string; delivery: string; withdrawal: string; conformity: string; compatibility: string; taxDisclosure: string }>;
};
// Only explicitly projected public fields may pass to rendering. Evidence stays server-side.
export type DraftProduct = Pick<Product, 'sku' | 'slug' | 'category' | 'status' | 'priceEUR' | 'edition' | 'duration'> & {
  translations: Record<Locale, { name: string }>;
};
const catalog = products as (Product | DraftProduct)[];
export function getDraftProducts(): DraftProduct[] {
  return catalog.filter(p => p.status === 'pending_review').map(p => ({
    sku: p.sku, slug: p.slug, category: p.category, status: p.status,
    priceEUR: p.priceEUR, edition: p.edition, duration: p.duration,
    translations: { fr: { name: p.translations.fr.name }, nl: { name: p.translations.nl.name } },
  }));
}
export function getProducts(locale: Locale): Product[] {
  // Spreadsheet rows are preview data and cannot enter the commercial approval path.
  if ((process.env.CATALOG_SOURCE || 'local') !== 'local') return [];
  return catalog.filter((p): p is Product => !productBlockers(p, reviews.productReviews, locale).length).map(p => ({
    sku: p.sku, slug: p.slug, category: p.category, status: p.status, image: p.image, priceEUR: p.priceEUR,
    edition: p.edition, territory: p.territory, devices: p.devices, duration: p.duration,
    manufacturer: p.manufacturer, euResponsiblePerson: p.euResponsiblePerson, safety: p.safety, model: p.model,
    translations: p.translations,
  }));
}
export function isLaunchReady() { return !siteBlockers(business, policies, reviews).length; }
