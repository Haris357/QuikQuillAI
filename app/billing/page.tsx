"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Lock,
  ArrowLeft,
  Receipt,
  Building2,
  Mail,
  CreditCardIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserSubscription, formatTokenCount, getDaysRemainingInTrial } from '@/lib/subscription';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { UserSubscription } from '@/types';
import Link from 'next/link';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  period: string;
  invoiceNumber: string;
  pdfUrl?: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;

    setPortalLoading(true);
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
      } else {
        alert('Stripe is not configured. Please check your environment variables.');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would download the invoice
    console.log('Downloading invoice:', invoiceId);
    alert('Invoice download functionality will be implemented with Stripe integration');
  };

  // Mock invoices - in a real app, these would come from Stripe API
  const mockInvoices: Invoice[] = subscription?.tier === 'pro' ? [
    {
      id: 'inv_001',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: subscription.stripePriceId?.includes('year') ? 100 : 10,
      status: 'paid',
      period: 'Dec 1, 2024 - Dec 31, 2024',
      invoiceNumber: 'QQ-2024-001',
    },
    {
      id: 'inv_002',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      amount: subscription.stripePriceId?.includes('year') ? 100 : 10,
      status: 'paid',
      period: 'Nov 1, 2024 - Nov 30, 2024',
      invoiceNumber: 'QQ-2024-002',
    },
  ] : [];

  const tier = subscription && subscription.tier in SUBSCRIPTION_TIERS
    ? SUBSCRIPTION_TIERS[subscription.tier as keyof typeof SUBSCRIPTION_TIERS]
    : null;
  const daysInTrial = subscription ? getDaysRemainingInTrial(subscription) : 0;
  const nextBillingDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!subscription || !tier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Subscription Found</h2>
            <p className="text-gray-600 mb-6">
              You don't have an active subscription. Start your free trial today!
            </p>
            <Button onClick={() => router.push('/pricing')} className="bg-green-600 hover:bg-green-700">
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Billing & Invoices
              </h1>
              <p className="text-gray-600">
                Manage your subscription, payment methods, and billing history
              </p>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-semibold">Secure Billing</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${
                  subscription.tier === 'pro' ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600'
                } p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{tier.name} Plan</h2>
                      <p className="text-white/80">
                        {subscription.status === 'active' ? 'Active Subscription' :
                         subscription.status === 'trial' ? `${daysInTrial} days left in trial` :
                         'Subscription Status'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">
                        ${subscription.stripePriceId?.includes('year') ? tier.yearlyPrice : tier.monthlyPrice}
                      </p>
                      <p className="text-white/80 text-sm">
                        per {subscription.stripePriceId?.includes('year') ? 'year' : 'month'}
                      </p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <div className="flex items-center space-x-2">
                        {subscription.status === 'active' || subscription.status === 'trial' ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-gray-900 capitalize">{subscription.status}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <span className="font-semibold text-gray-900 capitalize">{subscription.status}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Token Allowance</p>
                      <p className="font-semibold text-gray-900">{formatTokenCount(subscription.tokensLimit)}/month</p>
                    </div>

                    {nextBillingDate && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {subscription.cancelAtPeriodEnd ? 'Ends On' : 'Next Billing Date'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            {nextBillingDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {subscription.currentPeriodStart && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Billing Period</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {' '}
                          {nextBillingDate?.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900">Subscription Ending</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Your subscription will end on {nextBillingDate?.toLocaleDateString()}. You can reactivate it anytime.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle>Payment Method</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                    >
                      Update
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {subscription.stripeCustomerId ? (
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CreditCardIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/2025</p>
                      </div>
                      <Badge className="ml-auto bg-green-100 text-green-800 border-green-200">
                        <Lock className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No payment method on file</p>
                      <Button
                        onClick={() => router.push('/pricing')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Invoice History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle>Invoice History</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {mockInvoices.length > 0 ? (
                    <div className="divide-y">
                      {mockInvoices.map((invoice) => (
                        <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <FileText className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">#{invoice.invoiceNumber}</p>
                                <p className="text-sm text-gray-600">{invoice.period}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">${invoice.amount.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(invoice.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge
                              className={
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-red-100 text-red-800 border-red-200'
                              }
                            >
                              {invoice.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {invoice.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {invoice.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No invoices yet</p>
                      <p className="text-sm text-gray-500">
                        {subscription.status === 'trial'
                          ? 'Invoices will appear here after your trial ends'
                          : 'Your invoices will appear here once generated'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Button
                    onClick={handleManageBilling}
                    disabled={portalLoading || !subscription.stripeCustomerId}
                    className="w-full justify-start bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {portalLoading ? 'Loading...' : 'Billing Portal'}
                  </Button>
                  <Button
                    onClick={() => router.push('/pricing')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Change Plan
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Billing Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Billing Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-900">{user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Customer ID</p>
                      <p className="text-sm text-gray-900 font-mono">
                        {subscription.stripeCustomerId?.slice(0, 20) || 'Not available'}
                      </p>
                    </div>
                  </div>
                  {subscription.stripeSubscriptionId && (
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Subscription ID</p>
                        <p className="text-sm text-gray-900 font-mono">
                          {subscription.stripeSubscriptionId.slice(0, 20)}...
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-blue-600">
                <CardContent className="p-6 text-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="h-6 w-6" />
                    <h3 className="font-bold text-lg">Secure Payments</h3>
                  </div>
                  <p className="text-sm text-green-100 mb-4">
                    All payments are processed securely through Stripe. We never store your payment information.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-green-100">
                    <Lock className="h-4 w-4" />
                    <span>SSL Encrypted</span>
                    <span>•</span>
                    <span>PCI Compliant</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our support team is here to assist you with any billing questions.
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
