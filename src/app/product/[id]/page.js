'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getProductBySlug, getProductsByCategory } from '@/data/products';
import { useState } from 'react';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const product = getProductBySlug(params.id);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <div className={styles.notFound}><h1>Product not found</h1></div>;
  }

  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const wishlisted = isInWishlist(product.id);

  return (
    <div className={styles.productPage}>
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.categorySlug}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className={styles.productLayout}>
          {/* Image */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          {/* Details */}
          <div className={styles.detailsSection}>
            <span className={styles.category}>{product.category}</span>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>₹{product.price.toLocaleString()}</p>
            <span className={styles.taxNote}>Inclusive of all taxes</span>

            <div className={styles.divider} />

            <p className={styles.description}>{product.description}</p>

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Material</span>
                <span className={styles.metaValue}>{product.material}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Stock</span>
                <span className={styles.metaValue}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>

            {/* Features */}
            <div className={styles.features}>
              <h4>Features</h4>
              <div className={styles.featureList}>
                {product.features.map((f, i) => (
                  <span key={i} className={styles.featureTag}>✓ {f}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <div className={styles.quantityPicker}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className={`btn btn-primary ${styles.addToCartBtn}`} onClick={handleAddToCart}>
                {added ? '✓ Added!' : 'Add to Cart'}
              </button>
              <button
                className={`${styles.wishBtn} ${wishlisted ? styles.wishlisted : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <div className="section-title">
              <h2>You May Also Like</h2>
            </div>
            <div className="product-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {added && <div className="toast">Added to cart! 🛍️</div>}
    </div>
  );
}
