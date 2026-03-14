'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithCredentials, register, isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <div className={styles.authPage}>
        <div className={styles.card}>
          <img src="/logo-pinak.png" alt="Pinak Jewels" className={styles.logo} />
          <h2>Welcome, {user?.name}!</h2>
          <p className={styles.email}>{user?.email}</p>
          <button className="btn btn-primary" style={{width:'100%',marginTop:'20px'}} onClick={logout}>Sign Out</button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        loginWithCredentials(email, password);
      } else {
        if (!name.trim()) { setError('Please enter your name'); return; }
        register({ name: name.trim(), email, password });
      }
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>
        <img src="/logo-pinak.png" alt="Pinak Jewels" className={styles.logo} />
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className={styles.subtitle}>{isLogin ? 'Sign in to your account' : 'Join the Pinak Jewels family'}</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.field}>
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
            </div>
          )}
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" minLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%'}}>{isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>

        <p className={styles.toggle}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }}>{isLogin ? 'Sign Up' : 'Sign In'}</button>
        </p>
      </div>
    </div>
  );
}
