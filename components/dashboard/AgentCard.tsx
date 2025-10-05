"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileText,
  Zap,
  Calendar,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Agent, Task } from '@/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface AgentCardProps {
  agent: Agent;
  tasks: Task[];
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agentId: string) => void;
  onAddTask: (agentId: string) => void;
  onViewTasks: (agentId: string) => void;
  onToggleStatus?: (agentId: string) => void;
}

export function AgentCard({ 
  agent, 
  tasks, 
  onEditAgent, 
  onDeleteAgent, 
  onAddTask, 
  onViewTasks,
  onToggleStatus
}: AgentCardProps) {
  const [isActive, setIsActive] = useState(true);
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'in-progress': return <Clock className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const handleToggleStatus = () => {
    setIsActive(!isActive);
    onToggleStatus?.(agent.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="agent-card h-full bg-white border border-gray-200 hover:border-green-300 hover:shadow-upwork-hover transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600">
                  <AvatarFallback className="text-white font-semibold">
                    {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-600">{agent.role}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`status-dot w-3 h-3 rounded-full ${isActive ? 'bg-green-500 active' : 'bg-gray-400'}`} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEditAgent(agent)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Agent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleStatus}>
                      {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isActive ? 'Pause Agent' : 'Activate Agent'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewTasks(agent.id)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View All Tasks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteAgent(agent.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Agent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Agent Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Writing Style</p>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {agent.writingStyle}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tone</p>
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  {agent.tone}
                </Badge>
              </div>
            </div>

            {/* Keywords */}
            {agent.keywords && agent.keywords.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Focus Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {(agent.keywords || []).slice(0, 4).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                      {keyword}
                    </Badge>
                  ))}
                  {agent.keywords && agent.keywords.length > 4 && (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                      +{(agent.keywords?.length || 0) - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
                <div className="text-xs text-gray-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">Completion Rate</span>
                <span className="text-xs font-semibold text-gray-900">{Math.round(completionRate)}%</span>
              </div>
              <Progress 
                value={completionRate} 
                className="h-2 progress-bar"
                style={{
                  background: 'linear-gradient(to right, #f3f4f6, #e5e7eb)'
                }}
              />
            </div>

            {/* Recent Tasks */}
            {recentTasks.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Recent Tasks</p>
                <div className="space-y-2">
                  {recentTasks.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getStatusIcon(task.status)}
                        <span className="truncate text-gray-700">{task.title}</span>
                      </div>
                      <Badge className={`${getStatusColor(task.status)} text-xs px-2 py-0.5`}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="flex items-center space-x-2 text-gray-600">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>+{Math.floor(Math.random() * 20 + 10)}% this week</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-3 w-3 text-blue-500" />
                <span>{Math.floor(Math.random() * 5 + 1)} days avg</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onAddTask(agent.id)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm h-9"
              >
                <Zap className="h-4 w-4 mr-1" />
                New Task
              </Button>
              <Button
                variant="outline"
                onClick={() => onViewTasks(agent.id)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 text-sm h-9"
              >
                <Target className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}