'use client';

import { Provider } from 'react-redux';
import { store } from '../store';
import React from 'react';
import AuthInitializer from './auth-initializer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  );
}
