export type Locale = 'fr' | 'nl';
export const segments = {
  fr: { home: '', catalog: 'produits', support: 'assistance', contact: 'contact', legal: 'mentions-legales', terms: 'conditions-de-vente', privacy: 'confidentialite', storage: 'cookies', returns: 'retractation-retours', delivery: 'livraison', accessibility: 'accessibilite' },
  nl: { home: '', catalog: 'producten', support: 'klantendienst', contact: 'contact', legal: 'juridische-informatie', terms: 'verkoopvoorwaarden', privacy: 'privacy', storage: 'cookies', returns: 'herroeping-retourneren', delivery: 'levering', accessibility: 'toegankelijkheid' },
} as const;
export type Page = keyof typeof segments.fr;
export function href(locale: Locale, page: Page = 'home', slug?: string) { return `/${locale}${segments[locale][page] ? '/' + segments[locale][page] : ''}${slug ? '/' + slug : ''}`; }
export function whatsapp(locale: Locale, type: 'inquiry' | 'support' | 'complaint' = 'inquiry', product?: { name: string; sku: string; edition: string; duration?: string }) {
  const messages = {
    fr: { inquiry: 'Bonjour Infinity Store, je souhaite obtenir des informations.', support: 'Bonjour Infinity Store, je souhaite de l’aide pour un achat existant.', complaint: 'Bonjour Infinity Store, je souhaite discuter d’une réclamation, d’un retour ou d’une annulation.' },
    nl: { inquiry: 'Hallo Infinity Store, ik wil graag informatie ontvangen.', support: 'Hallo Infinity Store, ik wil graag hulp bij een bestaande aankoop.', complaint: 'Hallo Infinity Store, ik wil graag een klacht, retour of annulering bespreken.' },
  };
  let message: string = messages[locale][type];
  if (product) message += ' ' + [product.name, `SKU: ${product.sku}`, product.edition.trim(), product.duration].filter(Boolean).join(' · ');
  return 'https://wa.me/213549260383?text=' + encodeURIComponent(message);
}
