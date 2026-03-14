'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pinak-user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('pinak-user');
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        localStorage.setItem('pinak-user', JSON.stringify(user));
      } else {
        localStorage.removeItem('pinak-user');
      }
    }
  }, [user, isLoaded]);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const register = useCallback((userData) => {
    const users = JSON.parse(localStorage.getItem('pinak-users') || '[]');
    const exists = users.find(u => u.email === userData.email);
    if (exists) {
      throw new Error('An account with this email already exists');
    }
    users.push(userData);
    localStorage.setItem('pinak-users', JSON.stringify(users));
    setUser({ name: userData.name, email: userData.email });
  }, []);

  const loginWithCredentials = useCallback((email, password) => {
    const users = JSON.parse(localStorage.getItem('pinak-users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid email or password');
    }
    setUser({ name: found.name, email: found.email });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      register,
      loginWithCredentials,
      logout,
      isLoaded
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
