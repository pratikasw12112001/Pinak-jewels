import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { OrderProvider } from '@/context/OrderContext';
import { ToastProvider } from '@/components/Toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromoBanner from '@/components/PromoBanner';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  title: {
    default: 'Pinak Jewels | Anti-Tarnish & Waterproof Jewellery India',
    template: '%s | Pinak Jewels',
  },
  description: 'Shop anti-tarnish, waterproof fashion jewellery online in India. Discover pendants, necklaces, rings, bracelets & earrings at affordable prices. Free shipping above ₹2499.',
  keywords: 'anti-tarnish jewellery, waterproof jewellery, fashion jewellery India, gold jewellery, pendants, necklaces, rings, bracelets, earrings, pinak jewels, affordable jewellery, skin-safe jewellery',
  metadataBase: new URL('https://pinakjewels.com'),
  alternates: { canonical: 'https://pinakjewels.com' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://pinakjewels.com',
    siteName: 'Pinak Jewels',
    title: 'Pinak Jewels | Anti-Tarnish & Waterproof Jewellery India',
    description: 'Shop anti-tarnish, waterproof fashion jewellery at affordable prices. Free shipping above ₹2499.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Pinak Jewels — Modern Jewellery' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pinak Jewels | Anti-Tarnish & Waterproof Jewellery',
    description: 'Shop anti-tarnish, waterproof fashion jewellery at affordable prices.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Pinak Jewels',
  url: 'https://pinakjewels.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://pinakjewels.com/search?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Pinak Jewels',
  url: 'https://pinakjewels.com',
  logo: 'https://pinakjewels.com/logo-pinak-transparent.png',
  contactPoint: { '@type': 'ContactPoint', telephone: '+91-8955754448', contactType: 'customer service', areaServed: 'IN', availableLanguage: ['English', 'Hindi'] },
  sameAs: ['https://instagram.com'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-64.png" type="image/png" sizes="64x64" />
        <link rel="icon" href="/logo-pinak.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/logo-pinak.png" />
        <meta name="theme-color" content="#0F4F3A" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderProvider>
                <ToastProvider>
                  <PromoBanner />
                  <Header />
                  <main style={{ minHeight: 'calc(100vh - 300px)' }}>
                    {children}
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </ToastProvider>
              </OrderProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
