import { NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  // Forwarded headers are deliberately ignored for preview access control.
  const host = request.headers.get('host') || '';
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) {
    const expected = process.env.PREVIEW_USER && process.env.PREVIEW_PASSWORD
      ? 'Basic ' + btoa(process.env.PREVIEW_USER + ':' + process.env.PREVIEW_PASSWORD) : null;
    if (!expected || request.headers.get('authorization') !== expected)
      return new NextResponse('Private preview', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Infinity preview"', 'Cache-Control': 'no-store' } });
  }
  const headers = new Headers(request.headers);
  headers.set('x-store-locale', request.nextUrl.pathname.startsWith('/nl') ? 'nl-BE' : 'fr-BE');
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
