export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/checkout', '/orders', '/cart', '/wishlist'] }],
    sitemap: 'https://pinakjewels.com/sitemap.xml',
  };
}
