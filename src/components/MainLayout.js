'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import PromoBanner from './PromoBanner';
import WhatsAppButton from './WhatsAppButton';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <PromoBanner />
      <Header />
      <main style={{ minHeight: 'calc(100vh - 300px)' }}>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
