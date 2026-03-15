'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { searchProducts } from '@/data/products';
import styles from './page.module.css';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = query ? searchProducts(query) : [];

  return (
    <div className="container">
      <div className={styles.searchPage}>
        <h1>Search Results</h1>
        {query && <p className={styles.queryInfo}>Showing results for <strong>&ldquo;{query}&rdquo;</strong> ({results.length} found)</p>}
        {results.length > 0 ? (
          <div className="product-grid">{results.map(p => <ProductCard key={p.id} product={p} />)}</div>
        ) : query ? (
          <div className={styles.noResults}><p>No products found for &ldquo;{query}&rdquo;. Try a different search term.</p></div>
        ) : (
          <div className={styles.noResults}><p>Enter a search term to find products.</p></div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="container" style={{padding:'80px 0',textAlign:'center'}}>Loading...</div>}><SearchContent /></Suspense>;
}
