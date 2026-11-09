import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL('../content/' + name,import.meta.url),'utf8'));
test('charm pricing stays a separate preview proposal and preserves seller prices', () => {
  const products=read('products.json'), proposal=read('preview-pricing.json');
  assert.equal(proposal.status,'proposal');
  assert.deepEqual(products.map(p=>p.priceEUR),[25,35,25,35,45,60,75,100]);
  for (const product of products) {
    const cents=Math.round(proposal.pricesEUR[product.sku]*100);
    assert.equal(cents,product.priceEUR*100-1);
    assert.equal(cents%100,99);
    assert.equal(product.status,'pending_review');
  }
});
