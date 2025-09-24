import { useContext } from 'react';
import { SDKContext, type SDKContextType } from './sdk-context';

export const useSDK = (): SDKContextType => {
  const context = useContext(SDKContext);
  if (context === undefined) {
    throw new Error('useSDK must be used within a SDKProvider');
  }
  return context;
};
