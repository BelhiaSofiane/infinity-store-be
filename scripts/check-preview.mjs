import assert from 'node:assert/strict';
import http from 'node:http';
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:3000';
const seen = new Set(), pending = ['/fr','/nl'];
let links = 0, whatsappLinks = 0;
while (pending.length) {
  const path = pending.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const response = await fetch(origin + path);
  assert.equal(response.status,200,path);
  assert.match(response.headers.get('x-robots-tag'),/noindex/);
  assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.equal(response.headers.get('set-cookie'),null);
  const html = await response.text();
  assert.ok(html.includes(`lang="${path.startsWith('/nl') ? 'nl-BE' : 'fr-BE'}"`),path + ' document language');
  assert.ok(!html.includes('private-test-evidence'));
  for (const [,raw] of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    links++;
    const url = new URL(raw.replaceAll('&amp;','&'),origin);
    if (url.origin === origin && !url.hash && !seen.has(url.pathname)) pending.push(url.pathname);
    if (url.hostname === 'wa.me') {
      whatsappLinks++;
      assert.equal(url.pathname,'/447391276335');
      assert.ok(url.searchParams.get('text').startsWith(path.startsWith('/nl') ? 'Hallo Infinity Store' : 'Bonjour Infinity Store'));
      assert.ok(!url.searchParams.get('text').includes('undefined'));
    }
  }
}
for (const path of ['/fr/produits/unapproved-sku','/nl/producten/unapproved-sku','/fr/produits/categorie/iptv','/nl/producten/categorie/windows','/de','/fr/invalid','/private/reviews.json','/content/products.json']) {
  assert.equal((await fetch(origin+path)).status,404,path);
}
assert.match(await (await fetch(origin+'/robots.txt')).text(),/Disallow: \//);
assert.ok(!(await (await fetch(origin+'/sitemap.xml')).text()).includes('<url>'));
const accessStatus = await new Promise((resolve,reject) => {
  const req = http.get(origin + '/fr',{ headers: { Host:'deployed.example' } },res => {
    res.resume();
    resolve({ status:res.statusCode, authenticate:res.headers['www-authenticate'] });
  });
  req.on('error',reject);
});
assert.equal(accessStatus.status,200,'hosted domains open without preview authentication');
assert.equal(accessStatus.authenticate,undefined,'no browser password challenge');
console.log(JSON.stringify({ routes:seen.size, internalAndExternalLinks:links, whatsappLinks, blockedPaths:8, externalHostAccess:accessStatus, result:'passed' },null,2));
