import { getProductBySlug } from '@/data/products';
import ProductDetail from './ProductDetail';

export async function generateMetadata({ params }) {
  const product = getProductBySlug(params.id);
  if (!product) return { title: 'Product Not Found | Pinak Jewels' };

  const desc = `${product.name} — ${product.features.slice(0, 3).join(', ')}. ₹${product.price.toLocaleString()}. Anti-tarnish, waterproof jewellery. Free shipping above ₹2499.`;

  return {
    title: `${product.name} | Pinak Jewels`,
    description: desc.slice(0, 160),
    openGraph: {
      title: `${product.name} | Pinak Jewels`,
      description: desc.slice(0, 160),
      images: [{ url: `https://pinakjewels.com${product.image}`, width: 800, height: 800, alt: product.name }],
      type: 'website',
    },
    alternates: { canonical: `https://pinakjewels.com/product/${product.slug}` },
  };
}

export default function ProductPage({ params }) {
  const product = getProductBySlug(params.id);
  if (!product) return <div style={{ textAlign: 'center', padding: '120px 24px' }}><h1>Product not found</h1></div>;
  return <ProductDetail product={product} />;
}
