import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const PUBLIC_PREFIXES = ['/track', '/privacy', '/terms'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les assets statiques (public/) et les routes publiques
  if (
    /\.(png|jpg|jpeg|svg|ico|webp|gif|woff2?|ttf|eot|otf|css|js|map)$/.test(pathname) ||
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Vérifier la présence du token dans les cookies
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
