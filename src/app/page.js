'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { categories, getBestsellers, getNewArrivals } from '@/data/products';
import styles from './page.module.css';

export default function HomePage() {
  const bestsellers = getBestsellers();
  const newArrivals = getNewArrivals();

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>✦ New Collection 2026</span>
          <h1 className={styles.heroTitle}>Modern Jewellery,<br/>Timeless You</h1>
          <p className={styles.heroSubtitle}>
            Discover anti-tarnish, waterproof jewellery that blends contemporary design with timeless elegance.
          </p>
          <Link href="/category/pendants" className="btn btn-secondary">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Shop by Category */}
      <section className={`section ${styles.categoriesSection}`}>
        <div className="container">
          <div className="section-title">
            <h2>Shop by Category</h2>
            <p>Explore our curated collections</p>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link href={`/category/${cat.slug}`} key={cat.slug} className={styles.categoryCard}>
                <div className={styles.categoryImageWrapper}>
                  <img src={cat.image} alt={cat.name} className={styles.categoryImage} loading="lazy" />
                </div>
                <div className={styles.categoryInfo}>
                  <h3>{cat.name}</h3>
                  <span className={styles.categoryLink}>Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="section section-ivory">
        <div className="container">
          <div className="section-title">
            <h2>Bestsellers</h2>
            <p>Our most loved pieces, handpicked for you</p>
          </div>
          <div className={styles.bestsellersScroll}>
            {bestsellers.map((product) => (
              <div key={product.id} className={styles.bestsellerItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>New Arrivals</h2>
            <p>Fresh designs just dropped</p>
          </div>
          <div className="product-grid">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className={styles.viewAllWrapper}>
            <Link href="/category/pendants" className="btn btn-outline">
              View All Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>✦</div>
              <h4>Anti-Tarnish</h4>
              <p>Premium coating that lasts</p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>💧</div>
              <h4>Waterproof</h4>
              <p>Wear it everywhere</p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🌿</div>
              <h4>Skin-Safe</h4>
              <p>Perfect for sensitive skin</p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🚚</div>
              <h4>Free Shipping</h4>
              <p>On orders above ₹2499</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
