import { createContext } from 'react';
import type { MyDashboardAPI } from '@my-dashboard/sdk';

export interface SDKContextType {
  api: MyDashboardAPI | null;
  isReady: boolean;
}

export const SDKContext = createContext<SDKContextType | undefined>(undefined);
