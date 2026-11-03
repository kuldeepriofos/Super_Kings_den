/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dynamic API routes and SSR enabled for Admin Dashboard & MongoDB
  trailingSlash: true,
  images: {
    unoptimized: true,
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
