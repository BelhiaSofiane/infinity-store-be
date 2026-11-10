import Link from 'next/link';
import { translations } from '@/lib/translations';
import { href, whatsapp, type Locale, type Page } from '@/lib/links';
import { business, getProducts, getDraftProducts, type Product } from '@/lib/store';
import { Icon } from './icon';
import { Navigation } from './navigation';
import { CatalogPreview } from './catalog-preview';

export function WhatsApp({ locale, type = 'inquiry', children, className = 'button dark', product }: { locale: Locale; type?: 'inquiry' | 'support' | 'complaint'; children?: React.ReactNode; className?: string; product?: Product }) {
  return <a className={className} href={whatsapp(locale,type,product && { name: product.translations[locale].name, sku: product.sku, edition: product.edition, duration: product.duration })} target="_blank" rel="noopener noreferrer">{children || translations[locale].inquiry}<Icon name="external" size={18}/></a>;
}
export function Shell({ locale, page, slug, children }: { locale: Locale; page: Page; slug?: string; children: React.ReactNode }) {
  const t = translations[locale];
  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <div className="utility"><div className="container utility-inner"><span><span className="status-dot"/>{t.preview} <span className="utility-detail">— {t.previewNote}</span></span></div></div>
    <header className="header container"><Link className="brand" href={href(locale)} aria-label="Infinity Store"><span className="brand-symbol">∞</span><span>infinity<span className="brand-store">store</span><span className="brand-dot">.</span></span></Link><Navigation locale={locale} page={page} slug={slug}/><WhatsApp locale={locale} className="button header-cta">{t.ask}<span className="sr-only"> WhatsApp</span></WhatsApp></header>
    <main id="main">{children}</main>
    <footer className="footer"><div className="container footer-grid"><div className="footer-brand"><Link className="brand" href={href(locale)}><span className="brand-symbol">∞</span><span>infinity<span className="brand-store">store</span>.</span></Link><p>{t.footerAbout}</p><span className="footer-country">{t.country} → {locale === 'fr' ? 'Belgique' : 'België'}</span></div><div><h2>{t.explore}</h2>{(['home','catalog','support','contact'] as const).map((p,i) => <Link key={p} href={href(locale,p)}>{t.nav[i]}</Link>)}</div><div><h2>{t.information}</h2>{Object.entries(t.policies).map(([key,label]) => <Link key={key} href={href(locale,key as Page)}>{label}</Link>)}</div><div><h2>{t.contact}</h2><a href={whatsapp(locale)} target="_blank" rel="noopener noreferrer">+213 549 26 03 83 <Icon name="external" size={14}/></a><p className="footer-small">{t.emailMissing}</p><Link href={href(locale === 'fr' ? 'nl' : 'fr', page, slug)}>{locale === 'fr' ? 'Nederlands' : 'Français'} <Icon name="arrow" size={14}/></Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Infinity Store</span><span>{t.footerNote}</span><span>FR / NL · EUR</span></div></footer>
  </>;
}
export function ConceptArt({ locale }: { locale: Locale }) {
  return <figure className="hero-scene" aria-label={translations[locale].illustration}>
    <img src="/assets/atmosphere/gaming-dusk.webp" alt="" width="1536" height="1024" fetchPriority="high"/>
    <figcaption><span className="scene-mark" aria-hidden="true">∞</span><span>{locale === 'fr' ? 'Un espace pour vos envies numériques.' : 'Ruimte voor jouw digitale wereld.'}</span></figcaption>
  </figure>;
}
export function EmptyCatalog({ locale }: { locale: Locale }) {
  const t = translations[locale];
  return <div className="empty-catalog"><div className="empty-art" aria-hidden="true"><div className="empty-square square-back"/><div className="empty-square square-front"><Icon name="grid" size={40}/></div><span className="empty-spark">✳</span></div><div className="empty-copy"><span className="eyebrow muted">{t.emptyTag}</span><h3>{t.emptyTitle}</h3><p>{t.emptyText}</p><WhatsApp locale={locale} className="text-link">{t.emptyLink}</WhatsApp></div><span className="empty-index" aria-hidden="true">∞</span></div>;
}
export function ProductList({ locale, category }: { locale: Locale; category?: string }) {
  const products = getProducts(locale).filter(p => !category || p.category === category), t = translations[locale];
  if (!products.length) return <DraftCatalog locale={locale} category={category}/>;
  return <><nav className="category-links">{[...new Set(getProducts(locale).map(p => p.category))].map(c => <Link key={c} href={href(locale,'catalog') + '/categorie/' + c}>{c}</Link>)}</nav><div className="product-grid">{products.map(p => <article className="product-card" key={p.sku}><img src={p.image} alt={p.translations[locale].name} width="400" height="300"/><h3>{p.translations[locale].name}</h3><p>{p.translations[locale].description}</p><strong>{new Intl.NumberFormat(locale + '-BE',{ style: 'currency', currency: 'EUR' }).format(p.priceEUR)}</strong><p>{p.translations[locale].taxDisclosure}</p><p>{p.translations[locale].conditions}</p><Link href={href(locale,'catalog',p.slug)}>{t.details} →</Link><WhatsApp locale={locale} product={p}/><p className="fineprint">{t.external}</p></article>)}</div></>;
}
function DraftCatalog({ locale, category }: { locale: Locale; category?: string }) {
  const products = getDraftProducts().filter(p => !category || p.category === category);
  if (!products.length) return <EmptyCatalog locale={locale}/>;
  return <CatalogPreview locale={locale} products={products} initialCategory={category}/>;
}
export function ContactBanner({ locale }: { locale: Locale }) {
  const t = translations[locale];
  return <section className="contact-banner container"><div><span className="eyebrow">{t.contactTag}</span><h2>{t.contactTitle}</h2></div><div><p>{t.contactText}</p><WhatsApp locale={locale} className="button light">{t.talk}</WhatsApp><p className="fineprint">{t.external}</p></div><span className="banner-loop" aria-hidden="true">∞</span></section>;
}
export function Home({ locale }: { locale: Locale }) {
  const t = translations[locale];
  return <>
    <section className="hero container"><ConceptArt locale={locale}/><div className="hero-copy"><span className="eyebrow"><span className="purple-line"/>{t.eyebrow}</span><h1>{t.hero1}<br/><span>{t.hero2}</span></h1><p className="hero-intro">{t.intro}</p><div className="hero-actions"><Link className="button dark" href={href(locale,'catalog')}>{t.discover}<Icon/></Link><WhatsApp locale={locale} className="text-link">{t.ask}</WhatsApp></div><p className="fineprint hero-note"><Icon name="chat" size={15}/>{t.external}</p></div></section>
    <div className="container reassurance">{t.reassurance.map((text,i) => <div key={text}><span className="reassurance-icon"><Icon name={['chat','shield','check'][i]} size={21}/></span><span>{text}</span></div>)}</div>
    <section className="catalog-section container"><div className="section-heading"><div><span className="eyebrow">{t.catalogEyebrow}</span><h2>{t.catalogTitle}</h2></div><Link className="text-link" href={href(locale,'catalog')}>{t.allProducts}<Icon/></Link></div><ProductList locale={locale}/></section>
    <section className="journey container"><div className="journey-intro"><span className="eyebrow">{t.journeyTag}</span><h2>{t.journeyTitle}</h2><p>{t.journeySub}</p><Link className="text-link" href={href(locale,'support')}>{t.supportLink}<Icon/></Link></div><div className="journey-steps">{t.steps.map(([title,text],i) => <div className="journey-step" key={title}><span className="step-number">0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div><Icon name={['chat','check','help'][i]} size={25}/></div>)}</div></section>
    <section className="faq container"><div><span className="eyebrow">{t.faqTag}</span><h2>{t.faqTitle}</h2><Link href={href(locale,'support')} className="text-link">{t.nav[2]}<Icon/></Link></div><div className="faq-list">{t.faqs.map(([q,a]) => <details key={q}><summary>{q}<Icon name="plus" size={18}/></summary><p>{a}</p></details>)}</div></section>
    <ContactBanner locale={locale}/>
  </>;
}
export function Catalog({ locale, category }: { locale: Locale; category?: string }) {
  const t = translations[locale];
  return <section className="container page-section"><span className="eyebrow">{t.catalogEyebrow}</span><h1 className="page-title">{t.catalogPageTitle}</h1><p className="page-lead">{t.catalogPageText}</p><div className="catalog-toolbar"><span>{getProducts(locale).length || getDraftProducts().length} {locale === 'fr' ? 'référence(s)' : 'product(en)'}</span><Link href={href(locale,'support')} className="text-link">{t.helpChoose}<Icon name="help" size={18}/></Link></div><ProductList locale={locale} category={category}/></section>;
}
export function Support({ locale }: { locale: Locale }) {
  const t = translations[locale];
  return <section className="container page-section"><span className="eyebrow">{t.supportTag}</span><h1 className="page-title">{t.supportTitle}</h1><p className="page-lead">{t.supportIntro}</p><div className="support-grid">{t.supportCards.map(([title,body,label],i) => <article className="support-card" key={title}><span className="support-icon"><Icon name={['chat','help','shield'][i]} size={27}/></span><h2>{title}</h2><p>{body}</p><WhatsApp locale={locale} type={(['inquiry','support','complaint'] as const)[i]} className="text-link">{label}</WhatsApp></article>)}</div><p className="fineprint">{t.external}</p><div className="info-grid"><article><h2>{t.serviceTitle}</h2><p>{t.serviceText}</p><p>{t.emailMissing}</p><p>{t.escalationText}</p></article><article><h2>{t.securityTitle}</h2><p>{t.securityText}</p><Link className="text-link" href={href(locale,'returns')}>{t.policies.returns}<Icon/></Link></article></div></section>;
}
export function Contact({ locale }: { locale: Locale }) {
  const t = translations[locale];
  return <section className="container page-section"><span className="eyebrow">{t.contact}</span><h1 className="page-title">{t.sellerTitle}</h1><p className="page-lead">{t.sellerText}</p><div className="contact-layout"><div className="contact-details"><div><span>{t.establishment}</span><strong>{t.country}</strong></div><div><span>{t.phone}</span><strong>+213 549 26 03 83</strong></div><div><span>{t.email}</span><p>{t.emailMissing}</p></div></div><div className="contact-panel"><Icon name="chat" size={34}/><h2>{t.talk}</h2><WhatsApp locale={locale}/><p className="fineprint">{t.external}</p><Link href={href(locale,'support')} className="text-link">{t.nav[2]}<Icon/></Link></div></div></section>;
}
export function ProductDetail({ locale, product: p }: { locale: Locale; product: Product }) {
  const t = translations[locale], copy = p.translations[locale];
  return <section className="container page-section product-detail"><img src={p.image} alt={copy.name} width="600" height="450"/><div><span className="eyebrow">{t.reference} {p.sku}</span><h1 className="page-title">{copy.name}</h1><p>{copy.description}</p><p className="price">{new Intl.NumberFormat(locale + '-BE',{ style:'currency',currency:'EUR' }).format(p.priceEUR)}</p><p>{copy.taxDisclosure}</p><p>{copy.conditions} · {p.edition} · {p.territory} · {p.duration}</p><WhatsApp locale={locale} product={p}/><p className="fineprint">{t.external}</p><Link href={href(locale,'support')} className="text-link">{t.helpChoose}<Icon/></Link><aside className="assistance-panel"><h2>{t.included}</h2><p>{copy.assistance}</p><Link href={href(locale,'support')}>{t.problems} →</Link></aside>{(['compatibility','delivery','withdrawal','conformity'] as const).map(key => <div key={key}><h2>{t[key]}</h2><p>{copy[key]}</p></div>)}{p.manufacturer && <p>{p.model} · {p.manufacturer} · {p.euResponsiblePerson} · {p.safety}</p>}</div></section>;
}
