import Airtable from 'airtable';
import type { Vendor, ServiceType, Location } from '@/types';

const BASE_ID = 'app8ulgUjs3LNRx0f';
const TABLE_VENDORS = 'tbl7qtkezcf5hyQ8E';
const TABLE_SERVICE_TYPES = 'tblVukdD7ox0A6jwK';
const TABLE_LOCATIONS = 'tblcTRm0KTJUbFgBf';
const DIRECTORY_VIEW = 'Directory Approved';

function getBase() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) throw new Error('AIRTABLE_API_KEY is not set');
  return new Airtable({ apiKey }).base(BASE_ID);
}

function toSlug(name: string, id: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') +
    '-' +
    id.slice(-6)
  );
}

export async function getServiceTypes(): Promise<ServiceType[]> {
  const base = getBase();
  const records = await base(TABLE_SERVICE_TYPES)
    .select({ fields: ['Name'], sort: [{ field: 'Sort', direction: 'asc' }] })
    .all();

  return records.map((r) => ({
    id: r.id,
    name: r.get('Name') as string,
  }));
}

export async function getLocations(): Promise<Location[]> {
  const base = getBase();
  const records = await base(TABLE_LOCATIONS)
    .select({ fields: ['Name', 'Type', 'Country'] })
    .all();

  return records.map((r) => ({
    id: r.id,
    name: r.get('Name') as string,
    type: (r.get('Type') as string | undefined) ?? undefined,
    country: (r.get('Country') as string | undefined) ?? undefined,
  }));
}

export async function getVendors(): Promise<Vendor[]> {
  const base = getBase();
  let records;
  try {
    records = await base(TABLE_VENDORS)
      .select({
        view: DIRECTORY_VIEW,
        fields: [
          'Name',
          'Service Type',
          'Home Location',
          'Covered Locations',
          'Vendor Website',
          'Vendor Instagram',
        ],
      })
      .all();
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    const msg = err instanceof Error ? err.message : String(err);
    // Return empty during build when the view doesn't exist yet, or when
    // AIRTABLE_API_KEY is missing/invalid in CI — avoids hard build failure.
    if (
      statusCode === 401 ||
      msg.includes('VIEW_NAME_NOT_FOUND') ||
      msg.includes('not find') ||
      msg.includes('api key')
    ) {
      console.warn('[airtable] getVendors failed (' + (statusCode ?? msg) + ') — returning empty list');
      return [];
    }
    throw err;
  }

  return records.map((r) => {
    const name = (r.get('Name') as string) ?? 'Unknown';
    const serviceTypeLinks = r.get('Service Type') as { id: string; name: string }[] | undefined;
    const homeLocationLinks = r.get('Home Location') as { id: string; name: string }[] | undefined;
    const coveredLocationLinks = r.get('Covered Locations') as { id: string; name: string }[] | undefined;

    return {
      id: r.id,
      name,
      slug: toSlug(name, r.id),
      serviceType: serviceTypeLinks?.[0]
        ? { id: serviceTypeLinks[0].id, name: serviceTypeLinks[0].name }
        : null,
      homeLocation: homeLocationLinks?.[0]
        ? { id: homeLocationLinks[0].id, name: homeLocationLinks[0].name }
        : null,
      coveredLocations: (coveredLocationLinks ?? []).map((l) => ({ id: l.id, name: l.name })),
      website: (r.get('Vendor Website') as string | undefined) ?? null,
      instagram: (r.get('Vendor Instagram') as string | undefined) ?? null,
      imageUrl: null, // field not yet in Airtable — swap in real URL here when added
    };
  });
}

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const vendors = await getVendors();
  return vendors.find((v) => v.slug === slug) ?? null;
}
