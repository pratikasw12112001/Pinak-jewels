'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      // Previously this always showed "message sent", even on failure — the
      // customer believed they had reached us when nothing was delivered.
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Could not send your message. Please email us directly at pinakjewels04@gmail.com.');
      }
    } catch (_) {
      setError('Network error. Please check your connection, or email pinakjewels04@gmail.com.');
    }
    setLoading(false);
  };

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

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
              <p>Mon – Sat: 10 AM – 7 PM</p>
            </div>
          </div>

          {submitted ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}>✓</div>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you within 24 hours at <strong>{form.email}</strong>.</p>
              <button className="btn btn-outline" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <h3>Send a Message</h3>
              {error && (
                <div style={{background:'#fef2f2',color:'#dc2626',padding:'12px 16px',borderRadius:'8px',fontSize:'13px',marginBottom:'16px',lineHeight:1.6}}>
                  {error}
                </div>
              )}
              <div className={styles.field}>
                <label htmlFor="contact-name">Your Name</label>
                <input id="contact-name" type="text" placeholder="Enter your name" value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-email">Your Email</label>
                <input id="contact-email" type="email" placeholder="Enter your email" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" type="text" placeholder="What is this about?" value={form.subject} onChange={e => update('subject', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" rows={5} placeholder="Tell us more..." value={form.message} onChange={e => update('message', e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
