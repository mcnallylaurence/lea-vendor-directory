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

  // Fetch lookup tables and vendor records in parallel
  let [serviceTypeRecords, locationRecords, vendorRecords] = [[], [], []] as [
    Airtable.Records<Airtable.FieldSet>,
    Airtable.Records<Airtable.FieldSet>,
    Airtable.Records<Airtable.FieldSet>,
  ];

  try {
    [serviceTypeRecords, locationRecords, vendorRecords] = await Promise.all([
      base(TABLE_SERVICE_TYPES).select({ fields: ['Name'] }).all(),
      base(TABLE_LOCATIONS).select({ fields: ['Name'] }).all(),
      base(TABLE_VENDORS)
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
        .all(),
    ]);
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

  // Build lookup maps: record ID → name
  const serviceTypeMap = new Map(
    serviceTypeRecords.map((r) => [r.id, r.get('Name') as string])
  );
  const locationMap = new Map(
    locationRecords.map((r) => [r.id, r.get('Name') as string])
  );

  return vendorRecords.map((r) => {
    const name = (r.get('Name') as string) ?? 'Unknown';

    // The Airtable Node SDK returns linked record fields as string[] of record IDs
    const serviceTypeIds = (r.get('Service Type') as string[] | undefined) ?? [];
    const homeLocationIds = (r.get('Home Location') as string[] | undefined) ?? [];
    const coveredLocationIds = (r.get('Covered Locations') as string[] | undefined) ?? [];

    const firstServiceTypeId = serviceTypeIds[0];
    const firstHomeLocationId = homeLocationIds[0];

    return {
      id: r.id,
      name,
      slug: toSlug(name, r.id),
      serviceType: firstServiceTypeId && serviceTypeMap.has(firstServiceTypeId)
        ? { id: firstServiceTypeId, name: serviceTypeMap.get(firstServiceTypeId)! }
        : null,
      homeLocation: firstHomeLocationId && locationMap.has(firstHomeLocationId)
        ? { id: firstHomeLocationId, name: locationMap.get(firstHomeLocationId)! }
        : null,
      coveredLocations: coveredLocationIds
        .filter((id) => locationMap.has(id))
        .map((id) => ({ id, name: locationMap.get(id)! })),
      website: (r.get('Vendor Website') as string | undefined) ?? null,
      instagram: (r.get('Vendor Instagram') as string | undefined) ?? null,
      imageUrl: null, // swap in Airtable photo URL field here when added
    };
  });
}

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const vendors = await getVendors();
  return vendors.find((v) => v.slug === slug) ?? null;
}
