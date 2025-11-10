"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Crown,
  Zap,
  Calendar,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserSubscription, getTokensRemaining, formatTokenCount, getDaysRemainingInTrial } from '@/lib/subscription';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { UserSubscription } from '@/types';

export function SubscriptionCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = SUBSCRIPTION_TIERS[subscription.tier];
  const tokensRemaining = getTokensRemaining(subscription);
  const tokenUsagePercent = subscription.tokensLimit === -1
    ? 0
    : (subscription.tokensUsedThisPeriod / subscription.tokensLimit) * 100;
  const daysInTrial = getDaysRemainingInTrial(subscription);
  const isFreeTier = subscription.tier === 'free';

  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${
        subscription.tier === 'pro' ? 'from-green-500 to-green-600' :
        'from-gray-500 to-gray-600'
      } p-6 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            {subscription.tier === 'pro' ? <Crown className="h-6 w-6" /> :
             <Sparkles className="h-6 w-6" />}
            <h3 className="text-2xl font-bold">{tier.name}</h3>
          </div>
          {subscription.status === 'trial' && (
            <Badge className="bg-white/20 text-white border-white/30">
              Trial
            </Badge>
          )}
        </div>
        <p className="text-white/80 text-sm">
          {subscription.status === 'active' ? 'Active Subscription' :
           subscription.status === 'trial' ? `${daysInTrial} days left in trial` :
           'Subscription Status'}
        </p>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Trial Warning */}
        {subscription.status === 'trial' && daysInTrial <= 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">Trial ending soon!</p>
              <p className="text-xs text-yellow-700 mt-1">
                Your trial ends in {daysInTrial} {daysInTrial === 1 ? 'day' : 'days'}. Upgrade to continue using QuikQuill.
              </p>
            </div>
          </div>
        )}

        {/* Token Usage */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Token Usage</p>
              <p className="text-xs text-gray-500">
                {subscription.tokensLimit === -1 ? 'Unlimited' : 'Monthly allowance'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {formatTokenCount(tokensRemaining)}
              </p>
              <p className="text-xs text-gray-500">remaining</p>
            </div>
          </div>

          {subscription.tokensLimit !== -1 && (
            <>
              <Progress value={tokenUsagePercent} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatTokenCount(subscription.tokensUsedThisPeriod)} used</span>
                <span>{formatTokenCount(subscription.tokensLimit)} total</span>
              </div>
            </>
          )}
        </div>

        {/* Plan Features */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">Plan Features</p>
          <ul className="space-y-2">
            {tier.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="text-xs text-gray-600 flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Billing Period */}
        {subscription.currentPeriodEnd && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 bg-gray-50 border-t space-x-3">
        {isFreeTier ? (
          <Button
            onClick={handleUpgrade}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Plan
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <>
            <Button
              onClick={handleUpgrade}
              variant="outline"
              className="flex-1"
            >
              Change Plan
            </Button>
            <Button
              onClick={handleManageSubscription}
              disabled={loading}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  Manage
                  <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
