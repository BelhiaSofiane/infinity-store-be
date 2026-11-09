import { readFileSync } from 'node:fs';
import { siteBlockers, productBlockers } from './validation.mjs';
const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const business = read('content/business.json'), policies = read('content/policies.json'), reviews = read('private/reviews.json'), products = read('content/products.json');
const site = siteBlockers(business, policies, reviews);
console.log('COMMERCIAL READINESS — ' + new Date().toISOString());
console.log('Site-wide blockers:\n' + site.map(x => '  - ' + x).join('\n'));
let approved = 0;
for (const p of products) for (const locale of ['fr','nl']) {
  const errors = productBlockers(p, reviews.productReviews, locale);
  console.log(`${p.sku}/${locale}: ${errors.length ? errors.join('; ') : 'eligible'}`);
  if (!errors.length) approved++;
}
if (!approved) console.log('Catalog: no publishable product/locale combinations.');
process.exitCode = site.length ? 1 : 0;
