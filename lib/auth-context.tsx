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
    // Handle auth state changes
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // User is signed in
        setUser(authUser);
      } else {
        // No user is signed in, automatically sign in anonymously
        signInAnonymousUser()
          .then((anonymousUser) => {
            if (anonymousUser) {
              console.log('Signed in anonymously:', anonymousUser.uid);
              setUser(anonymousUser);
            }
          })
          .catch((error) => {
            console.error('Error signing in anonymously:', error);
          });
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 