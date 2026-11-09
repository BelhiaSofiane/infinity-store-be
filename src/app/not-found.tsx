import { headers } from 'next/headers';
import Link from 'next/link';
import { Shell } from '@/components/storefront';
import { href } from '@/lib/links';
import { translations } from '@/lib/translations';
export default async function NotFound() {
  const locale = (await headers()).get('x-store-locale') === 'nl-BE' ? 'nl' : 'fr';
  const t = translations[locale];
  return <Shell locale={locale} page="home"><section className="container page-section"><span className="eyebrow">404</span><h1 className="page-title">{t.notFoundTitle}</h1><p className="page-lead">{t.notFoundText}</p><Link href={href(locale)} className="button dark">{t.back} →</Link></section></Shell>;
}
