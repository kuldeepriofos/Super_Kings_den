/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dynamic API routes and SSR enabled for Admin Dashboard & MongoDB
  trailingSlash: true,
  images: {
    // Image optimization enabled: modern formats + responsive sizes served via
    // the Next.js image optimizer (sharp). Dramatically reduces LCP/bandwidth.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'superkingsden.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/all-ipl-seasons',
        destination: '/seasons',
      },
      {
        source: '/all-ipl-seasons/:year',
        destination: '/seasons/:year',
      },
      {
        source: '/all-csk-players',
        destination: '/csk-team',
      },
      {
        source: '/csk-stats',
        destination: '/chennai-super-kings/',
      },
      {
        source: '/csk-rivalries',
        destination: '/rivalries',
      },
      {
        source: '/wp-content/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
