import { withReticle } from '@reticlehq/core/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.shields.io',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/testimonials',
        destination: '/',
        permanent: true,
      },
      {
        source: '/enterprise-leads',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ph',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/compare',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/features',
        destination: '/docs',
        permanent: true,
      },
      {
        source: '/testimonial',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default withReticle(nextConfig);
