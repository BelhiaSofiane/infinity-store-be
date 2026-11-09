'use client';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { type Locale, href, whatsapp } from '@/lib/links';
import { catalogCopy } from '@/lib/catalog-copy';
import { Icon } from './icon';

export type PreviewOffer = { sku: string; name: string; category: string; edition: string; duration: string; priceEUR: number };
const filters = ['all', 'software', 'gaming', 'streaming'] as const;
type Filter = typeof filters[number];
export function CatalogPreview({ locale, products }: { locale: Locale; products: PreviewOffer[] }) {
  const t = catalogCopy[locale], pathname = usePathname(), params = useSearchParams();
  const queryCategory = params.get('category');
  const queryPlan = params.get('plan');
  const [filter, setFilter] = useState<Filter>(filters.includes(queryCategory as Filter) ? queryCategory as Filter : 'all');
  const [selectedSku, setSelectedSku] = useState(queryPlan);
  const gaming = products.filter(p => p.category === 'game-pass');
  const selected = gaming.find(p => p.sku === selectedSku) || gaming[0];
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => { setAnnouncement(''); }, [locale]);
  useEffect(() => {
    setFilter(filters.includes(queryCategory as Filter) ? queryCategory as Filter : 'all');
    setSelectedSku(queryPlan);
  }, [queryCategory, queryPlan]);
  function update(values: Record<string,string>) {
    if (values.category) setFilter(values.category as Filter);
    if (values.plan) setSelectedSku(values.plan);
    const next = new URLSearchParams(window.location.search);
    for (const [key,value] of Object.entries(values)) key === 'category' && value === 'all' ? next.delete(key) : next.set(key,value);
    // Native history integrates with Next's search params without a server round trip.
    window.history.replaceState(null, '', pathname + (next.size ? '?' + next.toString() : ''));
  }
  function term(p: PreviewOffer) { return t.labels[p.duration as keyof typeof t.labels] || p.duration; }
  function price(p: PreviewOffer) { return new Intl.NumberFormat(locale+'-BE',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(p.priceEUR); }
  function inquiry(p: PreviewOffer) {
    return whatsapp(locale,'inquiry',{name:p.name,sku:p.sku,edition:p.edition,duration:term(p)}) ;
  }
  const software = products.find(p => p.category === 'windows');
  const streaming = products.find(p => p.category === 'iptv');
  const count = Number(Boolean(software) && (filter === 'all' || filter === 'software')) + Number(Boolean(streaming) && (filter === 'all' || filter === 'streaming')) + Number(Boolean(selected) && (filter === 'all' || filter === 'gaming'));
  function Inquiry({ product }: { product: PreviewOffer }) {
    return <><div className="offer-price"><strong>{price(product)}</strong><span>{t.proposed}</span></div><a className="button whatsapp-button" href={inquiry(product)} target="_blank" rel="noopener noreferrer"><Icon name="chat"/>{t.ask}<Icon name="external" size={16}/></a><p className="offer-fineprint">{t.external}</p><Link className="offer-help" href={href(locale,'support')}><Icon name="help" size={16}/>{t.help}</Link></>;
  }
  function Points({ points }: { points: string[] }) {
    return <div className="offer-points"><h3>{t.included}</h3><ul>{points.map(point=><li key={point}><Icon name="check" size={16}/>{point}</li>)}</ul></div>;
  }
  return <div className="stitch-catalog">
    <div className="catalog-filters" role="group" aria-label={locale === 'fr' ? 'Filtrer les références' : 'Referenties filteren'}>{filters.map((value,i)=><button key={value} type="button" aria-pressed={filter===value} className={filter===value?'active':''} onClick={()=>{ update({category:value}); setAnnouncement(t.filters[i]); }}>{t.filters[i]}</button>)}<span className="catalog-count">{count} {t.result}</span></div>
    <p className="draft-notice"><Icon name="shield" size={20}/>{t.notice}</p>
    <span className="sr-only" role="status">{announcement}</span>
    <div className="showcase-list">
      {software && (filter==='all'||filter==='software') && <article className="offer-panel" data-category="software"><div className="offer-visual software-visual"><div className="software-picture"><img src="/assets/catalog/windows-11.jpg" alt="Windows 11" width="1000" height="563"/><div className="software-box"><span>MICROSOFT</span><strong>Windows<br/><b>11 Pro</b></strong><span>+ OFFICE</span></div><div className="office-mark"><img src="/assets/catalog/office-logo.jpg" alt="Microsoft Office" width="768" height="331"/></div></div><p><Icon name="grid" size={15}/>{t.illustration}</p></div><div className="offer-content"><div className="offer-badges"><span>WINDOWS & OFFICE</span><span className="pending-badge">{t.pending}</span></div><h2>{t.softwareName}</h2><p className="offer-description">{t.softwareIntro}</p><Points points={t.softwareFeatures}/><Inquiry product={software}/></div></article>}
      {streaming && (filter==='all'||filter==='streaming') && <article className="offer-panel reverse" data-category="streaming"><div className="offer-visual streaming-visual"><div className="living-room"><div className="room-wall"/><div className="television"><div className="tv-display"><span>INFINITY / STREAMING</span><div className="tv-tiles"><i/><i/><i/><i/></div><strong>{locale === 'fr' ? 'Vos envies.' : 'Jouw moment.'}<br/>{locale === 'fr' ? 'Votre écran.' : 'Jouw scherm.'}</strong></div></div><div className="tv-console"/><div className="streaming-box"/><div className="plant"><i/><i/><i/></div><span className="visual-duration">{term(streaming)}</span></div><p><Icon name="grid" size={15}/>{t.illustration}</p></div><div className="offer-content"><div className="offer-badges"><span>{term(streaming)}</span><span className="pending-badge">{t.pending}</span></div><h2>{t.streamingName}</h2><p className="offer-description">{t.streamingIntro}</p><Points points={t.streamingFeatures}/><Inquiry product={streaming}/></div></article>}
      {selected && (filter==='all'||filter==='gaming') && <article className="offer-panel gaming-panel" data-category="gaming" id="game-pass"><div className="offer-visual"><div className="game-pass-upload"><img src="/assets/catalog/game-pass-promo.png" alt="Xbox Game Pass — Essential, Premium, Ultimate, PC Game Pass" width="2560" height="2560" loading="lazy"/></div><p className="visual-caption">{locale === 'fr' ? 'Visuel fourni · formule et avantages à confirmer' : 'Aangeleverd beeld · formule en voordelen te bevestigen'}</p><Points points={t.gamingFeatures}/></div><div className="offer-content"><div className="offer-badges"><span>GAMING</span><span className="pending-badge">{t.pending}</span></div><h2>{t.gamingName}</h2><p className="offer-description">{t.gamingIntro}</p><fieldset className="duration-picker"><legend>{t.choose}</legend><div className="duration-grid">{gaming.map(p=><label key={p.sku} className={selected.sku===p.sku?'duration-option selected':'duration-option'}><input type="radio" name="duration" value={p.sku} checked={selected.sku===p.sku} onChange={()=>update({plan:p.sku})}/><span>{term(p)}</span><strong>{price(p)}</strong>{selected.sku===p.sku&&<Icon name="check" size={17}/>}</label>)}</div></fieldset><div className="selected-summary" aria-live="polite"><div><span>{t.selected}</span><strong>Game Pass · {term(selected)}</strong></div><b>{price(selected)}</b></div><p className="offer-fineprint">{t.proposed} · {t.details}</p><a className="button whatsapp-button" href={inquiry(selected)} target="_blank" rel="noopener noreferrer"><Icon name="chat"/>{t.ask}<Icon name="external" size={16}/></a><p className="offer-fineprint">{t.external}</p><Link className="offer-help" href={href(locale,'support')}><Icon name="help" size={16}/>{t.help}</Link></div></article>}
    </div>
    {selected && (filter==='all'||filter==='gaming') && <section className="plan-comparison"><header><span className="eyebrow">{t.tableEyebrow}</span><h2>{t.tableTitle}</h2><p>{t.tableIntro}</p></header><div className="table-scroll"><table><caption className="sr-only">{t.tableTitle} — {t.proposed}</caption><thead><tr><th scope="col">{t.term}</th><th scope="col">{t.price}</th><th scope="col">{t.status}</th><th scope="col"><span className="sr-only">{t.action}</span></th></tr></thead><tbody>{gaming.map(p=><tr key={p.sku} className={p.sku===selected.sku?'chosen-row':''}><th scope="row"><Icon name="grid" size={16}/>{term(p)}</th><td><strong>{price(p)}</strong></td><td><span className="table-status">{t.pending}</span></td><td><button type="button" className="table-select" onClick={()=>{update({plan:p.sku}); document.getElementById('game-pass')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}} aria-label={t.action+' '+term(p)}>{p.sku===selected.sku?t.selected:t.action}<Icon name="arrow" size={16}/></button></td></tr>)}</tbody></table></div></section>}
  </div>;
}
