'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo-pinak-transparent.png" alt="Pinak Jewels" className={styles.logoImg} />
        </div>
        <div className={styles.adminBadge}>Admin Portal</div>
        <h1>Sign In</h1>
        <p className={styles.sub}>Access the Pinak Jewels admin dashboard</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email" required autoFocus />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
