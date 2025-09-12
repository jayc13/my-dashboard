import { createContext } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  apiKey: string | null;
  login: (apiKey: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
