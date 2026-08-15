/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'supabase.co' },
      { protocol: 'https', hostname: 'images.ctfassets.net' },
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
    ],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96],
  },
  async redirects() {
    return [
      // Redirection 301 automatique du .com vers le .fr officiel
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'frettalent.com',
          },
        ],
        destination: 'https://www.frettalent.fr/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.frettalent.com',
          },
        ],
        destination: 'https://www.frettalent.fr/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
