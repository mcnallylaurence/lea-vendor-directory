import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getVendors, getServiceTypes, getLocations } from '@/lib/airtable';
import Header from '@/components/Header';
import VendorCard from '@/components/VendorCard';
import DirectoryFilters from '@/components/DirectoryFilters';
import styles from './page.module.css';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Ireland Wedding Vendor Directory | Ladybird Ever After',
  description:
    'Browse hand-vetted wedding vendors across Ireland — photographers, florists, celebrants, hair, makeup and more. Curated by Ladybird Ever After.',
};

interface PageProps {
  searchParams: Promise<{ category?: string; county?: string }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const { category = '', county = '' } = await searchParams;

  const [vendors, serviceTypes, locations] = await Promise.all([
    getVendors(),
    getServiceTypes(),
    getLocations(),
  ]);

  const filtered = vendors.filter((v) => {
    const matchCategory = !category || v.serviceType?.name === category;
    const matchCounty =
      !county ||
      v.homeLocation?.name === county ||
      v.coveredLocations.some((l) => l.name === county);
    return matchCategory && matchCounty;
  });

  const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="lb-directory">
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Ladybird Ever After</p>
          <h1 className={styles.heading}>
            Ireland&apos;s finest <em>wedding vendors</em>
          </h1>
          <p className={styles.subheading}>
            Every vendor here is hand-vetted by Ladybird Ever After — our guarantee of quality
            across {vendors.length} trusted professionals.
          </p>
        </section>

        <section className={styles.filterSection}>
          <Suspense>
            <DirectoryFilters
              serviceTypes={serviceTypes}
              locations={sortedLocations}
              activeCategory={category}
              activeCounty={county}
            />
          </Suspense>
        </section>

        <section className={styles.results}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>No vendors found for those filters.</p>
            </div>
          ) : (
            <>
              <p className={styles.count}>
                {filtered.length} {filtered.length === 1 ? 'vendor' : 'vendors'}
                {category && ` · ${category}`}
                {county && ` · ${county}`}
              </p>
              <div className={styles.grid}>
                {filtered.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          A{' '}
          <a
            href="https://ladybirdeverafter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ladybird Ever After
          </a>{' '}
          directory
        </p>
      </footer>
    </div>
  );
}
