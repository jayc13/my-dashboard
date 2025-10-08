import React, { useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL, API_KEY_STORAGE_KEY } from '../utils/constants';
import { AuthContext, type AuthContextType } from './AuthContextDefinition';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored API key on mount
  useEffect(() => {
    const checkStoredApiKey = async () => {
      try {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
          setApiKey(storedKey);
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredApiKey().then();
  }, []);

  const validateApiKeyWithServer = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: key }),
      });

      const data = await response.json();
      return data.valid === true;
    } catch {
      return false;
    }
  };

  const login = async (key: string): Promise<{ success: boolean; error?: string }> => {
    const isValid = await validateApiKeyWithServer(key);

    if (isValid) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      setApiKey(key);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, error: 'Failed to validate API key. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    apiKey,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
