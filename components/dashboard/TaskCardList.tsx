"use client";

import { useState } from 'react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  CheckCircle,
  PlayCircle,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  Search,
  Calendar,
  User,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskCardListProps {
  tasks: Task[];
  agents: any[];
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskCardList({
  tasks,
  agents,
  onEditTask,
  onViewTask,
  onDeleteTask,
}: TaskCardListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  const getAgentColor = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-teal-100 text-teal-700 border-teal-200',
    ];
    const index = agents.findIndex((a) => a.id === agentId);
    return colors[index % colors.length];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <PlayCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAgentName(task.agentId).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAgent = agentFilter === 'all' || task.agentId === agentFilter;

    return matchesSearch && matchesStatus && matchesAgent;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks, agents, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{sortedTasks.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{tasks.length}</span> tasks
        </p>
      </div>

      {/* Task Cards Grid */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Create your first task to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                layout
              >
                <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Priority Indicator Bar */}
                  {task.priority && (
                    <div className={`h-1 w-full ${getPriorityColor(task.priority).replace('bg-', 'bg-gradient-to-r from-')}`} />
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3
                          className="font-semibold text-gray-900 text-base mb-1 line-clamp-2 cursor-pointer hover:text-green-600 transition-colors"
                          onClick={() => onViewTask(task)}
                          title={task.title}
                        >
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${getStatusColor(task.status)} border text-xs font-medium`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(task.status)}
                              <span className="capitalize">{task.status.replace('-', ' ')}</span>
                            </div>
                          </Badge>
                          {task.priority && (
                            <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewTask(task)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {onDeleteTask && (
                            <DropdownMenuItem
                              onClick={() => onDeleteTask(task.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2" title={task.description}>
                      {task.description}
                    </p>

                    {/* Task Type */}
                    {task.taskType && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                          {task.taskType.replace('-', ' ')}
                        </Badge>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getAgentColor(task.agentId)}`}>
                          {getAgentName(task.agentId)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(task.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Word Count & Deadline */}
                    {(task.wordCount || task.deadline) && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        {task.wordCount && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FileText className="h-3.5 w-3.5" />
                            <span>{task.wordCount} words</span>
                          </div>
                        )}
                        {task.deadline && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {new Date(task.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Actions - Visible on hover */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewTask(task)}
                        className="flex-1 text-xs h-8 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditTask(task)}
                        className="flex-1 text-xs h-8 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
