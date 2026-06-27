import type { MetadataRoute } from 'next';
import { getVendors } from '@/lib/airtable';

const BASE_URL = 'https://search.ladybirdeverafter.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vendors = await getVendors();

  const vendorUrls = vendors.map((v) => ({
    url: `${BASE_URL}/vendors/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...vendorUrls,
  ];
}
