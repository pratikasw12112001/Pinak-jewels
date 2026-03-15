'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './Toast.module.css';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, linkText, linkHref) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, linkText, linkHref }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <div key={toast.id} className={styles.toast}>
            <span className={styles.checkIcon}>✓</span>
            <span className={styles.message}>{toast.message}</span>
            {toast.linkText && toast.linkHref && (
              <Link href={toast.linkHref} className={styles.link} onClick={() => removeToast(toast.id)}>
                {toast.linkText} →
              </Link>
            )}
            <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
