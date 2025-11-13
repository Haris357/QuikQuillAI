"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/contexts/DataContext';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import {
  Plus,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Award,
  Activity,
  Zap,
  BarChart3,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserSubscription, formatTokenCount } from '@/lib/subscription';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { UserSubscription } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { agents, tasks } = useData();
  const [showTutorial, setShowTutorial] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [syncingSubscription, setSyncingSubscription] = useState(false);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    // Show tutorial for new users
    if (user && !localStorage.getItem('quikquill-tutorial-completed')) {
      setShowTutorial(true);
    }

    // Check for subscription success from Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Poll for subscription update (webhook might take a few seconds)
      let attempts = 0;
      const maxAttempts = 10; // Try for 10 seconds

      const pollSubscription = async () => {
        attempts++;

        if (user) {
          const latestSub = await getUserSubscription(user.uid);

          // Check if subscription is updated to pro
          if (latestSub?.tier === 'pro' || attempts >= maxAttempts) {
            setSubscription(latestSub);
            // Clean up URL and show success message
            window.history.replaceState({}, '', '/dashboard?subscribed=true');

            // Auto-clean success message after 5 seconds
            setTimeout(() => {
              window.history.replaceState({}, '', '/dashboard');
            }, 5000);
          } else {
            // Try again after 1 second
            setTimeout(pollSubscription, 1000);
          }
        }
      };

      // Start polling after initial delay for webhook
      setTimeout(pollSubscription, 2000);
    } else if (urlParams.get('subscribed') === 'true') {
      // Show success message
      setTimeout(() => {
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard');
      }, 5000);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getUserSubscription(user.uid).then(setSubscription);
    }
  }, [user]);

  // Show subscription success message
  const showSubscriptionSuccess = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('subscribed') === 'true';

  const tier = subscription && subscription.tier in SUBSCRIPTION_TIERS
    ? SUBSCRIPTION_TIERS[subscription.tier as keyof typeof SUBSCRIPTION_TIERS]
    : null;
  const agentLimit = tier?.limits.agents ?? -1;
  const taskLimit = tier?.limits.tasks ?? -1;
  const showAgentLimit = agentLimit !== -1;
  const showTaskLimit = taskLimit !== -1;

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('quikquill-tutorial-completed', 'true');
  };

  const handleSyncSubscription = async () => {
    if (!user || !user.email) return;

    setSyncingSubscription(true);
    try {
      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh subscription data
        const latestSub = await getUserSubscription(user.uid);
        setSubscription(latestSub);

        if (data.subscription?.tier === 'pro') {
          alert('✅ Subscription synced! You now have Pro access.');
        } else {
          alert('ℹ️ Subscription synced. No active Pro subscription found.');
        }
      } else {
        alert('Failed to sync: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync subscription. Please try again.');
    } finally {
      setSyncingSubscription(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Subscription Success Banner */}
        {showSubscriptionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">🎉 Welcome to Pro!</h3>
                  <p className="text-green-100">
                    Your subscription is now active. You have unlimited access to all features!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manual Sync Banner (if not showing Pro after checkout) */}
        {!showSubscriptionSuccess && subscription?.tier === 'free' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') === 'true' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Processing Your Subscription</h3>
                  <p className="text-blue-100">
                    Your payment was successful! If you don't see Pro access, click Sync below.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSyncSubscription}
                disabled={syncingSubscription}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                {syncingSubscription ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Welcome back, {user?.displayName || 'User'}! 👋
              </h2>
              <p className="text-green-700">
                You have {pendingTasks} pending tasks and {agents.length} active AI agents working for you.
              </p>
              <div className="flex items-center gap-2 mt-2">
                {subscription?.tier === 'pro' ? (
                  <Badge className="bg-green-600 text-white border-0">
                    <Award className="h-3 w-3 mr-1" />
                    Pro Member
                  </Badge>
                ) : (
                  <Badge className="bg-gray-600 text-white border-0">
                    Free Trial
                  </Badge>
                )}
                <span className="text-sm text-green-700">
                  {subscription?.tier === 'pro'
                    ? `${formatTokenCount(tier?.tokens ?? 0)} tokens/month • Unlimited agents & tasks`
                    : `${formatTokenCount(tier?.tokens ?? 0)} tokens/month • ${tier?.limits.agents} agent • ${tier?.limits.tasks} tasks`
                  }
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              {subscription?.tier === 'free' ? (
                <Button
                  onClick={() => router.push('/pricing')}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/agents?create=true')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Agent
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-upwork hover:shadow-upwork-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Agents</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {agents.length}
                      {showAgentLimit && <span className="text-xl text-gray-500">/{agentLimit}</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {showAgentLimit ? `${agentLimit - agents.length} remaining` : 'AI writers created'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-upwork hover:shadow-upwork-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalTasks}
                      {showTaskLimit && <span className="text-xl text-gray-500">/{taskLimit}</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {showTaskLimit ? `${taskLimit - totalTasks} remaining` : 'Writing tasks created'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-upwork hover:shadow-upwork-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
                    <p className="text-xs text-green-600 mt-1">
                      <Award className="h-3 w-3 inline mr-1" />
                      {Math.round(completionRate)}% rate
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-upwork hover:shadow-upwork-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingTasks}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      In progress
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subscription Status Card */}
        {subscription?.tier === 'free' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-green-600 shadow-xl bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Unlock Full Power 🚀</h3>
                    <p className="text-sm text-gray-600">Upgrade to Pro for unlimited access</p>
                  </div>
                  <Badge className="bg-green-600 text-white border-0">
                    Limited Time
                  </Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-gray-700">Unlimited AI agents</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-gray-700">Unlimited tasks</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-gray-700">1M tokens/month (20x more)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-gray-700">Priority support</span>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/pricing')}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Pro - $10/month
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-green-600 shadow-xl bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center">
                      <Award className="h-5 w-5 text-green-600 mr-2" />
                      Pro Membership
                    </h3>
                    <p className="text-sm text-gray-600">You have full access to all features</p>
                  </div>
                  <Badge className="bg-green-600 text-white border-0">
                    Active
                  </Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      AI Agents
                    </span>
                    <span className="font-semibold text-green-700">Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Tasks
                    </span>
                    <span className="font-semibold text-green-700">Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Tokens
                    </span>
                    <span className="font-semibold text-green-700">1M/month</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Support
                    </span>
                    <span className="font-semibold text-green-700">Priority</span>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/billing')}
                  variant="outline"
                  className="w-full border-green-600 text-green-700 hover:bg-green-50"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-upwork">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No tasks yet</p>
                    <p className="text-sm text-gray-500">Create an agent and add your first task to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => router.push('/tasks')}>
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-blue-500' : 'bg-orange-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                          <p className="text-xs text-gray-500">
                            {agents.find(a => a.id === task.agentId)?.name || 'Unknown'} • {new Date(task.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`text-xs ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="shadow-upwork">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push('/agents?create=true')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create AI Agent
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  onClick={() => router.push('/tasks')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All Tasks
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  onClick={() => router.push('/agents')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Agents
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TutorialModal open={showTutorial} onClose={handleTutorialClose} />
    </>
  );
}
