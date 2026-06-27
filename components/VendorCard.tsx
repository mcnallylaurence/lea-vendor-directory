import Link from 'next/link';
import type { Vendor } from '@/types';
import VendorImagePlaceholder from './VendorImagePlaceholder';
import styles from './VendorCard.module.css';

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  const location = vendor.homeLocation?.name ?? vendor.coveredLocations[0]?.name ?? null;

  return (
    <Link href={`/vendors/${vendor.slug}`} className={styles.card}>
      <VendorImagePlaceholder imageUrl={vendor.imageUrl} vendorName={vendor.name} size="card" />
      <div className={styles.body}>
        {vendor.serviceType && (
          <span className={styles.badge}>{vendor.serviceType.name}</span>
        )}
        <h3 className={styles.name}>{vendor.name}</h3>
        {location && <p className={styles.location}>{location}</p>}
      </div>
    </Link>
  );
}
