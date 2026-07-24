import { products } from '@/data/products';

// Single source of truth for all money calculations.
// The browser is never trusted for prices — it only sends product IDs and
// quantities, and the server re-derives every rupee from src/data/products.js.

export const SHIPPING_FEE = 99;
export const FREE_SHIPPING_THRESHOLD = 2499;
export const GIFT_WRAP_PRICE = 40;
// Must match the per-item cap enforced in the cart and product pages (20),
// otherwise a customer can build a cart the server refuses to charge for.
export const MAX_QUANTITY_PER_ITEM = 20;

export const COUPONS = {
  PINAK10: { type: 'percent', value: 10, minSubtotal: 1499 },
};

export function getCouponError(code, subtotal) {
  const coupon = COUPONS[String(code || '').trim().toUpperCase()];
  if (!coupon) return 'Invalid coupon code.';
  if (subtotal <= coupon.minSubtotal) {
    return `Coupon valid on orders above ₹${coupon.minSubtotal}.`;
  }
  return null;
}

/**
 * Re-derives the order total from trusted server-side product data.
 *
 * @param {Array<{id:number, quantity:number}>} items - client cart (ids/qty only)
 * @param {{giftWrap?:boolean, couponCode?:string}} options
 * @returns {{ok:true, ...totals}|{ok:false, error:string}}
 */
export function calculateOrderTotal(items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Cart is empty.' };
  }
  if (items.length > 50) {
    return { ok: false, error: 'Too many items in cart.' };
  }

  const lineItems = [];
  for (const raw of items) {
    const id = Number(raw?.id);
    const quantity = Number(raw?.quantity);

    if (!Number.isInteger(id)) {
      return { ok: false, error: 'Invalid product in cart.' };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return { ok: false, error: 'Invalid quantity in cart.' };
    }

    const product = products.find(p => p.id === id);
    if (!product) {
      return { ok: false, error: 'A product in your cart is no longer available.' };
    }
    if (typeof product.stock === 'number' && quantity > product.stock) {
      return { ok: false, error: `Only ${product.stock} left of ${product.name}.` };
    }

    // Price comes from the server's product table, never from the request.
    lineItems.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      quantity,
      lineTotal: product.price * quantity,
      freeShipping: product.freeShipping === true,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const hasFreeShippingItem = lineItems.some(item => item.freeShipping);
  const shipping =
    hasFreeShippingItem || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const giftWrap = options.giftWrap === true;
  const giftWrapFee = giftWrap ? GIFT_WRAP_PRICE : 0;

  let discount = 0;
  let appliedCoupon = null;
  const rawCode = String(options.couponCode || '').trim().toUpperCase();
  if (rawCode) {
    const coupon = COUPONS[rawCode];
    // An invalid or ineligible coupon is ignored rather than fatal: the customer
    // is charged the correct (higher) price instead of losing the order.
    if (coupon && subtotal > coupon.minSubtotal) {
      discount =
        coupon.type === 'percent'
          ? Math.round(subtotal * (coupon.value / 100))
          : coupon.value;
      appliedCoupon = rawCode;
    }
  }

  const total = subtotal + shipping + giftWrapFee - discount;

  if (!Number.isFinite(total) || total < 1) {
    return { ok: false, error: 'Order total is invalid.' };
  }

  return {
    ok: true,
    items: lineItems,
    subtotal,
    shipping,
    giftWrap,
    giftWrapFee,
    discount,
    appliedCoupon,
    total,
  };
}
