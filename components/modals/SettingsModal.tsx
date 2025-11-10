"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import {
  User,
  Bell,
  Key,
  Save,
  CreditCard,
  Crown,
  Zap,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserSubscription } from '@/types';
import { useEffect, useState as useStateImport } from 'react';
import { getUserSubscription, formatTokenCount, getDaysRemainingInTrial } from '@/lib/subscription';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [subscription, setSubscription] = useStateImport<UserSubscription | null>(null);
  const [loadingPortal, setLoadingPortal] = useStateImport(false);
  const [settings, setSettings] = useState({
    // Profile settings
    displayName: user?.displayName || '',
    email: user?.email || '',

    // Notification settings
    taskCompletions: true,

    // AI settings
    defaultWritingStyle: 'professional',
    defaultTone: 'friendly',
    autoSave: true,
    aiSuggestions: true
  });

  // Load subscription
  useEffect(() => {
    if (!user || !open) return;

    const loadSubscription = async () => {
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
    };

    loadSubscription();
  }, [user, open]);

  const handleSave = () => {
    // Save settings logic here
    toast.success('Settings saved successfully!');
    onClose();
  };

  const handleManageBilling = async () => {
    if (!user) return;

    setLoadingPortal(true);
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
        router.push('/billing');
      }
    } catch (error) {
      console.error('Portal error:', error);
      router.push('/billing');
    } finally {
      setLoadingPortal(false);
    }
  };

  const isPro = subscription?.tier === 'pro';
  const isTrial = subscription?.status === 'trial';
  const daysRemaining = isTrial ? getDaysRemainingInTrial(subscription) : 0;
  const tier = subscription ? SUBSCRIPTION_TIERS[subscription.tier] : null;
  const tokensRemaining = subscription ? (subscription.tokensLimit === -1 ? -1 : subscription.tokensLimit - subscription.tokensUsedThisPeriod) : 0;
  const tokenUsagePercent = subscription && subscription.tokensLimit !== -1
    ? (subscription.tokensUsedThisPeriod / subscription.tokensLimit) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Settings</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              AI Preferences
            </TabsTrigger>
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Your account details from Google Sign-In
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                      <AvatarFallback className="bg-green-600 text-white text-xl">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user?.displayName}</h3>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName" className="text-gray-700">Display Name</Label>
                      <Input
                        id="displayName"
                        value={settings.displayName}
                        disabled
                        className="mt-1 bg-gray-50"
                        title="Managed by your Google account"
                      />
                      <p className="text-xs text-gray-500 mt-1">Update your display name in your Google account</p>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        disabled
                        className="mt-1 bg-gray-50"
                        title="Managed by your Google account"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email is managed by your Google account</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isPro ? <Crown className="h-5 w-5 text-yellow-600" /> : <CreditCard className="h-5 w-5 text-green-600" />}
                      <CardTitle>Subscription & Billing</CardTitle>
                    </div>
                    {isPro && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                        <Crown className="h-3 w-3 mr-1" />
                        PRO
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Manage your subscription and view billing details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {subscription && tier ? (
                    <>
                      {/* Current Plan */}
                      <div className={`p-4 rounded-lg border-2 ${
                        isPro ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{tier.name} Plan</h4>
                            <p className="text-sm text-gray-600">
                              {subscription.status === 'active' ? 'Active Subscription' :
                               subscription.status === 'trial' ? `${daysRemaining} days left in trial` :
                               'Subscription Status'}
                            </p>
                          </div>
                          {subscription.status === 'active' || subscription.status === 'trial' ? (
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                          ) : null}
                        </div>

                        {isTrial && daysRemaining <= 2 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3 flex items-start space-x-2">
                            <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-yellow-900">Trial Ending Soon!</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                {daysRemaining === 0 ? 'Last day of trial' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in trial`}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Price</p>
                            <p className="font-semibold text-gray-900">
                              {isPro ? (
                                `$${subscription.stripePriceId?.includes('year') ? tier.yearlyPrice : tier.monthlyPrice}/${subscription.stripePriceId?.includes('year') ? 'year' : 'month'}`
                              ) : (
                                'Free Trial'
                              )}
                            </p>
                          </div>
                          {subscription.currentPeriodEnd && (
                            <div>
                              <p className="text-gray-600">
                                {subscription.cancelAtPeriodEnd ? 'Ends On' : 'Next Billing'}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Token Usage */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">Token Usage</h4>
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
                            <Progress value={tokenUsagePercent} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{formatTokenCount(subscription.tokensUsedThisPeriod)} used</span>
                              <span>{formatTokenCount(subscription.tokensLimit)} total</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Plan Features */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Plan Features
                        </h4>
                        <ul className="space-y-2">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="text-green-600 mr-2 mt-0.5">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t">
                        {!isPro ? (
                          <Button
                            onClick={() => {
                              onClose();
                              router.push('/pricing');
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => {
                                onClose();
                                router.push('/pricing');
                              }}
                              variant="outline"
                              className="flex-1"
                            >
                              Change Plan
                            </Button>
                            <Button
                              onClick={handleManageBilling}
                              disabled={loadingPortal}
                              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                            >
                              {loadingPortal ? 'Loading...' : (
                                <>
                                  Manage Billing
                                  <ExternalLink className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-green-600" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose which notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Task Completions</h4>
                      <p className="text-sm text-gray-600">Get notified when AI completes tasks</p>
                    </div>
                    <Switch
                      checked={settings.taskCompletions}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, taskCompletions: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-green-600" />
                    AI Writing Preferences
                  </CardTitle>
                  <CardDescription>
                    Set your default AI writing preferences for new agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-gray-700">Default Writing Style</Label>
                    <Select value={settings.defaultWritingStyle} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultWritingStyle: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">This will be the default style for new agents</p>
                  </div>

                  <div>
                    <Label className="text-gray-700">Default Tone</Label>
                    <Select value={settings.defaultTone} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultTone: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">This will be the default tone for new agents</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Auto-save</h4>
                        <p className="text-sm text-gray-600">Automatically save changes as you type</p>
                      </div>
                      <Switch
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">AI Suggestions</h4>
                        <p className="text-sm text-gray-600">Show AI writing suggestions while editing</p>
                      </div>
                      <Switch
                        checked={settings.aiSuggestions}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, aiSuggestions: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="border-gray-200 hover:bg-gray-50">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
