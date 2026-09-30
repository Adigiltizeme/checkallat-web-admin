/**
 * Pages accessibles sans connexion (liste unique, utilisée par le middleware et par AuthProvider).
 * Une nouvelle page publique s'ajoute ici et nulle part ailleurs.
 */
export const PUBLIC_PATH_PREFIXES = ['/track', '/privacy', '/terms', '/account-deletion', '/contact'] as const;

export const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
