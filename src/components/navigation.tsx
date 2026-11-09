'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { href, type Locale, type Page } from '@/lib/links';
import { translations } from '@/lib/translations';
export function Navigation({ locale, page, slug }: { locale: Locale; page: Page; slug?: string }) {
  const [open, setOpen] = useState(false);
  const query = useSearchParams().toString();
  useEffect(() => { document.documentElement.lang = locale + '-BE'; setOpen(false); }, [locale]);
  const t = translations[locale], other = locale === 'fr' ? 'nl' : 'fr';
  return <>
    <button className="menu-button" aria-label={open ? t.close : t.open} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}><span/ ><span/ ></button>
    <nav id="main-navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label={t.menu} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); document.querySelector<HTMLButtonElement>('.menu-button')?.focus(); } }}>
      {(['home','catalog','support','contact'] as const).map((p, i) => <Link key={p} href={href(locale,p)} aria-current={p === page ? 'page' : undefined} onClick={() => setOpen(false)}>{t.nav[i]}</Link>)}
    </nav>
    <div className="language" aria-label={locale === 'fr' ? 'Langue' : 'Taal'}><span aria-current="true">{locale.toUpperCase()}</span><span className="language-divider">/</span><Link href={href(other,page,slug) + (query ? '?' + query : '')} hrefLang={other + '-BE'} aria-label={other === 'fr' ? 'Passer en français' : 'Overschakelen naar Nederlands'}>{other.toUpperCase()}</Link></div>
  </>;
}
