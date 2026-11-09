import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { categories, productBlockers, siteBlockers, reviewIsValid } from '../scripts/validation.mjs';
const read = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const review = { reference:'review-1', status:'approved', reviewer:'Test reviewer', reviewDate:'2026-01-01', evidenceReference:'private-test-evidence', scope:'test only', expiresAt:'2099-01-01' };
test('client prices are recorded while incomplete offers remain unpublished', () => {
  assert.equal(categories.length,5);
  const products = read('content/products.json');
  assert.equal(products.length,8);
  assert.deepEqual(products.map(p => p.priceEUR),[25,35,25,35,45,60,75,100]);
  assert.deepEqual(products.map(p => p.duration ?? null),[null,'1 an','2 mois','85 jours','120 jours','6 mois','8 mois','1 an']);
  assert.equal(new Set(products.map(p => p.slug)).size,8);
  for (const product of products) {
    assert.equal(product.status,'pending_review');
    for (const locale of ['fr','nl']) {
      assert.ok(product.translations[locale].name);
      assert.ok(productBlockers(product,[],locale).includes('not approved'));
      assert.ok(productBlockers(product,[],locale).includes('missing current evidence review'));
    }
  }
});
test('an approval flag alone never publishes a product', () => {
  const errors = productBlockers({ status:'approved', category:'windows' }, [], 'fr');
  assert.ok(errors.includes('missing current evidence review'));
  assert.ok(errors.includes('missing fr.name'));
  assert.ok(errors.includes('missing verified EUR total'));
});
test('missing seller information blocks commercial generation', () => {
  assert.ok(siteBlockers(read('content/business.json'),read('content/policies.json'),read('private/reviews.json')).length > 15);
});
test('expired, future, incomplete or invalid evidence is rejected', () => {
  const now = new Date('2026-11-09');
  assert.equal(reviewIsValid('review-1',[review],now),true);
  for (const patch of [{ expiresAt:'2026-01-01' },{ expiresAt:'nonsense' },{ reviewer:'' },{ evidenceReference:'' },{ reviewDate:'2098-01-01' },{ reviewDate:'invalid' },{ status:'pending_review' }]) {
    assert.equal(reviewIsValid('review-1',[{ ...review,...patch }],now),false);
  }
});
test('expired IPTV rights and missing physical safety information block publication', () => {
  assert.ok(productBlockers({ category:'iptv', status:'approved', rightsScope:'Belgium', rightsExpiry:'2020-01-01' },[review],'nl').some(e => e.includes('content rights')));
  assert.ok(productBlockers({ category:'android-boxes' },[review],'nl').includes('missing physical information euResponsiblePerson'));
});
test('private evidence is never imported by a client component', () => {
  const nav = readFileSync(new URL('../src/components/navigation.tsx',import.meta.url),'utf8');
  assert.ok(!nav.includes('lib/store'));
  assert.ok(!nav.includes('private/'));
});
