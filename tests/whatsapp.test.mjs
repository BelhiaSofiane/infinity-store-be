import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/links.ts',import.meta.url),'utf8');
const js = ts.transpileModule(source,{ compilerOptions:{ module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022 } }).outputText;
const { whatsapp,href } = await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('French and Dutch inquiry/support/complaint messages are separate and safely encoded', () => {
  for (const locale of ['fr','nl']) {
    const urls = ['inquiry','support','complaint'].map(type => whatsapp(locale,type));
    assert.equal(new Set(urls).size,3);
    for (const value of urls) {
      const url = new URL(value);
      assert.equal(url.origin+url.pathname,'https://wa.me/213549260383');
      assert.equal(url.searchParams.size,1);
      assert.ok(!value.includes(' '));
    }
  }
});
test('product inquiry preserves accented names, punctuation, SKU, edition and selected duration', () => {
  const item = { name:'Édition « étude & création »', sku:'TEST-ONLY', edition:'Variante A/B', duration:'12 mois' };
  const message = new URL(whatsapp('fr','inquiry',item)).searchParams.get('text');
  for (const value of Object.values(item)) assert.ok(message.includes(value));
  assert.ok(!message.includes('localhost'));
});
test('language switch addresses corresponding localized pages and preserves product slugs', () => {
  assert.equal(href('fr','support'),'/fr/assistance');
  assert.equal(href('nl','support'),'/nl/klantendienst');
  assert.equal(href('nl','catalog','test-sku'),'/nl/producten/test-sku');
});
