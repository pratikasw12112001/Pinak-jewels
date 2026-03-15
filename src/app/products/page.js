'use client';
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import styles from './page.module.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Sort by: Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

const CATEGORIES = ['All', 'Bracelets', 'Earrings', 'Necklaces', 'Rings', 'Pendants'];

export default function AllProductsPage() {
  const [sort, setSort] = useState('featured');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? [...products]
    : products.filter(p => p.category === activeCategory);

  const sorted = filtered.sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'newest') return b.id - a.id;
    return 0;
  });

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Banner */}
        <div className={styles.banner}>
          <h1>All Products</h1>
          <p>{sorted.length} products</p>
        </div>

        {/* Filters bar */}
        <div className={styles.toolbar}>
          {/* Category pills */}
          <div className={styles.pills}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            className={styles.sort}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Product grid */}
        {sorted.length > 0 ? (
          <div className="product-grid">
            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className={styles.noResults}>No products found.</div>
        )}
      </div>
    </div>
  );
}
