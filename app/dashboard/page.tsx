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
import { getUserSubscription } from '@/lib/subscription';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { UserSubscription } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { agents, tasks } = useData();
  const [showTutorial, setShowTutorial] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    // Show tutorial for new users
    if (user && !localStorage.getItem('quikquill-tutorial-completed')) {
      setShowTutorial(true);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getUserSubscription(user.uid).then(setSubscription);
    }
  }, [user]);

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

  return (
    <>
      <div className="space-y-6">
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
            </div>
            <div className="hidden md:block">
              <Button
                onClick={() => router.push('/agents?create=true')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Agent
              </Button>
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
