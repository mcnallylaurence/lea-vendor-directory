import Header from '@/components/Header';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className="lb-directory">
      <Header />
      <main className={styles.main}>
        <p className={styles.eyebrow}>404</p>
        <h1 className={styles.heading}>Page not found</h1>
        <p className={styles.body}>That vendor page doesn&apos;t exist or may have moved.</p>
        <a href="/" className={styles.link}>
          &larr; Back to all vendors
        </a>
      </main>
    </div>
  );
}
