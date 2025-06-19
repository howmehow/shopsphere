import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { API_BASE_URL } from '../constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    const storedUser = localStorage.getItem('shopsphere-user');
    const storedToken = localStorage.getItem('shopsphere-token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        
        if (parsedUser && parsedUser.id && parsedUser.username && parsedUser.role) {
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          console.warn("Invalid user data in localStorage. Clearing.");
          localStorage.removeItem('shopsphere-user');
          localStorage.removeItem('shopsphere-token');
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('shopsphere-user');
        localStorage.removeItem('shopsphere-token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      
      if (data.user && data.token) {
        const userWithRole: User = {
          id: data.user.id,
          username: data.user.username,
          role: data.user.role,
        };
        
        setUser(userWithRole);
        setToken(data.token);
        localStorage.setItem('shopsphere-user', JSON.stringify(userWithRole));
        localStorage.setItem('shopsphere-token', data.token);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shopsphere-user');
    localStorage.removeItem('shopsphere-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
