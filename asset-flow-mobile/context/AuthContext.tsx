import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'asset-flow-mobile-token';

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // We should replace this with the actual machine's IP where your API runs
  // React Native fetch cannot use "localhost" directly on Android emulator
  // To avoid issues, 10.0.2.2 usually maps to the host machine in Android emulators.
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';
  console.log(`[AuthContext] API_URL is: ${API_URL}`);
  
  useEffect(() => {
    console.log(`[AuthContext] Token state changed: ${token ? 'Populated (Length: ' + token.length + ')' : 'NULL'}`);
  }, [token]);

  useEffect(() => {
    // Load token from secure storage on mount
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log(`[AuthContext] Attempting login to: ${API_URL}/auth/login`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal as any,
      });

      clearTimeout(timeoutId);
      console.log(`[AuthContext] Login response status: ${response.status}`);

      if (!response.ok) {
        const errData = await response.text();
        console.error(`[AuthContext] Login failed with body:`, errData);
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[AuthContext] Login successful. Saving token...`);
      const accessToken = data.accessToken;
      
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      setToken(accessToken);
      console.log(`[AuthContext] Token saved successfully.`);
    } catch (error: any) {
       clearTimeout(timeoutId);
       let message = error.message || String(error);
       if (error.name === 'AbortError') {
         message = `Connection timed out matching ${API_URL}. Ensure your computer and device share a network, or check your API IP.`;
       }
       console.error("[AuthContext] SignIn caught an error:", message);
       throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
    } catch (error) {
      console.error("Signout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
