import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getVendors, getVendorBySlug } from '@/lib/airtable';
import Header from '@/components/Header';
import VendorImagePlaceholder from '@/components/VendorImagePlaceholder';
import styles from './page.module.css';

export const revalidate = 3600;

export async function generateStaticParams() {
  const vendors = await getVendors();
  return vendors.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) return {};

  const locationStr = vendor.homeLocation?.name ?? vendor.coveredLocations[0]?.name ?? 'Ireland';
  const description = `${vendor.name} — ${vendor.serviceType?.name ?? 'Wedding vendor'} based in ${locationStr}. Vetted by Ladybird Ever After.`;

  return {
    title: `${vendor.name} — ${vendor.serviceType?.name ?? 'Vendor'} in ${locationStr} | Ladybird Ever After`,
    description,
  };
}

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) notFound();

  const allLocations = [
    ...(vendor.homeLocation ? [vendor.homeLocation] : []),
    ...vendor.coveredLocations.filter((l) => l.id !== vendor.homeLocation?.id),
  ];

  return (
    <div className="lb-directory">
      <Header />

      <main className={styles.main}>
        <div className={styles.back}>
          <a href="/">&larr; All vendors</a>
        </div>

        <article className={styles.profile}>
          <div className={styles.imageWrap}>
            <VendorImagePlaceholder
              imageUrl={vendor.imageUrl}
              vendorName={vendor.name}
              size="profile"
            />
          </div>

          <div className={styles.content}>
            {vendor.serviceType && (
              <span className={styles.badge}>{vendor.serviceType.name}</span>
            )}

            <h1 className={styles.name}>{vendor.name}</h1>

            {allLocations.length > 0 && (
              <p className={styles.location}>
                {allLocations.map((l) => l.name).join(' · ')}
              </p>
            )}

            <div className={styles.links}>
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkBtn}
                >
                  Visit website &rarr;
                </a>
              )}
              {vendor.instagram && (
                <a
                  href={vendor.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.linkBtn} ${styles.linkBtnSecondary}`}
                >
                  Instagram &rarr;
                </a>
              )}
            </div>

            <p className={styles.curation}>
              ✦ Vetted &amp; approved by Ladybird Ever After
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
