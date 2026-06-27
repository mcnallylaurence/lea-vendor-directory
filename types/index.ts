export interface ServiceType {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  type?: string;
  country?: string;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  serviceType: ServiceType | null;
  homeLocation: Location | null;
  coveredLocations: Location[];
  website: string | null;
  instagram: string | null;
  imageUrl: string | null;
}
