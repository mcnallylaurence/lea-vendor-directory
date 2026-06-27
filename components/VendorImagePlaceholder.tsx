import Image from 'next/image';
import styles from './VendorImagePlaceholder.module.css';

interface Props {
  imageUrl: string | null;
  vendorName: string;
  size?: 'card' | 'profile';
}

export default function VendorImagePlaceholder({ imageUrl, vendorName, size = 'card' }: Props) {
  if (imageUrl) {
    return (
      <div className={`${styles.wrapper} ${styles[size]}`}>
        <Image
          src={imageUrl}
          alt={vendorName}
          fill
          sizes={size === 'profile' ? '(max-width: 768px) 100vw, 480px' : '(max-width: 640px) 100vw, 320px'}
          className={styles.image}
        />
      </div>
    );
  }

  const initials = vendorName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`${styles.wrapper} ${styles[size]} ${styles.placeholder}`} aria-hidden="true">
      <span className={styles.initials}>{initials}</span>
      <span className={styles.leaf}>✦</span>
    </div>
  );
}
