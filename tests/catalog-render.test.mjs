import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { localCatalog, parseCatalog } from '../scripts/catalog-schema.mjs';

const require = createRequire(import.meta.url);
const react = pathToFileURL(require.resolve('react')).href;
const jsx = pathToFileURL(require.resolve('react/jsx-runtime')).href;
function compile(path,replacements={}) {
  const source=readFileSync(new URL(path,import.meta.url),'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText
    .replace(/from "([^"]+)"/g,(match,name)=>`from "${name==='react/jsx-runtime'?jsx:name==='react'?react:replacements[name] || name}"`);
  return 'data:text/javascript;base64,'+Buffer.from(js).toString('base64');
}
const links=compile('../src/lib/links.ts');
const translations=compile('../src/lib/translations.ts');
const icon=compile('../src/components/icon.tsx');
const component=compile('../src/components/catalog-preview.tsx',{'@/lib/links':links,'@/lib/translations':translations,'./icon':icon,'../../scripts/catalog-schema.mjs':new URL('../scripts/catalog-schema.mjs',import.meta.url).href,'../../scripts/catalog-paypal.mjs':new URL('../scripts/catalog-paypal.mjs',import.meta.url).href});
const {CatalogPreview}=await import(component);
const source=JSON.parse(readFileSync(new URL('../content/products.json',import.meta.url),'utf8'));
const seed=()=>localCatalog(source);
const render=(value,locale='fr',paymentsEnabled=false)=>renderToStaticMarkup(React.createElement(CatalogPreview,{locale,products:value.products,categories:value.categories,paymentsEnabled}));

test('all sold-out groups render stock notices and disabled inquiry controls without WhatsApp purchase links',()=>{
  const s=seed(); const data=parseCatalog(s.productRows,s.categoryRows);
  const html=render(data);
  assert.ok(html.includes('Épuisé'));
  assert.equal((html.match(/class="button catalog-sold-out" disabled=""/g)||[]).length,3);
  assert.ok(!html.includes('https://wa.me/'));
  assert.ok(html.includes('/assets/catalog/zakinus-game-pass-ultimate.png'));
});
test('first available Game Pass variant is selected and its price and inquiry stay aligned',()=>{
  const s=seed(); s.productRows.find(r=>r[0]==='game-pass-6-mois')[11]='available';
  const html=render(parseCatalog(s.productRows,s.categoryRows),'nl');
  assert.match(html,/checked="" value="game-pass-6-mois"|value="game-pass-6-mois" checked=""/);
  assert.ok(html.includes('59,99'));
  assert.ok(html.includes('SKU%3A%20game-pass-6-mois'));
  assert.ok(html.includes('6%20maanden'));
});
test('new categories render from data and spreadsheet HTML is escaped as plain text',()=>{
  const s=seed(); s.categoryRows.push(['accessories','Accessoires','Accessoires',4]);
  s.productRows.push(['new-product','new-product','accessories','Nouveau','Nieuw','<img src=x onerror=alert(1)>','Beschrijving','','','',12.99,'available',true,'iptv',30]);
  const html=render(parseCatalog(s.productRows,s.categoryRows));
  assert.ok(html.includes('Accessoires'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('12,99'));
});
test('local preview keeps unconfirmed stock and working inquiry links',()=>{
  const html=render(seed());
  assert.ok(html.includes('Disponibilité à confirmer'));
  assert.ok(html.includes('https://wa.me/'));
  assert.ok(!html.includes('class="button catalog-sold-out"'));
});

test('every product variant has a protected PayPal link, matching price and WhatsApp message in both languages',()=>{
  for (const product of source) {
    const s=seed();
    s.productRows.find(r=>r[0]===product.sku)[11]='available';
    const data=parseCatalog(s.productRows,s.categoryRows);
    for (const locale of ['fr','nl']) {
      const html=render(data,locale,true);
      assert.ok(html.includes(`href="${product.paypalUrl}"`));
      assert.equal((html.match(/class="button paypal-button"/g)||[]).length,1);
      assert.ok(html.includes(product.priceEUR.toFixed(2).replace('.',',')));
      assert.ok(html.includes(encodeURIComponent(product.sku)));
      assert.ok(html.includes(encodeURIComponent(data.products.find(p=>p.sku===product.sku).translations[locale].variant)));
      assert.match(html,/class="button paypal-button"[^>]*target="_blank" rel="noopener noreferrer"/);
      assert.ok(html.includes('src="/assets/payments/paypal-mark.svg"'));
      assert.ok(html.includes(locale==='fr'?'Payer avec PayPal':'Betalen met PayPal'));
      assert.ok(html.includes('https://wa.me/'));
    }
  }
});

test('disabled payments, local stock, sold-out, missing or mismatched links never offer PayPal',()=>{
  const s=seed(); s.productRows.find(r=>r[0]==='iptv-1-an')[11]='available';
  const available=parseCatalog(s.productRows,s.categoryRows);
  assert.ok(!render(available).includes('paypal-button'));
  assert.ok(!render(seed(),'fr',true).includes('paypal-button'));
  const sold=seed();
  assert.ok(!render(parseCatalog(sold.productRows,sold.categoryRows),'fr',true).includes('paypal-button'));
  for(const patch of [{paypalUrl:null},{paypalUrl:'https://evil.example/pay'},{paypalPriceEUR:0}]) {
    const data=structuredClone(available);
    Object.assign(data.products.find(p=>p.sku==='iptv-1-an'),patch);
    const html=render(data,'fr',true);
    assert.ok(!html.includes('paypal-button'));
    assert.ok(html.includes('https://wa.me/'));
  }
  assert.ok(!render({products:[],categories:[]},'fr',true).includes('paypal-button'));
});

test('customer copy stays consistent without demo, unavailable-purchase or country references',async()=>{
  const {getTranslations}=await import(translations);
  for(const locale of ['fr','nl']) {
    const disabled=getTranslations(locale), enabled=getTranslations(locale,true);
    assert.deepEqual(enabled,disabled);
    assert.doesNotMatch(JSON.stringify(enabled),/algérie|algerije|algeria|aperçu|privé|voorbeel|vente non activée|verkoop niet geactiveerd|aucun achat n’est possible|aankopen zijn niet mogelijk/i);
    assert.ok(enabled.faqs[0][1].includes('PayPal'));
    assert.ok(enabled.draftNotice.includes('PayPal'));
  }
});
