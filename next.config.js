/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable the "Powered by Next.js" header for security
  poweredByHeader: false,

  // Enable React strict mode for catching potential issues early
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Server-side packages that should not be bundled (Node.js native modules used by mongoose, bcryptjs, jsonwebtoken)
  serverExternalPackages: ['mongoose', 'bcryptjs', 'jsonwebtoken'],

  // Image optimization: restrict to known remote patterns (add as needed)
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
