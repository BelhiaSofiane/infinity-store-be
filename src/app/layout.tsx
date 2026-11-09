import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
export const metadata: Metadata = { title: 'Infinity Store', robots: { index: false, follow: false }, description: 'Infinity Store · Aperçu privé / Privévoorbeeld' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await headers()).get('x-store-locale') === 'nl-BE' ? 'nl-BE' : 'fr-BE';
  return <html lang={locale}><body>{children}</body></html>;
}
