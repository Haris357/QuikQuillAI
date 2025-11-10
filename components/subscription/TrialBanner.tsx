"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Crown, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserSubscription, getDaysRemainingInTrial, isTrialExpired } from '@/lib/subscription';
import { UserSubscription } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export function TrialBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    const sub = await getUserSubscription(user.uid);
    setSubscription(sub);
  };

  if (!subscription || dismissed) return null;

  const daysRemaining = getDaysRemainingInTrial(subscription);
  const trialExpired = isTrialExpired(subscription);
  const showBanner = (subscription.status === 'trial' && daysRemaining <= 2) || trialExpired;

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
      >
        <Alert className={`${
          trialExpired
            ? 'bg-red-50 border-red-200'
            : daysRemaining === 0
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-blue-50 border-blue-200'
        } mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {trialExpired ? (
                <Crown className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              <AlertDescription className="flex-1">
                {trialExpired ? (
                  <div>
                    <p className="font-semibold text-red-900">Your trial has expired</p>
                    <p className="text-sm text-red-700">
                      Upgrade to a paid plan to continue creating with QuikQuill
                    </p>
                  </div>
                ) : daysRemaining === 0 ? (
                  <div>
                    <p className="font-semibold text-yellow-900">Trial ends today!</p>
                    <p className="text-sm text-yellow-700">
                      Upgrade now to keep your AI agents and continue creating
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-blue-900">
                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in your trial
                    </p>
                    <p className="text-sm text-blue-700">
                      Upgrade to unlock unlimited features and keep creating
                    </p>
                  </div>
                )}
              </AlertDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => router.push('/pricing')}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
              <Button
                onClick={() => setDismissed(true)}
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
