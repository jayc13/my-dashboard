import React, { useMemo, type ReactNode } from 'react';
import { MyDashboardAPI } from '@my-dashboard/sdk';
import { API_BASE_URL } from '../utils/constants';
import { useAuth } from './useAuth';
import { SDKContext, type SDKContextType } from './sdk-context';

interface SDKProviderProps {
  children: ReactNode;
}

export const SDKProvider: React.FC<SDKProviderProps> = ({ children }) => {
  const { apiKey, isAuthenticated } = useAuth();

  const api = useMemo(() => {
    if (!isAuthenticated || !apiKey) {
      return null;
    }

    try {
      return new MyDashboardAPI({
        baseUrl: API_BASE_URL,
        apiKey: apiKey,
        retries: 3,
        timeout: 30000,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize SDK:', error);
      return null;
    }
  }, [apiKey, isAuthenticated]);

  const value: SDKContextType = {
    api,
    isReady: isAuthenticated && api !== null,
  };

  return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
};
