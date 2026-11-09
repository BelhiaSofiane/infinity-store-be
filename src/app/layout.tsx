import type { Metadata } from 'next';
import { headers } from 'next/headers';
import localFont from 'next/font/local';
import './globals.css';
import './stitch.css';
const jakarta = localFont({ src: './fonts/PlusJakartaSans.ttf', display: 'swap', variable: '--font-jakarta', weight: '200 800' });
export const metadata: Metadata = { title: 'Infinity Store', robots: { index: false, follow: false }, description: 'Infinity Store · Aperçu privé / Privévoorbeeld' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await headers()).get('x-store-locale') === 'nl-BE' ? 'nl-BE' : 'fr-BE';
  return <html lang={locale} className={jakarta.variable}><body>{children}</body></html>;
}
