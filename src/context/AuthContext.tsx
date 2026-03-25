import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, orgSubdomain: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.user) {
        setUser({ email: data.user } as User);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, orgSubdomain: string) => {
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-org-subdomain': orgSubdomain
      },
      body: JSON.stringify({ email })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to send magic link');
    }
  };

  const loginWithPassword = async (email: string, password: string, orgSubdomain: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-org-subdomain': orgSubdomain
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Invalid email or password');
    }
    
    const data = await res.json();
    setUser(data.user);
    window.location.href = '/dashboard';
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithPassword, logout }}>
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
