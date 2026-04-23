/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com", // unsafe-eval requis par Next.js dev + Mapbox RTL plugin
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://api.checkallat.com https://storage.checkallat.com https://*.mapbox.com",
      `connect-src 'self' https://*.railway.app https://*.up.railway.app https://*.mapbox.com https://events.mapbox.com${process.env.NODE_ENV === 'development' ? ' http://localhost:4000 http://localhost:4001' : ''}`,
      "font-src 'self' https://fonts.gstatic.com",
      "worker-src blob:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig = {
  images: {
    domains: ['api.checkallat.com', 'storage.checkallat.com', 'localhost'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
