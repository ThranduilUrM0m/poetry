import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    // Remove redirects as we're using the App Router
    // Remove rewrites as they're conflicting with the App Router
};

export default nextConfig;
