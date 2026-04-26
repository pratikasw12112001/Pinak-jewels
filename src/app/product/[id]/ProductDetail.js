'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/Toast';
import { getProductsByCategory } from '@/data/products';
import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';

export default function ProductDetail({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (zoomOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [zoomOpen]);

  const productUrl = `https://pinakjewels.com/product/${product.slug}`;
  const shareText = `Check out ${product.name} on Pinak Jewels — ₹${product.price.toLocaleString()}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => { setCopied(false); setShareOpen(false); }, 1800);
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + productUrl)}`, '_blank');
    setShareOpen(false);
  };

  const handleInstagramShare = () => {
    handleCopyLink();
    window.open('https://www.instagram.com/', '_blank');
  };

  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`"${product.name}" added to cart`, 'View Cart', '/cart');
  };

  const handleWishlistToggle = () => {
    const wasWishlisted = isInWishlist(product.id);
    toggleWishlist(product);
    if (!wasWishlisted) showToast(`"${product.name}" added to wishlist`, 'View Wishlist', '/wishlist');
  };

  const wishlisted = isInWishlist(product.id);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: `https://pinakjewels.com${product.image}`,
    description: product.description,
    brand: { '@type': 'Brand', name: 'Pinak Jewels' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Pinak Jewels' },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pinakjewels.com' },
      { '@type': 'ListItem', position: 2, name: product.category, item: `https://pinakjewels.com/category/${product.categorySlug}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <div className={styles.productPage}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.categorySlug}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className={styles.productLayout}>
          <div className={styles.imageSection}>
            <div className={styles.mainImage} onClick={() => setZoomOpen(true)} title="Click to zoom">
              <img src={product.image} alt={`${product.name} — anti-tarnish waterproof jewellery by Pinak Jewels`} />
              <div className={styles.zoomHint}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                Zoom
              </div>
            </div>
          </div>

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

            <div className={styles.features}>
              <h4>Features</h4>
              <div className={styles.featureList}>
                {product.features.map((f, i) => (
                  <span key={i} className={styles.featureTag}>✓ {f}</span>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <div className={styles.quantityPicker}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(20, quantity + 1))} disabled={quantity >= 20}>+</button>
              </div>
              <button className={`btn btn-primary ${styles.addToCartBtn}`} onClick={handleAddToCart}>Add to Cart</button>
              <button className={`${styles.wishBtn} ${wishlisted ? styles.wishlisted : ''}`} onClick={handleWishlistToggle} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>

              <div className={styles.shareWrapper} ref={shareRef}>
                <button className={styles.shareBtn} onClick={() => setShareOpen(!shareOpen)} aria-label="Share product">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
                {shareOpen && (
                  <div className={styles.shareDropdown}>
                    <button onClick={handleCopyLink} className={styles.shareOption}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      {copied ? '✓ Link Copied!' : 'Copy Link'}
                    </button>
                    <button onClick={handleWhatsAppShare} className={styles.shareOption}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </button>
                    <button onClick={handleInstagramShare} className={styles.shareOption}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="url(#igGrad2)">
                        <defs><linearGradient id="igGrad2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <div className="section-title"><h2>You May Also Like</h2></div>
            <div className="product-grid">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {zoomOpen && (
        <div className={styles.zoomOverlay} onClick={() => setZoomOpen(false)}>
          <button className={styles.zoomClose} onClick={() => setZoomOpen(false)} aria-label="Close zoom">✕</button>
          <img src={product.image} alt={product.name} className={styles.zoomImage} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
