/**
 * Authentication Context
 * Manages user authentication with Supabase Auth (production) and basic auth (fallback)
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  // New Supabase Auth interface
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Legacy basic auth interface (backward compatibility)
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Basic auth credentials (fallback for development)
const BASIC_AUTH_USERNAME = 'admin';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [basicAuthAuthenticated, setBasicAuthAuthenticated] = useState(false);

  // Check if using Supabase Auth or basic auth
  const usingSupabaseAuth = isSupabaseConfigured();

  useEffect(() => {
    if (usingSupabaseAuth) {
      // Initialize Supabase Auth
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        const role = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
        setIsAdmin(role === 'admin');
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        const role = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
        setIsAdmin(role === 'admin');
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Check basic auth from localStorage
      const isAuth = localStorage.getItem('isAdminAuthenticated') === 'true';
      setBasicAuthAuthenticated(isAuth);
      setIsAdmin(isAuth);
      setLoading(false);
    }
  }, [usingSupabaseAuth]);

  // Supabase Auth signIn
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if user has admin role in metadata
      const userRole = data.user?.user_metadata?.role || data.user?.app_metadata?.role;
      
      if (userRole !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: Admin access required');
      }
    } finally {
      setLoading(false);
    }
  };

  // Supabase Auth signOut
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  // Legacy basic auth login (backward compatibility)
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (usingSupabaseAuth) {
        // Try Supabase Auth with email format
        try {
          await signIn(username, password);
          return { success: true };
        } catch (error: any) {
          return { 
            success: false, 
            error: error.message || 'Invalid credentials. Please check your email and password.'
          };
        }
      } else {
        // Fallback to basic auth
        if (username === BASIC_AUTH_USERNAME && password === 'impact2024') {
          localStorage.setItem('isAdminAuthenticated', 'true');
          setBasicAuthAuthenticated(true);
          setIsAdmin(true);
          return { success: true };
        } else {
          return { success: false, error: 'Invalid username or password' };
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Legacy basic auth logout
  const logout = useCallback(() => {
    if (usingSupabaseAuth) {
      signOut();
    } else {
      localStorage.removeItem('isAdminAuthenticated');
      setBasicAuthAuthenticated(false);
      setIsAdmin(false);
    }
    // Clear any potential sensitive data from localStorage/sessionStorage
    sessionStorage.clear();
  }, [usingSupabaseAuth, signOut]);

  const isAuthenticated = usingSupabaseAuth ? !!user && isAdmin : basicAuthAuthenticated;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      signIn, 
      signOut,
      isAuthenticated,
      login,
      logout,
      isLoading: loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};