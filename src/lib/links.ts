export type Locale = 'fr' | 'en';
export const segments = {
  fr: { home: '', catalog: 'produits', support: 'assistance', contact: 'contact', legal: 'mentions-legales', terms: 'conditions-de-vente', privacy: 'confidentialite', storage: 'cookies', returns: 'retractation-retours', delivery: 'livraison', accessibility: 'accessibilite' },
  en: { home: '', catalog: 'products', support: 'support', contact: 'contact', legal: 'legal', terms: 'terms-of-sale', privacy: 'privacy', storage: 'cookies', returns: 'returns', delivery: 'delivery', accessibility: 'accessibility' },
} as const;
export type Page = keyof typeof segments.fr;
export function href(locale: Locale, page: Page = 'home', slug?: string) {
  const localizedSlug = slug?.replace(/^(categorie|category)\//, locale === 'fr' ? 'categorie/' : 'category/');
  return `/${locale}${segments[locale][page] ? '/' + segments[locale][page] : ''}${localizedSlug ? '/' + localizedSlug : ''}`;
}
export function whatsapp(locale: Locale, type: 'inquiry' | 'support' | 'complaint' = 'inquiry', product?: { name: string; sku: string; edition: string; duration?: string }) {
  const messages = {
    fr: { inquiry: 'Bonjour Zakinus Store, je souhaite obtenir des informations.', support: 'Bonjour Zakinus Store, je souhaite de l’aide pour un achat existant.', complaint: 'Bonjour Zakinus Store, je souhaite discuter d’une réclamation, d’un retour ou d’une annulation.' },
    en: { inquiry: 'Hello Zakinus Store, I would like some information.', support: 'Hello Zakinus Store, I need help with an existing purchase.', complaint: 'Hello Zakinus Store, I would like to discuss a complaint, return or cancellation.' },
  };
  let message: string = messages[locale][type];
  if (product) message += ` ${product.name} · SKU: ${product.sku} · ${product.edition}${product.duration ? ' · ' + product.duration : ''}`;
  return 'https://wa.me/447391276335?text=' + encodeURIComponent(message);
}
