/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not leak framework details in response headers.
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Blocks the site being framed on a phishing/clickjacking page.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Stops browsers guessing content types (MIME sniffing attacks).
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Do not send full URLs to third parties.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Deny access to sensitive device APIs the storefront never uses.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Force HTTPS for a year, including subdomains.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        // Order and admin APIs must never be cached by a CDN or browser.
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        // Keep the admin area out of search results entirely.
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
