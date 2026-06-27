'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { ServiceType, Location } from '@/types';
import styles from './DirectoryFilters.module.css';

interface Props {
  serviceTypes: ServiceType[];
  locations: Location[];
  activeCategory: string;
  activeCounty: string;
}

export default function DirectoryFilters({
  serviceTypes,
  locations,
  activeCategory,
  activeCounty,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label className={styles.label} htmlFor="filter-category">
          Category
        </label>
        <select
          id="filter-category"
          className={styles.select}
          value={activeCategory}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {serviceTypes.map((st) => (
            <option key={st.id} value={st.name}>
              {st.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label} htmlFor="filter-county">
          County
        </label>
        <select
          id="filter-county"
          className={styles.select}
          value={activeCounty}
          onChange={(e) => updateFilter('county', e.target.value)}
        >
          <option value="">All Counties</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {(activeCategory || activeCounty) && (
        <button
          className={styles.clear}
          onClick={() => {
            router.push('/', { scroll: false });
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
