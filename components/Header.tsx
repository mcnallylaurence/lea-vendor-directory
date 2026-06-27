import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMain}>Ladybird Ever After</span>
          <span className={styles.logoBadge}>Vendor Directory</span>
        </Link>
        <nav className={styles.nav}>
          <a
            href="https://ladybirdeverafter.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
          >
            ladybirdeverafter.com
          </a>
        </nav>
      </div>
    </header>
  );
}
