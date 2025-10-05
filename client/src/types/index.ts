import React from 'react';

export * from '@my-dashboard/types';

export interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}
