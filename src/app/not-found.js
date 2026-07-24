import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | Pinak Jewels',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 24px', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>💎</div>
      <h1 style={{ fontSize: '28px', marginBottom: '12px', color: 'var(--primary-green)' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
        The page you are looking for may have been moved or no longer exists.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn-primary">Back to Home</Link>
        <Link href="/products" className="btn btn-outline">Browse Jewellery</Link>
      </div>
    </div>
  );
}
