import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPublicPath } from './lib/public-paths';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chrome DevTools interroge ce fichier (espaces de travail automatiques) à chaque ouverture des outils :
  // aucune configuration à fournir, on répond « rien à signaler » au lieu d'une 404 dans les journaux.
  if (pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
    return new NextResponse(null, { status: 204 });
  }

  // Laisser passer les assets statiques (public/) et les routes publiques
  if (
    /\.(png|jpg|jpeg|svg|ico|webp|gif|woff2?|ttf|eot|otf|css|js|map)$/.test(pathname) ||
    PUBLIC_PATHS.includes(pathname) ||
    isPublicPath(pathname) ||
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
