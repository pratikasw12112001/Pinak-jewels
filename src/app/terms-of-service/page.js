import styles from './page.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Pinak Jewels',
  description: 'Terms of Service for Pinak Jewels — the rules and conditions governing your use of our website and purchases.',
};

export default function TermsOfServicePage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.back}>← Back to Home</Link>

        <h1>Terms of Service</h1>
        <p className={styles.effective}>Effective Date: April 26, 2026</p>

        <p className={styles.intro}>
          These Terms of Service ("Terms") govern your use of the Pinak Jewels website at pinakjewels.com and any purchases made through it. By accessing or using our website, you agree to these Terms. Please read them carefully before placing an order.
        </p>

        <section className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>By browsing, accessing, or purchasing from our website, you confirm that you are at least 18 years of age (or have the consent of a parent or legal guardian), and that you agree to be bound by these Terms and our Privacy Policy.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Products &amp; Descriptions</h2>
          <p>Pinak Jewels offers anti-tarnish, waterproof fashion jewellery including bracelets, earrings, necklaces, rings, and pendants. We make every effort to display our products accurately through descriptions, photographs, and pricing. However:</p>
          <ul>
            <li>Colours may vary slightly due to screen display settings</li>
            <li>Product images are for illustrative purposes and may not reflect exact sizes</li>
            <li>We reserve the right to modify or discontinue products without prior notice</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Pricing &amp; Payment</h2>
          <ul>
            <li>All prices on our website are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise</li>
            <li>Free shipping is available on orders above ₹2,499</li>
            <li>We reserve the right to correct pricing errors at any time before an order is fulfilled</li>
            <li>Payment is due at the time of placing your order</li>
            <li>We use secure third-party payment gateways; we do not store your card details</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Orders &amp; Order Confirmation</h2>
          <p>Placing an order on our website constitutes an offer to purchase. An order is confirmed only upon receipt of an order confirmation email from us. We reserve the right to cancel or refuse any order at our discretion — for example, in cases of pricing errors, suspected fraud, or stock unavailability — and will provide a full refund in such cases.</p>
        </section>

        <section className={styles.section}>
          <h2>5. Shipping &amp; Delivery</h2>
          <ul>
            <li>We ship to addresses within India unless otherwise specified</li>
            <li>Estimated delivery times are provided at checkout and are approximate, not guaranteed</li>
            <li>Delivery times may be affected by factors beyond our control (e.g., courier delays, public holidays, force majeure events)</li>
            <li>Once shipped, you will receive a tracking number via email</li>
            <li>Risk of loss or damage passes to you upon delivery</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Returns &amp; Refunds</h2>

          <h3>6.1 Eligibility</h3>
          <p>We want you to love your Pinak Jewels purchase. If you are not satisfied, you may request a return or exchange subject to the following conditions:</p>
          <ul>
            <li>Items must be returned within 7 days of delivery</li>
            <li>Items must be unused, unworn, and in their original packaging with all tags intact</li>
            <li>Customised or personalised items cannot be returned unless they arrive damaged or defective</li>
          </ul>

          <h3>6.2 How to Initiate a Return</h3>
          <p>Please email us at <a href="mailto:pinakjewels04@gmail.com">pinakjewels04@gmail.com</a> within the return window. Our team will guide you through the return process. Return shipping costs may be borne by the customer unless the return is due to our error or a product defect.</p>

          <h3>6.3 Refunds</h3>
          <p>Once we receive and inspect the returned item, refunds will be processed to your original payment method within 7–10 business days. We reserve the right to decline returns that do not meet our eligibility conditions.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Product Care &amp; Warranty</h2>
          <p>Our jewellery is crafted with anti-tarnish coating and waterproof materials designed for everyday wear. To maintain the quality and longevity of your pieces:</p>
          <ul>
            <li>Avoid exposure to harsh chemicals, perfumes, and chlorinated water</li>
            <li>Store jewellery in a cool, dry place away from direct sunlight</li>
            <li>Clean gently with a soft, dry cloth</li>
          </ul>
          <p>We do not offer a formal warranty on fashion jewellery, but if you receive a damaged or defective product, please contact us within 48 hours of delivery with photographs, and we will resolve the issue promptly.</p>
        </section>

        <section className={styles.section}>
          <h2>8. Intellectual Property</h2>
          <p>All content on this website — including but not limited to the Pinak Jewels name, logo, product photographs, descriptions, designs, and website layout — is the intellectual property of Pinak Jewels. You may not copy, reproduce, distribute, or use any content from this website without our prior written permission.</p>
        </section>

        <section className={styles.section}>
          <h2>9. User Conduct</h2>
          <p>By using our website, you agree not to:</p>
          <ul>
            <li>Use the website for any unlawful purpose or in violation of these Terms</li>
            <li>Attempt to gain unauthorised access to our systems or data</li>
            <li>Submit false or misleading information in orders or communications</li>
            <li>Engage in any activity that disrupts or interferes with the website's functionality</li>
            <li>Reproduce, duplicate, or exploit any portion of our website for commercial purposes without permission</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>10. Limitation of Liability</h2>
          <p>To the fullest extent permitted by applicable law, Pinak Jewels shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products, including but not limited to loss of data, revenue, or profit. Our total liability to you in connection with any order shall not exceed the amount paid by you for that specific order.</p>
        </section>

        <section className={styles.section}>
          <h2>11. Disclaimer of Warranties</h2>
          <p>Our website and products are provided "as is" and "as available." We make no warranties — express or implied — regarding the accuracy, completeness, or reliability of our website content, or the fitness of our products for any particular purpose, beyond what is expressly stated in our product descriptions.</p>
        </section>

        <section className={styles.section}>
          <h2>12. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from or relating to these Terms or your use of our website shall be subject to the exclusive jurisdiction of the courts located in Nagpur, Maharashtra, India.</p>
        </section>

        <section className={styles.section}>
          <h2>13. Changes to These Terms</h2>
          <p>We reserve the right to update or modify these Terms at any time. Changes will be effective upon posting on this page with a revised effective date. Continued use of our website after any changes constitutes your acceptance of the revised Terms.</p>
        </section>

        <section className={styles.section}>
          <h2>14. Contact Us</h2>
          <p>If you have questions, concerns, or need assistance regarding these Terms, please email us at <a href="mailto:pinakjewels04@gmail.com">pinakjewels04@gmail.com</a>. We are happy to help.</p>
        </section>
      </div>
    </div>
  );
}
