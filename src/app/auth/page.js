'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function AuthPage() {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'name'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifier = useRef(null);
  const { isLoggedIn, user, logout, updateName } = useAuth();
  const router = useRouter();

  // Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Initialize RecaptchaVerifier once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    recaptchaVerifier.current.render().catch(() => {});
    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = null;
      }
    };
  }, []);

  const sendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, recaptchaVerifier.current);
      setConfirmationResult(result);
      setStep('otp');
      setResendTimer(30);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      // Reset recaptcha so user can retry
      recaptchaVerifier.current.clear();
      recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      recaptchaVerifier.current.render().catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendTimer > 0) return;
    setError('');
    setOtp('');
    setLoading(true);
    try {
      recaptchaVerifier.current.clear();
      recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      await recaptchaVerifier.current.render();
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, recaptchaVerifier.current);
      setConfirmationResult(result);
      setResendTimer(30);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      const storedName = localStorage.getItem(`pinak-name-${firebaseUser.uid}`);
      if (!storedName) {
        setStep('name');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveName = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (auth.currentUser) {
      updateName(auth.currentUser.uid, name.trim());
    }
    router.push('/');
  };

  if (isLoggedIn) {
    return (
      <div className={styles.authPage}>
        <div className={styles.card}>
          <div className={styles.avatarCircle}>{user?.name ? user.name[0].toUpperCase() : '✦'}</div>
          <h2>Welcome{user?.name ? `, ${user.name}` : ''}!</h2>
          <p className={styles.subtitle}>{user?.phone}</p>
          <Link href="/orders" className="btn btn-outline" style={{ width: '100%', marginTop: '20px' }}>My Orders</Link>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={logout}>Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>

        {/* Step indicator */}
        <div className={styles.steps}>
          <div className={`${styles.step} ${step === 'phone' ? styles.stepActive : styles.stepDone}`}>1</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step === 'otp' ? styles.stepActive : step === 'name' ? styles.stepDone : ''}`}>2</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step === 'name' ? styles.stepActive : ''}`}>3</div>
        </div>

        {/* Step 1 — Phone */}
        {step === 'phone' && (
          <>
            <h2>Sign In</h2>
            <p className={styles.subtitle}>Enter your mobile number to receive an OTP</p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={sendOTP} className={styles.form}>
              <div className={styles.field}>
                <label>Mobile Number</label>
                <div className={styles.phoneRow}>
                  <span className={styles.countryCode}>🇮🇳 +91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP →'}
              </button>
            </form>
          </>
        )}

        {/* Step 2 — OTP */}
        {step === 'otp' && (
          <>
            <h2>Enter OTP</h2>
            <p className={styles.subtitle}>6-digit code sent to <strong>+91 {phone}</strong></p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={verifyOTP} className={styles.form}>
              <div className={styles.field}>
                <label>OTP</label>
                <input
                  type="tel"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className={styles.otpInput}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <div className={styles.otpFooter}>
              <button className={styles.linkBtn} onClick={() => { setStep('phone'); setError(''); setOtp(''); }}>
                ← Change number
              </button>
              <button
                className={styles.linkBtn}
                onClick={resendOTP}
                disabled={resendTimer > 0 || loading}
                style={{ opacity: resendTimer > 0 ? 0.5 : 1 }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Name (new users only) */}
        {step === 'name' && (
          <>
            <h2>What's your name?</h2>
            <p className={styles.subtitle}>We'll use this to personalise your experience</p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={saveName} className={styles.form}>
              <div className={styles.field}>
                <label>Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Continue →
              </button>
            </form>
          </>
        )}

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
