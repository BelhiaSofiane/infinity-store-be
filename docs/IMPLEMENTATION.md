# Implementation and verification — 9 November 2026

## Delivered

Next.js 16.4.5 App Router, React and TypeScript with server-rendered FR/NL content; original warm neutral/violet visual design and an original inline SVG infinity illustration. Local system fonts and no remote assets. Homepage, catalog empty state, contact, customer service, seven policy-status routes per locale and localized unavailable/404 states. Native FAQ disclosure controls, responsive mobile menu, Escape dismissal, skip link, visible focus, reduced motion and uncluttered mobile actions.

WhatsApp links use the supplied Algerian number and separately localized information/support/complaint messages. Each opens an external service without claiming a message was sent or purchase completed. No Meta embed, tracking, payments, checkout, accounts, fake ticketing, reviews, stock, prices or service promises. An alternative email is visibly awaiting confirmation; that is a launch blocker, not a functional alternative.

The five allowed families are supported by the internal schema only. No approved product exists, so no category promotions or fabricated product pages appear. Future eligible-product card/detail rendering is implemented but must be verified against real approved content. Private evidence references are imported only through a server-only boundary, and are not served from public routes. Current catalog has zero records.

Business, catalog, policy and support data are editable in centralized files. The evidence checks separate site-wide and SKU/locale blockers. Ordinary builds generate a private preview; commercial build executes the readiness gate first. Preview is loopback-bound; non-loopback Host values return 401 unless configured preview authentication succeeds. Security headers and noindex are present. Public commercial production, public SEO, working withdrawal submission and durable acknowledgements are deliberately not activated.

## Executed checks

Environment: Windows, Node 22.23.4 portable (official archive SHA-256 checked against vendor SHASUMS), Next.js 16.4.5, TypeScript. Tests dated 2026-11-09.

- `npm run build`: passed optimized build and Next.js TypeScript phase, including after fixes to document-language switching and Host validation.
- `npm run typecheck`: passed separately after final application edits.
- `npm test`: nine validation and WhatsApp tests passed. Negative evidence tests include expired/future/invalid reviews, approval-only records, missing translations, IPTV rights and physical operator fields. Message tests cover accents, punctuation, SKU/edition/term preservation and separate inquiry/support/complaint wording.
- `node scripts/check-preview.mjs`: passed 22 localized routes, 528 rendered link occurrences, 60 localized WhatsApp link occurrences, eight unavailable/private URL probes, correct initial HTML language, no Set-Cookie headers, robots/sitemap exclusions, security headers and 401 for an untrusted Host. This is HTTP/link validation, not an external WhatsApp service delivery test.
- `npm run build:commercial`: correctly failed at readiness before Next generation, with unresolved identity, contacts, operational, legal/tax/privacy and translation/policy review blockers. This expected failure verifies the release gate.
- In-app Chromium browser: viewed French desktop homepage at 1440 CSS pixels, Dutch homepage at 768, and Dutch support at 360; document scroll width stayed within viewport in observed measurements. Reviewed full-page desktop composition. Opened mobile menu, used its support link, switched to corresponding Dutch/French support routes, verified updated document language after client navigation, tested Escape dismissal, opened a Dutch FAQ using Enter, and observed the localized unavailable-product page. No captured error/warning logs on the checked Dutch homepage.

## Limits and outstanding validation

The private development preview is complete for the currently empty catalog. The full commercial brief remains incomplete and launch is blocked. The owner has supplied no legal identity, business email, approvals, prices, service commitments or operating evidence. Policies remain private drafting worksheets/status pages rather than approved legal terms. Human FR/NL legal/commercial translation review is pending.

No external WhatsApp messages, orders or payments were sent. Native Android/iOS WhatsApp and desktop handoff, external URL resolution, actual staffing/channel operation, email fallback, actual product/variant journeys and support guides remain untested. No withdrawal backend, email delivery or durable acknowledgement exists; applicability must be resolved and the mechanism built/tested if required.

Browser checks are focused smoke tests, not every-route interactive coverage or an assistive-technology audit. Exact zoom/reflow, screen readers, comprehensive measured contrast, Safari/Firefox, physical devices and field Web Vitals were not tested. No Lighthouse/Core Web Vitals score or conversion result is claimed. HTTP route traversal covers footer/internal links but not every interaction at every breakpoint.

Application source and HTTP headers show no added browser storage or optional trackers. No complete clean-profile network/storage audit was performed using developer tools, and hosting-layer logs are unknown. Consent accept/reject scenarios do not exist because no optional processing was added; reassess actual hosting and integrations before launch. No fabricated consent banner was created.

The current preview has no public domain, so canonicals, public hreflang, public sitemap entries and product structured data are omitted. These must be added to the reviewed production release once an actual domain and approved facts exist. Preview access configuration must be rechecked for the selected HTTPS host. Read RESEARCH.md for source access limitations, LAUNCH.md for required roles/actions, MEASUREMENT.md for proposed measurement and optimization, and private/ for editable workflow/service/policy materials.
