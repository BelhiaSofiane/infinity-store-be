# Catalog and evidence model

The client supplied eight references and EUR prices: Windows 11 Pro + Office activation bundle (€25), IPTV for one year (€35), and Game Pass for two months (€25), 85 days (€35), 120 days (€45), six months (€60), eight months (€75), and one year (€100). These are stored as `pending_review` in `content/products.json` and displayed as seller-supplied prices in the private preview, with French and Dutch names. The bundle price is for Windows + Office together. Office version, Game Pass edition, supplier, availability, license conditions, taxes, imagery rights and support scope have not been supplied. No approvals or stock have been inferred.

Draft records only contain supplied identifiers, names, durations and prices. `getDraftProducts` projects those fields into preview cards without product detail routes. `getProducts` retains the eligibility gate below for published offers; draft cards do not qualify a record for commercial publication.

Each `content/products.json` record must include:

| Field | Meaning |
| --- | --- |
| sku, slug | Stable identifier; lowercase hyphenated URL slug |
| category | windows, office, game-pass, iptv, android-boxes |
| status | draft, pending_review, approved, blocked |
| classification | Reviewed physical good/digital content/service/subscription/code/voucher/combination |
| edition, devices, compatibility, territory | Exact model/edition and material usage restrictions |
| licenseConditions, duration | License type, resale basis, redemption and renewal conditions where relevant |
| availability | Confirmed availability; no invented stock |
| priceEUR, taxDisclosure | Finite verified consumer total including applicable unavoidable charges |
| delivery, withdrawal, conformity | Verified fulfillment and applicable rights |
| supportScope | Confirmed included/paid assistance, duration, limitations and fees |
| image, imageRightsReference | Verified original/licensed local asset under /assets/; public rights attribution reference |
| reviewReference | Reference into private product review records |
| translations.fr / translations.nl | Each needs name, description, conditions, assistance, delivery, withdrawal, conformity, compatibility, taxDisclosure, reviewReference |

IPTV also needs rightsScope (Belgian content/distribution/device scope) and rightsExpiry. Android boxes additionally need manufacturer, euResponsiblePerson, safety, model, conformityReference, returnLogistics. Public manufacturer/responsible-person fields must include required contact details, not just a brand name. Category-specific legal classification remains a human review obligation; automated nonempty-field checks cannot validate its correctness.

Review entries: reference, status, reviewer, reviewDate (ISO date), evidenceReference (private document reference), scope, optional expiresAt (ISO date). Scope must identify the SKU/locale and reviewed questions. Approval without these is rejected, as are expired reviews. Store real contracts, keys, invoices and customer records outside source control. Private metadata never goes into client components or API endpoints.

For Windows/Office assess exact licensing terms and lawful distribution/resale basis, including qualified exhaustion review where relevant. Successful activation is insufficient. For Game Pass verify region, device/account eligibility, term and renewals; never use shared/stolen accounts or circumvention. For IPTV verify the complete chain of Belgian content rights and expiry. For physical goods review GPSR/sector-specific conformity, accessibility where applicable, radio/RoHS, WEEE, packaging/batteries where relevant, economic operator and logistics.

The published-product renderer and category navigation exist for future eligible records. Approved-data rendering, stock changes, advanced variants, real product assistance and translated category labels require validation with the actual approved catalog before release. Drafts do not receive published product or category routes.
