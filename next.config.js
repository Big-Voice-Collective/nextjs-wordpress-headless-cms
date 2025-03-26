/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'builds',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.WORDPRESS_HOSTNAME}`,
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: `${process.env.WORDPRESS_URL}/wp-admin`,
        permanent: true,
      },
    ];
  },
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