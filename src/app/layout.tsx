import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
const bodyFont = Manrope({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const displayFont = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
export const metadata: Metadata = { title: 'Infinity Store', robots: { index: false, follow: false }, description: 'Infinity Store · Jeux, logiciels & divertissement / Games, software & entertainment' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await headers()).get('x-store-locale') === 'nl-BE' ? 'nl-BE' : 'fr-BE';
  return <html lang={locale} className={`${bodyFont.variable} ${displayFont.variable}`}><body>{children}</body></html>;
}
