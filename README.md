# Infinity Store — Next.js catalog preview

Built 9 November 2026. French (`/fr`) and Belgian Dutch (`/nl`), EUR. Next.js App Router, React, TypeScript, CSS. Optional external PayPal checkout links; no accounts, admin, payment tracking or database. Payments are disabled by default; see [PayPal setup](docs/PAYPAL.md).

## Run

Install Node.js 22 LTS or newer supported by the pinned Next.js version, then:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:3000. On this workstation a verified portable Node installation is available at `%LOCALAPPDATA%\InfinityStore\runtime\node-v22.23.4-win-x64`; add that directory to PATH if Node is not otherwise installed. Use `npm.cmd` if PowerShell blocks npm.ps1.

```powershell
npm test
npm run typecheck
npm run build
npm start
npm run readiness
npm run build:commercial
```

`build` compiles the private preview. `build:commercial` deliberately fails while site-wide mandatory data/reviews are missing. It does not certify legal compliance, authenticate evidence or deploy anything. Never use the ordinary preview build as a commercial approval. All current builds remain non-indexable regardless of readiness; enabling a reviewed production host, indexing, real canonicals, reciprocal hreflang, sitemap and approved policies is a separate implementation/review task. The catalog preview can be deployed without a username or password.

The local server binds to loopback. Hosted domains open without Basic authentication; no preview username or password is required. The proxy sets the document language for French and Dutch routes. `noindex` controls indexing and does not restrict access.

## Edit

- `content/business.json`: actual identity, contact and support commitments. `null` means unknown internally.
- `content/products.json`: eight client-supplied product/price records, pending review and visible in the private preview. Published-offer schema: `docs/CATALOG.md`.
- `content/policies.json`: versioned FR/NL policy content; unpublished until reviewed and site-ready.
- `src/lib/translations.ts`: all interface copy and preview explanations.
- `private/reviews.json`: private review references; imported only in `server-only` code. Real evidence belongs outside this checkout and any public repository.
- `scripts/validation.mjs`: site and per-SKU/per-locale eligibility checks.
- `src/app/globals.css`: responsive design, focus and reduced motion.

Do not add invented approvals, prices, hours, language availability or legal identities. Every published SKU requires evidence and reviewed translations; the five supported internal families do not create visible offers. Missing or ineligible direct product/category URLs return 404. Policy routes honestly explain pending publication in the private preview.

## Handover

See `docs/IMPLEMENTATION.md`, `docs/RESEARCH.md`, `docs/LAUNCH.md`, `docs/MEASUREMENT.md`, and the private editable operating templates under `private/`. Public web routes never serve these files. Commercial launch requirements are documented in `docs/LAUNCH.md`.

## Deploy the catalog preview

Import this repository into Vercel or Netlify as a Next.js project and use `npm run build`. Local-file catalog mode needs no Google credentials. Optional private Google Sheets catalog setup is documented in [docs/GOOGLE-SHEETS.md](docs/GOOGLE-SHEETS.md), with an import workbook in `docs/templates/infinity-store-catalog.xlsx`. Run `npm run catalog:check` before switching `CATALOG_SOURCE` to `google-sheets`. The website requests read-only access, refreshes its validated cache after 60 seconds on demand, and hides unavailable data after five minutes without a successful refresh. Any old `PREVIEW_USER` and `PREVIEW_PASSWORD` settings can be deleted; the application no longer reads them.
