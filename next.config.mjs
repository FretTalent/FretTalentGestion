/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable external images (needed for Supabase storage, Stripe webhooks, etc.)
  images: {
    domains: [
      'oaidalleapiprodscus.blob.core.windows.net',
      'supabase.co',
      'images.ctfassets.net',
      '*.supabase.co',
    ],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96],
  },
  // Enable React 18 server components by default
  experimental: {
    serverActions: true,
  },
  // Add API route rewrites if needed later
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
