# Set up the Google Sheets catalog

The website integration is ready. Until you finish these steps, it uses the existing local catalog. You do not need to share a private key in chat.

## 1. Import your catalog workbook

1. Upload `infinity-store-catalog.xlsx` to your Google Drive. A copy is included in `docs/templates` in the repository and supplied with this guide.
2. Open it with Google Sheets. Choose **File > Save as Google Sheets** if it is still an Excel file.
3. Keep the tab names **Products**, **Categories**, and **Guide**. Keep the headers on row 1.
4. In **Products**, select **M2:M501**. Remove the imported TRUE/FALSE dropdown rule from this range using **Data > Data validation**, then choose **Insert > Checkbox**. Existing TRUE values should remain checked. Verify a checked row returns TRUE before connecting the website.
5. Confirm the eight current prices and product names. Every starter variant is marked `sold_out`. Change only the variants you actually supply to `available`.
6. Open **Share** and keep **General access > Restricted**. Do not publish the spreadsheet to the web.
7. Copy the spreadsheet ID from its address: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.

Only catalog data belongs in this spreadsheet. Keep customer records, account passwords, supplier costs and license keys elsewhere. Google grants access to the entire spreadsheet, not just one tab.

## 2. Create Google's read-only account

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project named **Infinity Store Catalog**.
3. Go to **APIs & Services > Library**. Find **Google Sheets API** and enable it.
4. Go to **IAM & Admin > Service Accounts > Create service account**.
5. Name it **Infinity Catalog Reader**, with ID `infinity-catalog-reader`.
6. Skip optional project roles and user-access assignments. The account does not need Cloud project-wide Viewer, Editor or Owner roles.
7. Open the new account's **Keys** tab. Choose **Add key > Create new key > JSON**.
8. Keep the downloaded JSON outside the repository, shared drives and chat. If your organization blocks key creation, stop here rather than making the spreadsheet public.
9. Copy the account's email from its `client_email` field.
10. In the Google spreadsheet, choose **Share**, add that email, and give it **Viewer** access.

The application requests only `https://www.googleapis.com/auth/spreadsheets.readonly`. Viewer access also prevents edits if a credential were accidentally used with a broader scope. Share no other spreadsheets with this dedicated account.

