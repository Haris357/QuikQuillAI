"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/landing/LandingPage';
import { SignInPage } from '@/components/auth/SignInPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<'landing' | 'signin' | 'dashboard'>('landing');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Show tutorial for new users
    if ((user || demoMode) && !localStorage.getItem('quikquill-tutorial-completed')) {
      setShowTutorial(true);
      setCurrentPage('dashboard');
    } else if (user || demoMode) {
      setCurrentPage('dashboard');
    }
  }, [user, demoMode]);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('quikquill-tutorial-completed', 'true');
  };

  const handleSignIn = async () => {
    if (signInWithGoogle) {
      setAuthLoading(true);
      setAuthError(null);
      try {
        await signInWithGoogle();
      } catch (error: any) {
        console.error('Sign in error:', error);
        setAuthError(error.message || 'Failed to sign in. Please try again.');
      } finally {
        setAuthLoading(false);
      }
    } else {
      // Demo mode for when Firebase is not configured
      setDemoMode(true);
      setCurrentPage('dashboard');
    }
  };

  const handleGoToSignIn = () => {
    setCurrentPage('signin');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setAuthError(null);
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

  // Show dashboard if user is authenticated or in demo mode
  if ((user || demoMode) && currentPage === 'dashboard') {
    return (
      <>
        <Dashboard />
        <TutorialModal open={showTutorial} onClose={handleTutorialClose} />
        {demoMode && !user && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50">
            <p className="text-sm font-medium">Demo Mode - Configure Firebase to enable full functionality</p>
          </div>
        )}
      </>
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
  return <LandingPage onSignIn={handleGoToSignIn} />;
}