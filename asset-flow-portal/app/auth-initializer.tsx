'use client';

import React, { useEffect } from 'react';
import { useGetProfileQuery } from '../store/auth/authApiSlice';
import Cookies from 'js-cookie';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const token = Cookies.get('accessToken');
  
  // Skip query if no token to avoid 401 errors on public pages (though /me handles it gracefully usually)
  // But we can just rely on built-in behavior: if no token, apiSlice won't send header, /me returns 401.
  // We only care if we have a token.
  
  const { } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  return <>{children}</>;
}
