'use client';
import styles from './page.module.css';

export default function ContactPage() {
  return (
    <div className="container">
      <div className={styles.contactPage}>
        <div className={styles.header}>
          <h1>Contact Us</h1>
          <p>We would love to hear from you. Reach out to us for any queries, feedback, or assistance.</p>
        </div>
        <div className={styles.layout}>
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✉️</div>
              <h3>Email Us</h3>
              <a href="mailto:pinakjewels04@gmail.com">pinakjewels04@gmail.com</a>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📍</div>
              <h3>Location</h3>
              <p>India</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⏰</div>
              <h3>Business Hours</h3>
              <p>Mon - Sat: 10 AM - 7 PM</p>
            </div>
          </div>
          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); alert('Thank you! We will get back to you soon.'); }}>
            <h3>Send a Message</h3>
            <div className={styles.field}><label>Your Name</label><input type="text" placeholder="Enter your name" required /></div>
            <div className={styles.field}><label>Your Email</label><input type="email" placeholder="Enter your email" required /></div>
            <div className={styles.field}><label>Subject</label><input type="text" placeholder="What is this about?" /></div>
            <div className={styles.field}><label>Message</label><textarea rows={5} placeholder="Tell us more..." required /></div>
            <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
