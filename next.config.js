/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Avoid client-side loading of problematic packages
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        'sib-api-v3-sdk': false,
      };
    }
    // Add preferRelative option to resolve the API imports
    config.resolve.preferRelative = true;
    return config;
  },
  // Add this to ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 