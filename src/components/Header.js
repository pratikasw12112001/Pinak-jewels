'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { searchProducts } from '@/data/products';
import styles from './Header.module.css';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Pendants', href: '/category/pendants' },
  { label: 'Necklaces', href: '/category/necklaces' },
  { label: 'Rings', href: '/category/rings' },
  { label: 'Bracelets', href: '/category/bracelets' },
  { label: 'Earrings', href: '/category/earrings' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchResults([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        const results = searchProducts(searchQuery).slice(0, 6);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerInner}>
        {/* Mobile menu toggle */}
        <button className={styles.mobileToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
          <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.open : ''}`}>
            <span></span><span></span><span></span>
          </span>
        </button>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <img src="/logo-pinak-transparent.png" alt="Pinak Jewels" />
        </Link>

        {/* Navigation */}
        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.navLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className={styles.icons}>
          {/* Search */}
          <div className={styles.searchWrapper} ref={searchRef}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            {searchOpen && (
              <div className={styles.searchDropdown}>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search jewellery..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className={styles.searchInput}
                  />
                </form>
                {searchResults.length > 0 && (
                  <div className={styles.searchResultsList}>
                    {searchResults.map(product => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className={styles.searchResultItem}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                      >
                        <img src={product.image} alt={product.name} className={styles.searchResultImg} />
                        <div>
                          <div className={styles.searchResultName}>{product.name}</div>
                          <div className={styles.searchResultPrice}>₹{product.price.toLocaleString()}</div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      className={styles.searchViewAll}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    >
                      View all results →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
          </Link>

          {/* Cart */}
          <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          {/* User */}
          {isLoggedIn ? (
            <div className={styles.userMenu} ref={userMenuRef}>
              <button className={styles.iconBtn} aria-label="Account" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              {userDropdownOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userGreeting}>Hi, {user?.name || 'User'}!</div>
                  <Link href="/orders" className={styles.dropdownLink} onClick={() => setUserDropdownOpen(false)}>My Orders</Link>
                  <button onClick={() => { logout(); setUserDropdownOpen(false); }} className={styles.logoutBtn}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className={styles.iconBtn} aria-label="Login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && <div className={styles.overlay} onClick={() => setMobileMenuOpen(false)} />}
    </header>
  );
}
