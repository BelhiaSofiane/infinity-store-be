import { NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  // Keep existing bookmarks useful after replacing Dutch with English.
  if (request.nextUrl.pathname === '/nl' || request.nextUrl.pathname.startsWith('/nl/')) {
    const legacySegments: Record<string, string> = {
      producten: 'products', klantendienst: 'support', contact: 'contact',
      'juridische-informatie': 'legal', verkoopvoorwaarden: 'terms-of-sale',
      privacy: 'privacy', cookies: 'cookies', 'herroeping-retourneren': 'returns',
      levering: 'delivery', toegankelijkheid: 'accessibility',
    };
    const url = request.nextUrl.clone();
    const parts = url.pathname.split('/');
    parts[1] = 'en';
    if (parts[2]) parts[2] = legacySegments[parts[2]] || parts[2];
    if (parts[2] === 'products' && parts[3] === 'categorie') parts[3] = 'category';
    url.pathname = parts.join('/');
    return NextResponse.redirect(url, 308);
  }
  const headers = new Headers(request.headers);
  headers.set('x-store-locale', request.nextUrl.pathname.startsWith('/en') ? 'en-GB' : 'fr-BE');
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
