import styles from './page.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Pinak Jewels',
  description: 'Privacy Policy for Pinak Jewels — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.back}>← Back to Home</Link>

        <h1>Privacy Policy</h1>
        <p className={styles.effective}>Effective Date: April 26, 2026</p>

        <p className={styles.intro}>
          At Pinak Jewels ("we," "our," or "us"), we respect your privacy and are committed to protecting the personal information you share with us when visiting or purchasing from our website at pinakjewels.com. This Privacy Policy explains what data we collect, how we use it, and your rights.
        </p>

        <section className={styles.section}>
          <h2>1. Information We Collect</h2>

          <h3>1.1 Information You Provide Directly</h3>
          <p>When you place an order, create an account, contact us, or subscribe to our newsletter, we may collect:</p>
          <ul>
            <li>Full name and email address (via Google Sign-In)</li>
            <li>Shipping and billing address</li>
            <li>Order details and purchase history</li>
            <li>Communications you send us via the Contact Us form</li>
          </ul>

          <h3>1.2 Information Collected Automatically</h3>
          <p>When you browse our website, we may automatically collect:</p>
          <ul>
            <li>IP address and approximate geographic location</li>
            <li>Browser type and device information</li>
            <li>Pages visited, time spent on pages, and referring URLs</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h3>1.3 Payment Information</h3>
          <p>We do not store your payment card details on our servers. All payment transactions are processed through secure third-party payment gateways that comply with applicable security standards. We only receive a transaction confirmation and order reference.</p>
        </section>

        <section className={styles.section}>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfil your orders, including shipping and delivery</li>
            <li>Send order confirmations, tracking updates, and customer support communications</li>
            <li>Respond to your inquiries submitted through the Contact Us page</li>
            <li>Send promotional emails and new arrival updates (only if you have subscribed — you may unsubscribe at any time)</li>
            <li>Improve and personalise your browsing experience on our website</li>
            <li>Analyse website traffic and usage patterns to enhance our services</li>
            <li>Comply with legal and regulatory obligations</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Cookies &amp; Tracking</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Remember your shopping cart and preferences</li>
            <li>Analyse site performance and user behaviour (e.g., via analytics tools)</li>
            <li>Serve relevant content and promotions</li>
          </ul>
          <p>You can control or disable cookies through your browser settings. Note that disabling cookies may affect certain features of the website, such as the shopping cart.</p>
        </section>

        <section className={styles.section}>
          <h2>4. Sharing Your Information</h2>
          <p>We do not sell, rent, or trade your personal information to third parties. We may share your information with:</p>
          <ul>
            <li>Shipping and logistics partners — to deliver your orders</li>
            <li>Payment processors — to securely handle transactions</li>
            <li>Analytics providers — to understand website usage (data is anonymised or aggregated where possible)</li>
            <li>Legal authorities — if required by law, court order, or to protect our rights</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. Order-related data is generally retained for a minimum period in line with applicable tax and accounting regulations. You may request deletion of your data at any time (subject to legal obligations).</p>
        </section>

        <section className={styles.section}>
          <h2>6. Data Security</h2>
          <p>We take reasonable technical and organisational measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Your Rights</h2>
          <p>Depending on your location and applicable law, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate or incomplete data</li>
            <li>Request deletion of your personal data</li>
            <li>Withdraw consent for marketing communications at any time</li>
            <li>Lodge a complaint with a relevant data protection authority</li>
          </ul>
          <p>To exercise any of these rights, please email us at <a href="mailto:pinakjewels04@gmail.com">pinakjewels04@gmail.com</a>.</p>
        </section>

        <section className={styles.section}>
          <h2>8. Third-Party Links</h2>
          <p>Our website may contain links to third-party websites (e.g., social media platforms). We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies independently.</p>
        </section>

        <section className={styles.section}>
          <h2>9. Children's Privacy</h2>
          <p>Our website is not directed at children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it promptly.</p>
        </section>

        <section className={styles.section}>
          <h2>10. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.</p>
        </section>

        <section className={styles.section}>
          <h2>11. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please email us at <a href="mailto:pinakjewels04@gmail.com">pinakjewels04@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
