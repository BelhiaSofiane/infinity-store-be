import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Shell, Home, Catalog, Support, Contact, ProductDetail } from '@/components/storefront';
import { getProducts, policies, isLaunchReady } from '@/lib/store';
import { getCatalogSnapshot } from '@/lib/catalog';
import type { CatalogSnapshot } from '@/lib/catalog-types';
import { translations } from '@/lib/translations';
import { segments, href, type Page, type Locale } from '@/lib/links';
type Props = { params: Promise<{ locale: string; path?: string[] }> };
async function catalogForRoute(locale: string, path: string[] = []): Promise<CatalogSnapshot> {
  if ((locale === 'fr' || locale === 'nl') && (!path.length || path[0] === segments[locale].catalog)) return getCatalogSnapshot();
  // Contact, support and policy pages never depend on a working Google connection.
  return {status:'ready',source:'local',fetchedAt:0,products:[],categories:[]};
}
function resolve(locale: string, path: string[] = [], snapshot?: CatalogSnapshot): { locale: Locale; page: Page; slug?: string; category?: string } | null {
  if (locale !== 'fr' && locale !== 'nl') return null;
  const page = (Object.entries(segments[locale]).find(([,segment]) => segment === (path[0] || ''))?.[0]) as Page | undefined;
  if (!page) return null;
  if (path.length > 1) {
    if (page !== 'catalog') return null;
    if (path.length === 3 && path[1] === 'categorie') {
      if (snapshot?.status === 'unavailable' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path[2])) return {locale,page,category:path[2]};
      if (!getProducts(locale).some(p => p.category === path[2]) && !(snapshot?.status === 'ready' && snapshot.products.some(p => p.category === path[2]))) return null;
      return { locale, page, category: path[2] };
    }
    if (path.length !== 2 || !getProducts(locale).some(p => p.slug === path[1])) return null;
    return { locale, page, slug: path[1] };
  }
  return { locale, page };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, path } = await params;
  const snapshot = await catalogForRoute(locale,path);
  const route = resolve(locale,path,snapshot);
  if (!route) return { title: locale === 'nl' ? 'Pagina niet beschikbaar | Infinity Store' : 'Page indisponible | Infinity Store' };
  const t = translations[route.locale];
  const title = route.slug ? getProducts(route.locale).find(p => p.slug === route.slug)!.translations[route.locale].name : (t.policies as Record<string,string>)[route.page] || t.nav[(['home','catalog','support','contact'] as Page[]).indexOf(route.page)];
  return { title: `${title} | Infinity Store`, description: t.previewNote, robots: { index: false, follow: false } };
}
export default async function PageView({ params }: Props) {
  const { locale, path } = await params;
  const snapshot = await catalogForRoute(locale,path);
  const route = resolve(locale,path,snapshot);
  if (!route) notFound();
  const { locale: l, page, slug, category } = route, t = translations[l];
  let content;
  if (page === 'home') content = <Home locale={l} snapshot={snapshot}/>;
  else if (page === 'catalog') content = slug ? <ProductDetail locale={l} product={getProducts(l).find(p => p.slug === slug)!}/> : <Catalog locale={l} category={category} snapshot={snapshot}/>;
  else if (page === 'support') content = <Support locale={l}/>;
  else if (page === 'contact') content = <Contact locale={l}/>;
  else {
    const approvedPolicy = isLaunchReady() ? policies.locales[l][page as keyof typeof policies.locales.fr] : null;
    content = <section className="container page-section policy-page"><span className="eyebrow">INFINITY STORE</span><h1 className="page-title">{(t.policies as Record<string,string>)[page]}</h1>{approvedPolicy ? <p className="policy-text">{approvedPolicy}</p> : <><div className="policy-notice"><span className="status-dot"/><strong>{t.policyPending}</strong><p>{t.policyText}</p></div>{page === 'storage' && <p>{t.storageText}</p>}{page === 'accessibility' && <p>{t.accessibilityText}</p>}</>}<Link href={href(l,'contact')} className="text-link">{t.contact} →</Link></section>;
  }
  return <Shell locale={l} page={page} slug={slug || (category ? 'categorie/' + category : undefined)}>{content}</Shell>;
}
