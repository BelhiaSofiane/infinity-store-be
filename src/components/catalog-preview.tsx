"use client";

import { useId, useState } from "react";
import type { CatalogCategory, CatalogItem } from "@/lib/catalog-types";
import { IMAGE_LIBRARY } from "../../scripts/catalog-schema.mjs";
import { paypalCheckoutUrl } from "../../scripts/catalog-paypal.mjs";
import { whatsapp, type Locale } from "@/lib/links";
import { getTranslations } from "@/lib/translations";
import { Icon } from "./icon";

const copy = {
  fr: {
    all: "Tout explorer",
    filter: "Filtrer le catalogue",
    variant: "Choisissez votre variante",
    duration: "Choisissez votre durée",
    available: "Disponible",
    sold_out: "Épuisé",
    unconfirmed: "Disponibilité à confirmer",
    game: "À chaque joueur, son rythme.",
    pay: "Payer avec PayPal",
    checkout: "Finalisez votre paiement sur PayPal dans un nouvel onglet.",
  },
  en: {
    "all": "Explore all",
    "filter": "Filter the catalogue",
    "variant": "Choose your variant",
    "duration": "Choose your duration",
    "available": "Available",
    "sold_out": "Sold out",
    "unconfirmed": "Availability to be confirmed",
    "game": "A duration for every player.",
    "pay": "Pay with PayPal",
    "checkout": "Complete your payment on PayPal in a new tab."
},
};

