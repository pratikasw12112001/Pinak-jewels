'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedName = localStorage.getItem(`pinak-name-${firebaseUser.uid}`) || '';
        setUser({
          uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber,
          name: storedName,
        });
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const updateName = useCallback((uid, name) => {
    localStorage.setItem(`pinak-name-${uid}`, name);
    setUser(prev => prev ? { ...prev, name } : prev);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, updateName, logout, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
