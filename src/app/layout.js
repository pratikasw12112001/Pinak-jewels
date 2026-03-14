import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromoBanner from '@/components/PromoBanner';

export const metadata = {
  title: 'Pinak Jewels | Modern Jewellery, Timeless You',
  description: 'Discover modern, trendy jewellery at affordable prices. Shop pendants, necklaces, rings, bracelets, and earrings at Pinak Jewels.',
  keywords: 'jewellery, pendants, necklaces, rings, bracelets, earrings, gold, brass, affordable jewellery',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-pinak.png" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <PromoBanner />
              <Header />
              <main style={{ minHeight: 'calc(100vh - 300px)' }}>
                {children}
              </main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
