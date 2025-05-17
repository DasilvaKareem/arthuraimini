'use client';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth-context';
import { useEffect } from 'react';

// Store the anonymous user in Firestore
export const useStoreAnonymousUser = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const storeUser = async () => {
      if (user && !loading && db) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Create a new user document if it doesn't exist
          await setDoc(userRef, {
            uid: user.uid,
            createdAt: new Date().toISOString(),
            isAnonymous: user.isAnonymous,
            lastLogin: new Date().toISOString(),
          });
          console.log('Anonymous user stored in Firestore');
        } else {
          // Update the last login time
          await updateDoc(userRef, {
            lastLogin: new Date().toISOString(),
          });
        }
      }
    };

    storeUser();
  }, [user, loading]);

  return { user, loading };
};

// Function to update user information when wallet is connected
export const updateUserWalletAddress = async (uid: string, walletAddress: string) => {
  if (!uid || !walletAddress || !db) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      walletAddress,
      walletConnectedAt: new Date().toISOString(),
    });
    console.log('Wallet address stored for user:', uid);
    return true;
  } catch (error) {
    console.error('Error updating wallet address:', error);
    return false;
  }
}; 