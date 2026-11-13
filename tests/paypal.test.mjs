import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { localCatalog, parseCatalog, PRODUCT_HEADERS, REQUIRED_PRODUCT_HEADERS } from '../scripts/catalog-schema.mjs';
import { paypalUrl, euroCents, paypalCheckoutUrl } from '../scripts/catalog-paypal.mjs';

const source=JSON.parse(readFileSync(new URL('../content/products.json',import.meta.url),'utf8'));
const url='https://www.paypal.com/ncp/payment/W8ZSA7G82FUHQ';
test('hosted PayPal URL validation rejects credential, domain, path, port and encoding tricks',()=>{
  assert.equal(paypalUrl(` ${url} `),url);
  for (const invalid of [null,123,'http://www.paypal.com/ncp/payment/ID','https://paypal.com/ncp/payment/ID','https://www.paypal.com.evil.test/ncp/payment/ID','https://user@www.paypal.com/ncp/payment/ID','https://www.paypal.com:443/ncp/payment/ID','https://www.paypal.com/ncp/payment/../ID',url+'?amount=1',url+'#x',url+'/','javascript:alert(1)','https://www.paypal.com/ncp/payment/%49D',url+'\nother']) assert.equal(paypalUrl(invalid),null,String(invalid));
});
test('money comparison uses valid integer cents and preserves zero',()=>{
  assert.equal(euroCents(24.99),2499); assert.equal(euroCents(0),0);
  for(const v of [null,'24.99','',-1,NaN,Infinity,1.001,Number.MAX_SAFE_INTEGER]) assert.equal(euroCents(v),null);
  const item={paypalUrl:url,priceEUR:0,paypalPriceEUR:0,availability:'available'};
  assert.equal(paypalCheckoutUrl(item,true),url);
  for(const enabled of [false,undefined,'true']) assert.equal(paypalCheckoutUrl(item,enabled),null);
  for(const patch of [{paypalPriceEUR:null},{availability:'sold_out'},{availability:'unconfirmed'},{priceEUR:24.99},{paypalUrl:'https://evil.test'}]) assert.equal(paypalCheckoutUrl({...item,...patch},true),null);
});
test('legacy sheets without payment columns stay usable, and duplicate optional headers are rejected',()=>{
  const s=localCatalog(source);
  const legacy=s.productRows.map(row=>row.slice(0,REQUIRED_PRODUCT_HEADERS.length));
  const parsed=parseCatalog(legacy,s.categoryRows);
  assert.equal(parsed.products.length,8); assert.deepEqual(parsed.issues,[]);
  assert.ok(parsed.products.every(p=>p.paypalUrl===null&&p.paypalPriceEUR===null));
  s.productRows[0].push('paypal_url');
  assert.throws(()=>parseCatalog(s.productRows,s.categoryRows),/invalid_headers/);
});
test('invalid payment data warns without hiding the SKU or its group',()=>{
  for(const [field,value,code] of [['paypal_url','https://evil.test','invalid_paypal_url'],['paypal_price_eur','24.99','invalid_paypal_price'],['paypal_price_eur','','missing_paypal_price'],['paypal_url','','missing_paypal_url'],['paypal_price_eur',1,'paypal_price_mismatch']]) {
    const s=localCatalog(source), row=s.productRows.find(r=>r[0]==='game-pass-2-mois');
    row[PRODUCT_HEADERS.indexOf(field)]=value;
    const result=parseCatalog(s.productRows,s.categoryRows);
    assert.equal(result.products.length,8);
    assert.ok(result.issues.some(i=>i.code===code&&i.row===4));
    assert.equal(paypalCheckoutUrl(result.products.find(p=>p.sku==='game-pass-2-mois'),true),null);
  }
});
test('all eight supplied payment links map once to stable SKUs without changing day labels',()=>{
  assert.equal(source.length,8);
  assert.equal(new Set(source.map(p=>p.paypalUrl)).size,8);
  for(const p of source) { assert.equal(paypalUrl(p.paypalUrl),p.paypalUrl); assert.equal(p.paypalPriceEUR,p.priceEUR); }
  assert.equal(source.find(p=>p.sku==='iptv-1-an').paypalUrl,url);
  assert.equal(source.find(p=>p.sku==='game-pass-85-jours').paypalUrl,'https://www.paypal.com/ncp/payment/KNLXGGG6XMNSU');
  assert.equal(source.find(p=>p.sku==='game-pass-120-jours').paypalUrl,'https://www.paypal.com/ncp/payment/24FMJN2BM2H86');
});
