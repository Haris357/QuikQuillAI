"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  Target, 
  Users, 
  FileText,
  Calendar,
  Award,
  Activity,
  DollarSign,
  Database
} from 'lucide-react';
import { Agent, Task } from '@/types';
import { motion } from 'framer-motion';

interface AnalyticsViewProps {
  agents: Agent[];
  tasks: Task[];
  tokensUsed?: number;
  tokensLimit?: number;
}

export function AnalyticsView({ 
  agents, 
  tasks, 
  tokensUsed = 2450, 
  tokensLimit = 10000 
}: AnalyticsViewProps) {
  // Calculate analytics data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate this week's data
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisWeekTasks = tasks.filter(t => new Date(t.createdAt) >= thisWeekStart);
  const thisWeekCompleted = thisWeekTasks.filter(t => t.status === 'completed').length;
  
  // Calculate agent performance
  const agentPerformance = agents.map(agent => {
    const agentTasks = tasks.filter(t => t.agentId === agent.id);
    const agentCompleted = agentTasks.filter(t => t.status === 'completed').length;
    const agentRate = agentTasks.length > 0 ? (agentCompleted / agentTasks.length) * 100 : 0;
    
    return {
      agent,
      totalTasks: agentTasks.length,
      completedTasks: agentCompleted,
      completionRate: agentRate
    };
  }).sort((a, b) => b.completionRate - a.completionRate);

  // Calculate monthly trends
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear();
    });
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      tasks: monthTasks.length,
      completed: monthTasks.filter(t => t.status === 'completed').length
    };
  }).reverse();

  const statsCards = [
    {
      title: 'Total Agents',
      value: agents.length,
      change: '+2 this month',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      change: `+${thisWeekTasks.length} this week`,
      trend: 'up',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(completionRate)}%`,
      change: completionRate > 75 ? 'Excellent' : completionRate > 50 ? 'Good' : 'Needs improvement',
      trend: completionRate > 75 ? 'up' : 'down',
      icon: Target,
      color: 'purple'
    },
    {
      title: 'API Tokens Used',
      value: tokensUsed.toLocaleString(),
      change: `${Math.round((tokensUsed / tokensLimit) * 100)}% of limit`,
      trend: tokensUsed > tokensLimit * 0.8 ? 'down' : 'up',
      icon: Zap,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Track your AI writing performance and usage</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="shadow-upwork hover:shadow-upwork-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                      )}
                      <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'blue' ? 'bg-blue-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage */}
        <Card className="shadow-upwork">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-600" />
              API Token Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Usage</span>
                <span className="font-semibold">{tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()}</span>
              </div>
              <Progress value={(tokensUsed / tokensLimit) * 100} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{Math.round((tokensUsed / tokensLimit) * 100)}%</p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{(tokensLimit - tokensUsed).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">~{Math.round((tokensLimit - tokensUsed) / 100)}</p>
                  <p className="text-xs text-gray-500">Tasks Left</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="shadow-upwork">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.slice(-3).map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">{month.month}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{month.completed}/{month.tasks}</p>
                      <p className="text-xs text-gray-500">completed</p>
                    </div>
                    <div className="w-20">
                      <Progress 
                        value={month.tasks > 0 ? (month.completed / month.tasks) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="shadow-upwork">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-600" />
            Agent Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentPerformance.slice(0, 5).map((item, index) => (
              <div key={item.agent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' : 'bg-green-600'
                  }`}>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : item.agent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.agent.name}</h4>
                    <p className="text-sm text-gray-600">{item.agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">{item.completedTasks}/{item.totalTasks}</p>
                    <p className="text-xs text-gray-500">tasks completed</p>
                  </div>
                  <div className="w-20">
                    <Progress value={item.completionRate} className="h-2" />
                  </div>
                  <Badge className={`${
                    item.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                    item.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(item.completionRate)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}