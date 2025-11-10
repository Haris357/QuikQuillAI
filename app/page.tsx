"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfessionalLandingPage } from '@/components/landing/ProfessionalLandingPage';
import { SignInPage } from '@/components/auth/SignInPage';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<'landing' | 'signin'>('landing');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Redirect to dashboard if authenticated
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    if (signInWithGoogle) {
      setAuthLoading(true);
      setAuthError(undefined);
      try {
        await signInWithGoogle();
        // After successful sign in, redirect to dashboard
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Sign in error:', error);
        setAuthError(error.message || 'Failed to sign in. Please try again.');
      } finally {
        setAuthLoading(false);
      }
    } else {
      // Redirect to dashboard even if Firebase is not configured (demo mode)
      router.push('/dashboard');
    }
  };

  const handleGoToSignIn = () => {
    setCurrentPage('signin');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setAuthError(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading QuikQuill...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your AI writing workspace</p>
        </motion.div>
      </div>
    );
  }

  // Show sign in page
  if (currentPage === 'signin') {
    return (
      <SignInPage
        onBack={handleBackToLanding}
        onSignIn={handleSignIn}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // Show landing page
  return <ProfessionalLandingPage onSignIn={handleGoToSignIn} />;
}