function Artwork({
  imageKey,
  imageUrl,
  label,
}: {
  imageKey: string;
  imageUrl?: string | null;
  label: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (imageUrl && failedUrl !== imageUrl) return <div className="catalog-media catalog-media-poster"><img src={imageUrl} alt={label} width={1254} height={1254} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedUrl(imageUrl)}/></div>;
  const image = IMAGE_LIBRARY[imageKey as keyof typeof IMAGE_LIBRARY];
  if (!image) return <div className="catalog-media catalog-image-placeholder" role="img" aria-label={label}><Icon name="grid" size={48}/><span>{label}</span></div>;
  if (image.kind === "poster")
    return (
      <div
        className={
          "catalog-media catalog-media-poster"
        }
      >
        <img
          className="pass-poster"
          src={image.src}
          alt={image.label}
          width={image.width}
          height={image.height}
          loading="lazy"
        />
      </div>
    );
  return (
    <div className="catalog-media catalog-media-iptv">
      <svg
        className="tv-art"
        viewBox="0 0 240 150"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="23"
          y="16"
          width="194"
          height="112"
          rx="9"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="33"
          y="26"
          width="174"
          height="92"
          rx="4"
          fill="currentColor"
          fillOpacity=".04"
        />
        <path d="m108 57 29 16-29 16V57Z" fill="currentColor" />
        <path
          d="M96 140h48m-24-12v12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function ProductGroup({
  items,
  categories,
  locale,
  paymentsEnabled,
}: {
  items: CatalogItem[];
  categories: CatalogCategory[];
  locale: Locale;
  paymentsEnabled: boolean;
}) {
  const [selectedSku, setSelectedSku] = useState<string>();
  const name = useId();
  const selectable = (p: CatalogItem) => p.availability !== "sold_out";
  const selected =
    items.find((p) => p.sku === selectedSku && selectable(p)) ||
    items.find(selectable) ||
    items[0];
  const tr = selected.translations[locale],
    c = copy[locale],
    t = getTranslations(locale, paymentsEnabled);
  const paymentUrl = paypalCheckoutUrl(selected, paymentsEnabled);
  const category =
    categories.find((p) => p.id === selected.category)?.translations[locale] ||
    selected.category;
  const displayName =
    tr.name + (items.length === 1 && tr.variant ? ` — ${tr.variant}` : "");
  const inquiryName = tr.name + (tr.variant ? ` — ${tr.variant}` : "");
  return (
    <article
      className="product-card draft-card catalog-item"
      aria-labelledby={`${name}-title`}
    >
      <Artwork imageKey={selected.imageKey} imageUrl={selected.imageUrl} label={selected.translations[locale].name} />
      <div className="catalog-card-content">
        <span className="product-family">{category}</span>
        <h3 id={`${name}-title`}>{displayName}</h3>
        {tr.description && (
          <details className="catalog-details">
            <summary>{locale === "fr" ? "Détails du produit" : "Product details"}</summary>
            <p className="catalog-description">{tr.description}</p>
          </details>
        )}
        {items.length > 1 && (
          <fieldset className="duration-options">
            <legend>{c.variant}</legend>
            {items.map((p) => (
              <label key={p.sku}>
                <input
                  type="radio"
                  name={name}
                  value={p.sku}
                  checked={p.sku === selected.sku}
                  disabled={p.availability === "sold_out"}
                  onChange={() => setSelectedSku(p.sku)}
                />
                <span>
                  {p.translations[locale].variant}
                  {p.availability === "sold_out" && (
                    <small> {c.sold_out}</small>
                  )}
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <span
          className={`catalog-stock stock-${selected.availability}`}
          aria-live="polite"
        >
          {c[selected.availability]}
        </span>
        <div className="product-purchase">
          <div aria-live="polite" aria-atomic="true">
            <strong className="draft-price">
              {new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-BE", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(selected.priceEUR)}
            </strong>
            <span className="fineprint">{t.clientPrice}</span>
          </div>
          <div className="catalog-actions">
          {paymentUrl && (
            <a className="button paypal-button" href={paymentUrl}
              target="_blank" rel="noopener noreferrer"
              aria-label={`${c.pay} : ${inquiryName}`}>
              <span className="paypal-button-mark"><img src="/assets/payments/paypal-mark.svg" alt="" width="22" height="22"/></span>
              {c.pay}<Icon name="external" size={17}/>
            </a>
          )}
          {selected.availability === "sold_out" ? (
            <button className="button catalog-sold-out" disabled>
              {c.sold_out}
            </button>
          ) : (
            <a
              className={paymentUrl ? "button catalog-question" : "button dark catalog-question"}
              href={whatsapp(locale, "inquiry", {
                name: inquiryName,
                sku: selected.sku,
                edition: selected.edition,
                duration: tr.variant || undefined,
              })}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.ask} : ${inquiryName}`}
            >
              {t.ask}
              <Icon name="external" size={17} />
            </a>
          )}
          </div>
        </div>
        {paymentUrl && <p className="fineprint paypal-explanation">{c.checkout}</p>}
      </div>
    </article>
  );
}

export function CatalogPreview({
  locale,
  products,
  categories,
  initialCategory,
  paymentsEnabled = false,
}: {
  locale: Locale;
  products: CatalogItem[];
  categories: CatalogCategory[];
  initialCategory?: string;
  paymentsEnabled?: boolean;
}) {
  const [filter, setFilter] = useState(initialCategory || "all");
  const visibleCategories = categories.filter((c) =>
    products.some((p) => p.category === c.id),
  );
  const category =
    filter === "all" || visibleCategories.some((c) => c.id === filter)
      ? filter
      : "all";
  const groups = new Map<string, CatalogItem[]>();
  for (const p of products)
    if (category === "all" || p.category === category)
      groups.set(p.groupId, [...(groups.get(p.groupId) || []), p]);
  const c = copy[locale];
  return (
    <div className="draft-catalog">
      <div className="catalog-filters" aria-label={c.filter}>
        <button
          type="button"
          aria-pressed={category === "all"}
          onClick={() => setFilter("all")}
        >
          {c.all}
        </button>
        {visibleCategories.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.translations[locale]}
          </button>
        ))}
      </div>
      <div className="preview-grid">
        {[...groups].map(([id, items]) => (
          <ProductGroup
            key={id}
            items={items}
            categories={categories}
            locale={locale}
            paymentsEnabled={paymentsEnabled}
          />
        ))}
      </div>
      <p className="draft-notice">
        <Icon name="help" size={17} />
        <span>{getTranslations(locale, paymentsEnabled).draftNotice}</span>
      </p>
    </div>
  );
}
