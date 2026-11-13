import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateKeyPairSync } from 'node:crypto';
import { CATEGORY_HEADERS, PRODUCT_HEADERS, localCatalog, parseCatalog } from '../scripts/catalog-schema.mjs';
import { CatalogError, fetchGoogleCatalog, publicSnapshot, readCatalogConfig, safeCatalogError, SHEETS_SCOPE } from '../scripts/catalog-google.mjs';

const source = JSON.parse(readFileSync(new URL('../content/products.json',import.meta.url),'utf8'));
const seed = () => structuredClone(localCatalog(source));
const update = (rows,sku,field,value) => { const row=rows.find(r => r[0] === sku); row[PRODUCT_HEADERS.indexOf(field)] = value; };
const parse = s => parseCatalog(s.productRows,s.categoryRows);

test('template seeds eight variants with exact prices, translations, and conservative stock',()=>{
  const data=seed(), result=parse(data);
  assert.equal(result.products.length,8);
  assert.deepEqual(result.issues,[]);
  assert.deepEqual(result.products.map(p=>p.priceEUR).sort((a,b)=>a-b),source.map(p=>p.priceEUR).sort((a,b)=>a-b));
  assert.ok(result.products.every(p=>p.status==='pending_review' && p.availability==='sold_out'));
  assert.equal(result.products.find(p=>p.sku==='game-pass-2-mois').translations.nl.variant,'2 maanden');
  assert.ok(data.products.every(p=>p.availability==='unconfirmed'));
});
test('prices preserve cents and reject strings, negative, nonfinite, and extra precision',()=>{
  for(const value of ['24,99','24.99','',-1,NaN,Infinity,24.999]) {
    const s=seed(); update(s.productRows,'iptv-1-an','price_eur',value);
    assert.ok(!parse(s).products.some(p=>p.sku==='iptv-1-an'));
  }
  const s=seed(); update(s.productRows,'iptv-1-an','price_eur',0);
  assert.equal(parse(s).products.find(p=>p.sku==='iptv-1-an').priceEUR,0);
});
test('hidden and deleted rows disappear, including an intentionally empty catalog',()=>{
  const s=seed(); update(s.productRows,'iptv-1-an','visible',false);
  assert.ok(!parse(s).products.some(p=>p.sku==='iptv-1-an'));
  assert.equal(parseCatalog([PRODUCT_HEADERS],[CATEGORY_HEADERS]).products.length,0);
  assert.equal(parseCatalog([PRODUCT_HEADERS],s.categoryRows).products.length,0);
});
test('unknown images, categories, unsupported stock and missing language names are excluded',()=>{
  for(const [field,value] of [['image_key','https://bad.example/image.png'],['image_key','__proto__'],['category_id','missing'],['availability','approved'],['name_nl','']]) {
    const s=seed(); update(s.productRows,'iptv-1-an',field,value);
    assert.ok(!parse(s).products.some(p=>p.sku==='iptv-1-an'));
  }
});
test('new categories and grouped products work with ordering and approved artwork',()=>{
  const s=seed(); s.categoryRows.push(['accessories','Accessoires','Accessoires',0]);
  const base=['accessory-small','accessory','accessories','Accessoire','Accessoire','Une description','Een beschrijving','Petit','Klein','',19.99,'available',true,'iptv',0];
  s.productRows.push(base,[...base.map((v,i)=>i===0?'accessory-large':i===7?'Grand':i===8?'Groot':i===10?29.99:i===14?1:v)]);
  const result=parse(s);
  assert.equal(result.categories[0].id,'accessories');
  assert.equal(result.products[0].sku,'accessory-small');
  assert.equal(result.products.filter(p=>p.groupId==='accessory').length,2);
});
test('duplicate SKUs and conflicting group metadata exclude entire affected groups',()=>{
  const s=seed(); s.productRows.push([...s.productRows.find(p=>p[0]==='game-pass-2-mois')]);
  assert.ok(!parse(s).products.some(p=>p.groupId==='game-pass'));
  for(const field of ['name_fr','description_nl','category_id','image_key']) {
    const s=seed(); update(s.productRows,'game-pass-2-mois',field,field==='category_id'?'iptv':field==='image_key'?'iptv':'Changed');
    assert.ok(!parse(s).products.some(p=>p.groupId==='game-pass'));
  }
});
test('duplicate or missing variant labels reject ambiguous multi-variant groups',()=>{
  const s=seed(); update(s.productRows,'game-pass-85-jours','variant_nl','2 maanden');
  assert.ok(!parse(s).products.some(p=>p.groupId==='game-pass'));
});
test('missing or duplicate headers fail sync instead of erasing the prior snapshot',()=>{
  const s=seed(); s.productRows[0][0]='wrong';
  assert.throws(()=>parse(s),/invalid_headers/);
  assert.throws(()=>parseCatalog([],s.categoryRows),/missing_headers/);
});
test('only projected catalog data survives, never arbitrary approval or secret columns',()=>{
  const s=seed(); s.productRows[0].push('status','private_key');
  s.productRows.slice(1).forEach(r=>r.push('approved','DO-NOT-PUBLISH'));
  const value=JSON.stringify(parse(s));
  assert.ok(!value.includes('DO-NOT-PUBLISH'));
  assert.ok(parse(s).products.every(p=>p.status==='pending_review'));
});
test('credentials require all server settings and normalize escaped newlines',()=>{
  assert.throws(()=>readCatalogConfig({}),/missing_configuration/);
  const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
  const env={GOOGLE_SHEETS_ID:'test-sheet',GOOGLE_SERVICE_ACCOUNT_EMAIL:'catalog@test-project.iam.gserviceaccount.com',GOOGLE_PRIVATE_KEY:privateKey.replace(/\n/g,'\\n')};
  assert.equal(readCatalogConfig(env).key,privateKey.trim());
  assert.throws(()=>readCatalogConfig({...env,GOOGLE_PRIVATE_KEY:'secret invalid value'}),/invalid_private_key/);
  assert.throws(()=>readCatalogConfig({...env,GOOGLE_SHEETS_ID:'https://bad.example'}),/invalid_configuration/);
  assert.equal(SHEETS_SCOPE,'https://www.googleapis.com/auth/spreadsheets.readonly');
});
test('Google transport performs one read-only batch for both tabs and typed values',async()=>{
  const s=seed(); let calls=0;
  const result=await fetchGoogleCatalog({sheetId:'test-sheet'},{now:()=>1234,request:async opts=>{
    calls++; assert.equal(opts.method,'GET');
    const url=new URL(opts.url); assert.equal(url.origin,'https://sheets.googleapis.com');
    assert.deepEqual(url.searchParams.getAll('ranges'),['Products!A:Q','Categories!A:D']);
    assert.equal(url.searchParams.get('valueRenderOption'),'UNFORMATTED_VALUE');
    return {data:{valueRanges:[{values:s.productRows},{values:s.categoryRows}]}};
  }});
  assert.equal(calls,1); assert.equal(result.products.length,8); assert.equal(result.fetchedAt,1234);
});
test('access-denied and timeout errors are classified without credential or raw response leakage',async()=>{
  for(const [status,code] of [[401,'authentication_failed'],[403,'access_denied_or_api_disabled'],[404,'spreadsheet_not_found'],[429,'google_quota_exceeded']]) {
    await assert.rejects(fetchGoogleCatalog({sheetId:'test'},{request:async()=>{throw {response:{status,data:'secret'}};}}),e=>e instanceof CatalogError && e.message===code);
  }
  await assert.rejects(fetchGoogleCatalog({sheetId:'test'},{timeoutMs:5,request:()=>new Promise(()=>{})}),/google_timeout/);
  assert.equal(safeCatalogError(new Error('PRIVATE KEY HERE')),'google_connection_failed');
});
test('last good data survives a temporary failure but is never exposed past five minutes',()=>{
  const {products,categories}=parse(seed()); const value={products,categories,fetchedAt:1000};
  assert.equal(publicSnapshot(value,61000).status,'ready');
  assert.equal(publicSnapshot(value,300999).products.length,8);
  assert.deepEqual(publicSnapshot(value,301000).products,[]);
  assert.equal(publicSnapshot(value,301000).status,'unavailable');
  assert.equal(publicSnapshot(null,1000).status,'unavailable');
  assert.equal(publicSnapshot(value,999).status,'unavailable');
});
