/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
        destination: '/players',
      },
      {
        source: '/csk-stats',
        destination: '/stats',
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
