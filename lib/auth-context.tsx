'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, signInAnonymousUser } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if auth is available (client-side only)
    if (!auth) {
      console.log('Firebase auth not available, continuing as anonymous user');
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      // Handle auth state changes
      unsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
          // User is signed in
          console.log('User is signed in:', authUser.uid);
          setUser(authUser);
          setLoading(false);
        } else {
          // No user is signed in, automatically sign in anonymously
          signInAnonymousUser()
            .then((anonymousUser) => {
              if (anonymousUser) {
                console.log('Signed in anonymously:', anonymousUser.uid);
                setUser(anonymousUser);
              }
              setLoading(false);
            })
            .catch((error) => {
              console.error('Error signing in anonymously:', error);
              setLoading(false);
            });
        }
      });
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setLoading(false);
    }

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth state changes:', error);
        }
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 