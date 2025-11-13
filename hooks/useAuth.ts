"use client";

import { useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import { initializeUserSubscription, getUserSubscription } from '@/lib/subscription';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Initialize subscription for new users
        await initializeUserSubscription(firebaseUser.uid);

        // Load subscription data from Supabase
        const subscription = await getUserSubscription(firebaseUser.uid);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
          subscription: subscription || undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      console.warn('Firebase auth not initialized');
      return;
    }
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      console.warn('Firebase auth not initialized');
      return;
    }

    try {
      await firebaseSignOut(auth);
      // Redirect to home page after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshSubscription = async () => {
    if (!user) return;

    try {
      const subscription = await getUserSubscription(user.uid);
      setUser({
        ...user,
        subscription: subscription || undefined,
      });
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    refreshSubscription,
  };
}