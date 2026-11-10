"use client";

import { useId, useState } from "react";
import type { DraftProduct } from "@/lib/store";
import { whatsapp, type Locale } from "@/lib/links";
import { translations } from "@/lib/translations";
import { Icon } from "./icon";

export function CatalogPreview({
  locale,
  products,
  initialCategory,
}: {
  locale: Locale;
  products: DraftProduct[];
  initialCategory?: string;
}) {
  const [category, setCategory] = useState(initialCategory || "all");
  const passes = products.filter((p) => p.category === "game-pass");
  const [selectedSku, setSelectedSku] = useState(passes[0]?.sku);
  const radioName = useId();
  const selected = passes.find((p) => p.sku === selectedSku) || passes[0];
  const t = translations[locale];
  const labels =
    locale === "fr"
      ? {
          all: "Tout explorer",
          windows: "Logiciels",
          "game-pass": "Gaming",
          iptv: "Divertissement",
          duration: "Choisissez votre durée",
          game: "À chaque joueur, son rythme.",
        }
      : {
          all: "Alles ontdekken",
          windows: "Software",
          "game-pass": "Gaming",
          iptv: "Entertainment",
          duration: "Kies je looptijd",
          game: "Voor elke speler een eigen ritme.",
        };
  const price = (p: DraftProduct) =>
    new Intl.NumberFormat(locale + "-BE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(p.priceEUR);
  const name = (p: DraftProduct) =>
    p.translations[locale].name.replace(" ? ", " — ");
  const inquiry = (p: DraftProduct) =>
    whatsapp(locale, "inquiry", {
      name: name(p),
      sku: p.sku,
      edition: p.edition,
      duration: name(p).split(" — ")[1] || p.duration,
    });
  const visible = (key: string) => category === "all" || category === key;
  return (
    <div className="draft-catalog">
      <div
        className="catalog-filters"
        aria-label={
          locale === "fr" ? "Filtrer le catalogue" : "Catalogus filteren"
        }
      >
        {(["all", "game-pass", "windows", "iptv"] as const)
          .filter(
            (key) => key === "all" || products.some((p) => p.category === key),
          )
          .map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
            >
              {labels[key]}
            </button>
          ))}
      </div>
      <div className="preview-grid">
        {selected && visible("game-pass") && (
          <article
            className="pass-feature"
            aria-labelledby={`${radioName}-title`}
          >
            <div className="pass-art pass-poster-frame">
              <img
                className="pass-poster"
                src="/assets/catalog/Gamepass%20post.png"
                alt="Xbox Game Pass"
                width="896"
                height="1200"
                loading="lazy"
              />
            </div>
            <div className="pass-content">
              <span className="product-family">Game Pass</span>
              <h3 id={`${radioName}-title`}>{labels.game}</h3>
              <fieldset className="duration-options">
                <legend>{labels.duration}</legend>
                {passes.map((p) => (
                  <label key={p.sku}>
                    <input
                      type="radio"
                      name={radioName}
                      value={p.sku}
                      checked={p.sku === selected.sku}
                      onChange={() => setSelectedSku(p.sku)}
                    />
                    <span>{name(p).split(" — ")[1] || name(p)}</span>
                  </label>
                ))}
              </fieldset>
              <div className="product-purchase">
                <div aria-live="polite" aria-atomic="true">
                  <strong className="draft-price">{price(selected)}</strong>
                  <span className="fineprint">{t.clientPrice}</span>
                </div>
                <a
                  className="button dark"
                  href={inquiry(selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.ask}
                  <Icon name="external" size={17} />
                </a>
              </div>
            </div>
          </article>
        )}
        {products
          .filter((p) => p.category !== "game-pass" && visible(p.category))
          .map((p) => (
            <article
              className={`product-card draft-card card-${p.category}`}
              key={p.sku}
            >
              <div className={`catalog-media catalog-media-${p.category}`}>
                {p.category === "windows" ? (
                  <>
                    <img
                      className="windows-art"
                      src="/assets/catalog/windows-11.jpg"
                      alt="Windows 11"
                      width="1000"
                      height="563"
                      loading="lazy"
                    />
                    <div className="office-strip">
                      <span>+</span>
                      <img
                        src="/assets/catalog/office-logo.jpg"
                        alt="Microsoft Office"
                        width="768"
                        height="331"
                        loading="lazy"
                      />
                    </div>
                  </>
                ) : (
                  <>
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
                    <span className="media-duration">
                      {locale === "fr" ? "1 an" : "1 jaar"}
                    </span>
                  </>
                )}
              </div>
              <span className="product-family">
                {p.category === "windows" ? labels.windows : labels.iptv}
              </span>
              <h3>{name(p)}</h3>
              <div className="product-purchase">
                <div>
                  <strong className="draft-price">{price(p)}</strong>
                  <span className="fineprint">{t.clientPrice}</span>
                </div>
                <a
                  className="round-link"
                  href={inquiry(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.ask} : ${name(p)}`}
                >
                  <Icon name="external" />
                </a>
              </div>
            </article>
          ))}
      </div>
      <p className="draft-notice">
        <Icon name="help" size={17} />
        <span>{t.draftNotice}</span>
      </p>
    </div>
  );
}
