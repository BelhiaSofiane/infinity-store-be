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
  nl: {
    all: "Alles ontdekken",
    filter: "Catalogus filteren",
    variant: "Kies je variant",
    duration: "Kies je looptijd",
    available: "Beschikbaar",
    sold_out: "Uitverkocht",
    unconfirmed: "Beschikbaarheid te bevestigen",
    game: "Voor elke speler een eigen ritme.",
    pay: "Betalen met PayPal",
    checkout: "Rond je betaling af bij PayPal in een nieuw tabblad.",
  },
};

function Artwork({
  imageKey,
  featured,
}: {
  imageKey: string;
  featured: boolean;
}) {
  const image = IMAGE_LIBRARY[imageKey as keyof typeof IMAGE_LIBRARY];
  if (image.kind === "poster")
    return (
      <div
        className={
          featured
            ? "pass-art pass-poster-frame"
            : `catalog-media catalog-media-poster${imageKey === "iptv" ? " catalog-media-iptv-poster" : ""}`
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
  const featured =
    selected.groupId === "game-pass" && selected.imageKey === "game-pass";
  const category =
    categories.find((p) => p.id === selected.category)?.translations[locale] ||
    selected.category;
  const displayName =
    tr.name + (items.length === 1 && tr.variant ? ` — ${tr.variant}` : "");
  const inquiryName = tr.name + (tr.variant ? ` — ${tr.variant}` : "");
  return (
    <article
      className={featured ? "pass-feature" : "product-card draft-card"}
      aria-labelledby={`${name}-title`}
    >
      <Artwork imageKey={selected.imageKey} featured={featured} />
      <div className={featured ? "pass-content" : "catalog-card-content"}>
        <span className="product-family">{category}</span>
        <h3 id={`${name}-title`}>{displayName}</h3>
        {featured && !tr.description && (
          <p className="catalog-description">{c.game}</p>
        )}
        {tr.description && (
          <p className="catalog-description">{tr.description}</p>
        )}
        {items.length > 1 && (
          <fieldset className="duration-options">
            <legend>{featured ? c.duration : c.variant}</legend>
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
              {new Intl.NumberFormat(locale + "-BE", {
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
