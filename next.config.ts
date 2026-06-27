import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // When Ladybird adds real photo URLs to Airtable, add the domain(s) here
      // e.g. { protocol: 'https', hostname: 'dl.airtable.com' }
    ],
  },
};

export default nextConfig;
