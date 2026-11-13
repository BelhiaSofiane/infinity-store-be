# Pre-generated PayPal payment links

Each SKU opens a separate PayPal-hosted checkout. Verify transactions in the seller's PayPal account and deliver manually. The website does not track payment status, create orders, reserve stock or deliver automatically. No PayPal API credentials are needed.

## Catalogue columns

Append these optional headers to **Products**, preserving the first 15 headers:

| Column | Header | Value |
| --- | --- | --- |
| P | `paypal_url` | A reusable fixed-price link exactly like `https://www.paypal.com/ncp/payment/ID` |
| Q | `paypal_price_eur` | Numeric EUR checkout amount, with at most two decimals |

Old sheets without these columns still work with WhatsApp only. Local-file mode stays inquiry-only. Invalid payment data produces row warnings without hiding the product; `catalog:check` reports linked-variant coverage.

The eight links were supplied by the owner. Their visible checkout totals were checked on 13 November 2026. The replacement IPTV link (`W8ZSA7G82FUHQ`) shows **EUR 34.99**, matching the catalogue; column Q records 34.99. All eight recorded amounts now match. Checkout titles currently say “tech support” rather than the catalogue product names; review those descriptions and confirm the receiving seller before enabling payments. No payment was submitted and the receiving account's identity was not independently verified.

As confirmed by the owner, the 3-month and 4-month links map to the existing 85-day and 120-day SKUs. Names, catalogue prices and stock states remain unchanged. New SKUs need their own links.

## Enable on Vercel

1. Keep `PAYPAL_LINKS_ENABLED=false` for the first deployment. False is the default; only the exact value `true` enables payments, and only with `CATALOG_SOURCE=google-sheets`.
2. Run `npm run catalog:check`. Review row warnings and the linked-variant count. An unrelated test SKU without a link stays inquiry-only.
3. Open all eight checkouts. Confirm the receiving seller, product, edition/duration, EUR currency and final total. Configure quantity and extra charges consistently with the displayed price. Correct PayPal and column Q as needed. Check 85-day and 120-day descriptions particularly carefully.
4. Mark only variants you actually supply `available`; leave other rows `sold_out`.
5. Set `PAYPAL_LINKS_ENABLED=true` for the intended Vercel environment and redeploy. Leave preview environments disabled unless deliberately testing. This setting does not modify commercial approval records.
6. Review French and Dutch pages: eligible variants show PayPal and WhatsApp. External checkout opens in a new tab; no embedded SDK or payment tracking is loaded.

Rollback: set `PAYPAL_LINKS_ENABLED=false` and redeploy. Verify the actual transaction, amount, currency and product in PayPal before delivery. A return visit or screenshot is not proof of payment.

## Update prices and stock

Mark the variant `sold_out`, allow the cache to refresh, update the PayPal checkout and both recorded prices, verify the checkout, then restore availability. Do not append an amount to the link. The website compares recorded prices in integer cents; it cannot detect changes made only in PayPal.

Sheet updates use the existing 60-second refresh and up-to-five-minute last-good snapshot. Old pages and shared links may remain usable. Disable links in PayPal when you must stop payments immediately. Spreadsheet edits do not update printed prices in the Game Pass poster.

## Diagnostics

| Warning | Fix |
| --- | --- |
| `invalid_paypal_url` | Use the exact HTTPS `www.paypal.com/ncp/payment/ID` form, without query, fragment, port or credentials |
| `invalid_paypal_price` | Enter a non-negative numeric EUR amount with at most two decimals |
| `missing_paypal_price` | Record the hosted amount in column Q |
| `missing_paypal_url` | Add the corresponding link in column P |
| `paypal_price_mismatch` | Reconcile the hosted checkout and both recorded prices |

Both fields may remain blank for inquiry-only products. Technical checks do not certify the seller or hosted price.
