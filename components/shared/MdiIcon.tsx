'use client';

import { useEffect, useState } from 'react';

/** Aperçu d'une icône MaterialCommunityIcons (mêmes noms que dans l'app mobile) */
export function MdiIcon({
  name,
  size = 20,
  className = '',
  tone = 'default',
}: {
  name: string;
  size?: number;
  className?: string;
  /** light : icône blanche (sur fond coloré) */
  tone?: 'default' | 'light';
}) {
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(true), [name]);
  if (!name || !ok) return <span className={`inline-block bg-gray-200 rounded ${className}`} style={{ width: size, height: size }} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
      onError={() => setOk(false)}
      style={{ filter: tone === 'light' ? 'invert(100%)' : 'invert(30%)' }}
    />
  );
}
