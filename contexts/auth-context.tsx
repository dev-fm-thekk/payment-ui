"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginCredentials, RegisterCredentials } from '@/services/auth-service';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists on mount and fetch user profile if needed
    // In this basic implementation, we just check if token is present
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      // Mock user restore based on token presence. 
      // In a real app, decode JWT or call a /user/me endpoint.
      setUser({ id: '1', email: 'user@example.com' }); 
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const data = await authService.login(credentials);
      
      // Save tokens in cookies for the middleware to read
      if (data.accessToken) {
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=3600; Secure; SameSite=Lax`;
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=604800; Secure; SameSite=Lax`;
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Set user from data (or decode token)
      setUser(data.user || { id: '1', email: credentials.email });
      router.push('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      await authService.register(credentials);
      // Usually after register you either login automatically or redirect to login
      router.push('/login');
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
