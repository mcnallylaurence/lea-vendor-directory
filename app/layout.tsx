import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ireland Wedding Vendor Directory | Ladybird Ever After',
  description:
    'Browse hand-vetted wedding vendors across Ireland — photographers, florists, celebrants, hair, makeup and more. Curated by Ladybird Ever After.',
  metadataBase: new URL('https://search.ladybirdeverafter.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
