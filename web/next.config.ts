import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['gsap', 'framer-motion', 'lenis'],
  },
};

export default nextConfig;