References: [Google credential setup](https://developers.google.com/workspace/guides/create-credentials), [Sheets access scopes](https://developers.google.com/workspace/sheets/api/scopes).

## 3. Check the connection locally

Create `.env.local` in the repository folder. This file is ignored by Git. Start with:

```dotenv
CATALOG_SOURCE=local
PAYPAL_LINKS_ENABLED=false
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=the_client_email_from_your_json
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Use the complete `private_key` value from your JSON file, not the example above. Literal `\n` escapes and real newlines are supported. Do not prefix any name with `NEXT_PUBLIC_`.

Run:

```powershell
npm run catalog:check
```

The command reads the spreadsheet even while `CATALOG_SOURCE=local`. It prints visible-variant and category counts, plus row numbers for validation problems. It never prints credentials or raw spreadsheet contents.

Resolve all reported issues. Then change `CATALOG_SOURCE=google-sheets`, restart the development server, and review both language versions. No extra Google API endpoint is exposed to visitors.

## 4. Configure Vercel

1. Open your Vercel project's **Settings > Environment Variables**.
2. Add `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY` for **Production**.
3. For the private key, paste only the JSON field's value, without the surrounding JSON quotation marks. Use Vercel's sensitive-value setting. Preserve the key's newlines or literal `\n` escapes.
4. Add `CATALOG_SOURCE=google-sheets` for Production only after the local connection check succeeds.
5. Do not make these credentials available to untrusted pull-request preview deployments. Preview environments without configuration should stay on `CATALOG_SOURCE=local`.
6. Redeploy once to load the new settings. Changing environment variables requires redeployment. Editing catalog cells afterward does not.

If a key is exposed, revoke it in Google Cloud and replace it in local/Vercel settings, then redeploy. Do not commit the JSON file or `.env.local`.

## 5. Edit the catalog

### Products

| Column | What to enter |
|---|---|
| `sku` | Unique lowercase-hyphen identifier for one variant. Keep it stable. |
| `group_id` | Shared identifier for variants shown on one card. |
| `category_id` | An ID already listed on Categories. |
| `name_fr`, `name_nl` | Base product name in each language, such as Game Pass. |
| `description_fr`, `description_nl` | Optional plain-text descriptions. |
| `variant_fr`, `variant_nl` | Variant label, such as `2 mois` and `2 maanden`. Required and unique in each language when a group has multiple variants. |
| `edition` | Optional edition information included in the WhatsApp inquiry. |
| `price_eur` | A numeric, non-negative EUR price with at most two decimals. Use your Sheets locale's decimal separator. |
| `availability` | `available` or `sold_out`. Update manually after sales. |
| `visible` | Checked/TRUE to show the row; unchecked/FALSE or blank to hide it. |
| `image_key` | An approved image key from the table below. |
| `sort_order` | A number; smaller values appear first. |
| `paypal_url` | Optional column P: the SKU's pre-generated `https://www.paypal.com/ncp/payment/ID` link. |
| `paypal_price_eur` | Optional column Q: numeric EUR checkout amount. Must match `price_eur` before PayPal is offered. |

The website displays the exact price with two decimal places. For the `.99` effect, enter `24.99` (or `24,99` in a comma-decimal locale) as a number. It does not repeatedly subtract a cent.

See [PayPal setup and rollout](PAYPAL.md) before enabling payments. Sheets without the optional PayPal columns remain compatible. Links are disabled by default, and PayPal prices do not automatically follow sheet edits.

Rows sharing a `group_id` must use the same category, image, base names and descriptions in both languages. Each row keeps its own SKU, edition, variant, price and availability. The lowest variant sort order determines the group's position.

### Categories

Add `category_id`, `name_fr`, `name_nl`, and `sort_order`. IDs use lowercase letters, numbers and single hyphens. New categories appear automatically when they contain a visible, valid product.

For example, add category `accessories` with labels `Accessoires` / `Accessoires`, then use `accessories` in a new product row. Add the category before the product.

### Approved image library

| `image_key` | Artwork |
|---|---|
| `game-pass` | Supplied square Xbox Game Pass subscriptions poster, including all six prices and durations |
| `windows-office` | Existing Windows 11 + Office artwork |
| `iptv` | Supplied square IPTV subscription poster, shown in full without cropping |

The optional `image_preview` column R is for viewing artwork in the spreadsheet only. The IPTV row and all six Game Pass rows contain permanent Drive image preview chips in the live sheet; the import workbook embeds thumbnails. The website uses `image_key=iptv` or `image_key=game-pass` and its local image library; it does not load spreadsheet preview links.

New images must be added to the website's local library first. Ask for the artwork to be added, then use its new image key. External image URLs, Drive links and arbitrary filenames are not accepted. The special `game-pass` group with the `game-pass` image retains its featured layout; other groups use reusable cards and selectors.

The supplied poster contains printed prices. Editing a cell does not edit those pixels: replace that poster if its printed prices no longer match the sheet.

The workbook supplies dropdowns through row 501 and a category range through row 101. Extend those validation ranges when growing beyond them. The website reads all rows in the required columns, not just the starter eight.

## 6. Verify updates and availability

1. Change one price, wait about 60 seconds, and reload the catalog.
2. The first visit after the cache expires can trigger a background refresh while showing the previous snapshot. Reload again after a few seconds if necessary.
3. Mark a variant `sold_out`. Its selection is disabled and it cannot open a product inquiry. If every variant is sold out, the card stays visible with a disabled inquiry button.
4. Uncheck a row or delete it and confirm it disappears after a successful refresh.
5. Add a test category and a hidden test product. Check both language versions before making it visible.

Availability changes are manual. Opening WhatsApp or PayPal does not reserve or subtract website stock. Spreadsheet edits do not activate payments by themselves: `PAYPAL_LINKS_ENABLED=true` is also required. They do not activate product detail publication, indexing, or commercial approval.

## Connection problems

| Check result | Fix |
|---|---|
| `missing_configuration` | Add all three Google settings. |
| `invalid_configuration` | Enter the spreadsheet ID, not its full URL, and the service-account email. |
| `invalid_private_key` | Copy the full RSA private key value and check its newline structure. |
| `authentication_failed` | Check whether the key was revoked or copied incorrectly. |
| `access_denied_or_api_disabled` | Enable the Sheets API and share the spreadsheet with the service account as Viewer. |
| `spreadsheet_not_found` | Check the spreadsheet ID and sharing. |
| `invalid_sheet_headers` | Restore the required header names on row 1 of Products and Categories. |
| `google_timeout` / `google_connection_failed` | Retry later; inspect the Vercel connection logs if persistent. |
| `google_quota_exceeded` | Retry after the quota resets. Ensure catalog reads are cached. |
| A row warning | Correct the indicated row. Duplicate identifiers or conflicting group fields can exclude the entire group. |

During a temporary failure, the website may reuse the last successful snapshot for up to five minutes. After that, or if no snapshot has succeeded, it shows a catalog-unavailable message and the general contact link. It never silently restores local prices in Google mode.

To roll back deliberately, set `CATALOG_SOURCE=local` and redeploy. The local catalog remains available but reflects only the repository's data, with availability shown as unconfirmed.
