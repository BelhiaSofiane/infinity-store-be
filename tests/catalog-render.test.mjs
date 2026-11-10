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
const component=compile('../src/components/catalog-preview.tsx',{'@/lib/links':links,'@/lib/translations':translations,'./icon':icon,'../../scripts/catalog-schema.mjs':new URL('../scripts/catalog-schema.mjs',import.meta.url).href});
const {CatalogPreview}=await import(component);
const source=JSON.parse(readFileSync(new URL('../content/products.json',import.meta.url),'utf8'));
const seed=()=>localCatalog(source);
const render=(value,locale='fr')=>renderToStaticMarkup(React.createElement(CatalogPreview,{locale,products:value.products,categories:value.categories}));

test('all sold-out groups render stock notices and disabled inquiry controls without WhatsApp purchase links',()=>{
  const s=seed(); const data=parseCatalog(s.productRows,s.categoryRows);
  const html=render(data);
  assert.ok(html.includes('Épuisé'));
  assert.equal((html.match(/class="button catalog-sold-out" disabled=""/g)||[]).length,3);
  assert.ok(!html.includes('https://wa.me/'));
  assert.ok(html.includes('Gamepass%20post.png'));
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
