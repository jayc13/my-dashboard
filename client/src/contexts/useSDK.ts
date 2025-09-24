import { useContext } from 'react';
import { SDKContext } from './SDKContext';
import type { SDKContextType } from './SDKContext';

export const useSDK = (): SDKContextType => {
  const context = useContext(SDKContext);
  if (context === undefined) {
    throw new Error('useSDK must be used within a SDKProvider');
  }
  return context;
};
