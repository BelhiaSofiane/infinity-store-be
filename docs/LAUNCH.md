# Launch readiness — 9 November 2026

Development preview implemented; final verification status is recorded in IMPLEMENTATION.md. Commercial launch BLOCKED. No public deployment or commercial activation performed. No reviewers or owner commitments have been invented.

## Consolidated missing inputs and release checklist

| Scope | Blocker / evidence or action needed | Suggested responsible role | Validation |
| --- | --- | --- | --- |
| Site | Actual legal name/form, registration, registered address, email, tax identity; accurate Algeria establishment | Owner + Algerian counsel | Review original registrations and complete business configuration |
| Site | Algerian registration, hosting/.com.dz, exports, banking/payment rules and any current amendments | Algerian legal/accounting adviser | Written applicability decision; architecture/payment review |
| Each SKU | Exact edition/model, supplier, lawful resale/content rights, classification, territories and expiry | Procurement + qualified rights reviewer | Evidence-linked dated scoped review, not activation success |
| Physical SKU | Manufacturer/EU operator, sector conformity, GPSR offer details, warnings/translations, instructions, WEEE/packaging/batteries applicability, recall process | Product compliance + logistics | Documents checked against exact model; visible offer inspected |
| Each SKU | Verified price, taxes, fees, VAT scheme, delivery origin/method/timing/availability, customs/import responsibility | Tax adviser + owner | Per-SKU written assessment and complete consumer total |
| Site + SKU | Actual payment, offer/acceptance sequence, contract formation and durable confirmations | Owner + Belgian counsel | Rehearse approved email/PDF process and records with synthetic data |
| Site | Withdrawal function applicability for website/WhatsApp; Belgian enacted law/commencement | Belgian counsel | Written decision referencing actual national law, not directive date alone |
| Site if required | Submission, confirmation, timestamp, persistence, durable-medium acknowledgement delivery and failure handling | Engineering + operations | End-to-end staging tests including delivery failure, retries, abuse controls and audit trail; absent today |
| Site + SKU | Returns address, physical return cost, lawful digital exceptions, subscription cancellation/renewal, conformity and refund procedures | Owner + counsel | Reviewed policies and real operational rehearsal; no blanket digital no-refund rule |
| Site | Business email alternative, support staffing/human languages, Europe/Brussels hours/closures, included/paid scope, duration, response target if any, escalation and follow-up | Support owner | Owner confirms capabilities; test all channels, log and complaint escalation |
| Site | Controller, hosting/processors/logs, purposes/bases, retention, rights, Algeria access/transfers, Article 27 assessment and incident process | Privacy specialist | Data map, agreements and approved notices; no invented appointments |
| Both locales | Complete dated policy drafts and consequential FR/NL copy review | Counsel + competent FR/NL reviewers | Reviewed references for every required policy and SKU translation |
| Site | Optional consent only if actual technologies require it | Privacy + engineering | Network/storage audit after all hosting/integrations; consent paths only if needed |
| Site | EAA/Belgian accessibility applicability, manual and assistive technology audit | Accessibility reviewer | 360/768/1440, keyboard, screen reader, zoom and contrast; field performance after release |
| Site | Approved domain, HTTPS hosting, access scope, preview security, approved public metadata and sitemap | Owner + engineering | Auth and Host handling, security headers, canonical/hreflang cross-check, no private evidence/assets |
| Each SKU/locale | Approved data renderer, variants and support guides tested against actual data | Engineering + product owner | Deep links, locale preservation, complete nearby conditions and WhatsApp SKU/variant messages |
| Release | Explicit authorization for public publication after these checks | Owner | Run readiness gate, review evidence, conduct release review; do not treat passing automation as certification |

`npm run readiness` reports site-wide blockers separately; SKU/locale blockers are printed separately when records exist. Ineligible products are omitted rather than forcing all families live. A cleared gate is only a completeness check. The current application intentionally retains private-preview access controls/noindex until an authorized production release is implemented.
