'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getProductsByCategory, categories } from '@/data/products';
import styles from './page.module.css';

export default function CategoryPage() {
  const params = useParams();
  const [sortBy, setSortBy] = useState('default');
  const slug = params.slug;

  const category = categories.find(c => c.slug === slug);
  const allProducts = getProductsByCategory(slug);

  const sortedProducts = useMemo(() => {
    const sorted = [...allProducts];
    switch (sortBy) {
      case 'price-low': return sorted.sort((a, b) => a.price - b.price);
      case 'price-high': return sorted.sort((a, b) => b.price - a.price);
      case 'newest': return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default: return sorted;
    }
  }, [allProducts, sortBy]);

  if (!category) {
    return (
      <div className={styles.notFound}>
        <h1>Category not found</h1>
        <p>The category you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className={styles.categoryPage}>
      {/* Banner */}
      <div className={styles.banner}>
        <h1>{category.name}</h1>
        <p>{sortedProducts.length} products</p>
      </div>

      <div className="container">
        {/* Sort Controls */}
        <div className={styles.controls}>
          <span className={styles.showing}>Showing {sortedProducts.length} products</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="default">Sort by: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
