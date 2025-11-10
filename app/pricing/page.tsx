"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Infinity,
  ArrowLeft,
  Shield,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      router.push('/');
      return;
    }

    if (tier === 'free') {
      // User is already on free trial when they sign up
      router.push('/dashboard');
      return;
    }

    setLoading(tier);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          userId: user.uid,
          billingPeriod,
        }),
      });

      const data = await response.json();

      // Check if the API returned an error
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned. Please check your Stripe configuration.');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error?.message || 'Failed to start checkout. Please try again.';
      alert(errorMessage);
      setLoading(null);
    }
  };

  const plans = [
    {
      tier: 'free',
      name: SUBSCRIPTION_TIERS.free.name,
      monthlyPrice: SUBSCRIPTION_TIERS.free.monthlyPrice,
      yearlyPrice: SUBSCRIPTION_TIERS.free.yearlyPrice,
      tokens: SUBSCRIPTION_TIERS.free.tokens.toLocaleString(),
      features: SUBSCRIPTION_TIERS.free.features,
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      popular: false,
    },
    {
      tier: 'pro',
      name: SUBSCRIPTION_TIERS.pro.name,
      monthlyPrice: SUBSCRIPTION_TIERS.pro.monthlyPrice,
      yearlyPrice: SUBSCRIPTION_TIERS.pro.yearlyPrice,
      tokens: SUBSCRIPTION_TIERS.pro.tokens.toLocaleString(),
      features: SUBSCRIPTION_TIERS.pro.features,
      icon: Crown,
      color: 'from-green-500 to-green-600',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
            <Clock className="h-3 w-3 mr-1" />
            3-Day Free Trial • 1 Agent • 10 Tasks
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a 3-day free trial (1 agent, 10 tasks), then upgrade to Pro for unlimited access.
            All plans include monthly token credits.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-green-100 text-green-800 border-0 text-xs">
                  Save 17%
                </Badge>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <Badge className="bg-green-600 text-white border-0 px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full flex flex-col ${
                  plan.popular
                    ? 'border-2 border-green-600 shadow-xl scale-105'
                    : 'border-gray-200 shadow-lg'
                } hover:shadow-2xl transition-all duration-300`}
              >
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-500 ml-2">
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && plan.tier !== 'free' && (
                    <p className="text-sm text-green-600 mt-1 font-semibold">
                      ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)} savings per year
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.tokens} tokens/month
                  </p>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={loading === plan.tier}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    } text-white`}
                  >
                    {loading === plan.tier ? (
                      'Processing...'
                    ) : plan.tier === 'free' ? (
                      'Start Free Trial'
                    ) : (
                      `Start 3-Day Trial`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What are tokens?
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Tokens are used to measure AI usage. On average:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li><strong>1 token</strong> ≈ 0.75 words</li>
              <li><strong>100 tokens</strong> ≈ 75 words (a short paragraph)</li>
              <li><strong>1,000 tokens</strong> ≈ 750 words (a blog post)</li>
              <li><strong>10,000 tokens</strong> ≈ 7,500 words (a long article)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Your monthly token allowance resets on your billing date. Unused tokens don't roll over, but you can upgrade anytime for more capacity.
            </p>
          </div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-600">
                All payments processed securely through Stripe
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">3-Day Free Trial</h3>
              <p className="text-sm text-gray-600">
                Try any paid plan risk-free for 3 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Cancel Anytime</h3>
              <p className="text-sm text-gray-600">
                No long-term contracts or commitments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gray-50 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does the trial work?</h3>
              <p className="text-gray-600 text-sm">
                All paid plans include a 3-day free trial. You won't be charged until the trial ends. Cancel anytime during the trial period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time from your account settings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I run out of tokens?</h3>
              <p className="text-gray-600 text-sm">
                You can upgrade to a higher plan for more tokens, or wait until your monthly allowance resets on your billing date.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do unused tokens roll over?</h3>
              <p className="text-gray-600 text-sm">
                No, tokens reset monthly on your billing date. Choose a plan that matches your average monthly usage.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
