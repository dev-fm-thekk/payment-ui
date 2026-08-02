'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { login as loginService } from '@/services/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  // Add other user fields as needed based on your backend response
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start loading true to wait for hydration
  const [error, setError] = useState<string | null>(null);

  // Hydrate user from localStorage on mount and listen to logout events
  React.useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);

    const handleLogout = () => {
      setCurrentUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await loginService(email, password);
      
      if (response.success) {
        setCurrentUser(response.user);
        
        // Save tokens in localStorage (you may also want to use HttpOnly cookies depending on your setup)
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
        return true;
      } else {
        setError(response.reason);
        return false;
      }
    } catch (err) {
      setError("An unexpected error occurred during login.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      // trigger event so other tabs or fetch clients know
      window.dispatchEvent(new Event('auth:logout'));
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
