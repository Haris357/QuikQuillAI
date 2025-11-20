"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '../layout/Sidebar';
import { AgentCard } from './AgentCard';
import { CreateAgentModal } from './CreateAgentModal';
import { AddTaskModal } from './AddTaskModal';
import { AgentSelectionModal } from './AgentSelectionModal';
import { TaskCardList } from './TaskCardList';
import { AgentCardList } from './AgentCardList';
import { EditorModal } from '../editor/EditorModal';
import { SettingsModal } from '../modals/SettingsModal';
import { UpgradeModal } from '../modals/UpgradeModal';
import { HelpModal } from '../modals/HelpModal';
import { Agent, Task } from '@/types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  TrendingUp,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Zap,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ref, onValue, push, set, remove, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokensLimit] = useState(1000000); // 1 million token limit for Gemini Flash

  // Update token usage periodically
  useEffect(() => {
    const updateTokenUsage = async () => {
      const { getTotalTokensUsed } = await import('@/lib/gemini');
      setTokensUsed(getTotalTokensUsed());
    };

    updateTokenUsage();
    const interval = setInterval(updateTokenUsage, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !database) {
      setLoading(false);
      return;
    }

    // Listen to agents
    const agentsRef = ref(database, `agents/${user.uid}`);
    const unsubscribeAgents = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const agentsList = Object.entries(data).map(([id, agent]: [string, any]) => ({
          id,
          ...agent,
        }));
        setAgents(agentsList);
      } else {
        setAgents([]);
      }
      setLoading(false);
    });

    // Listen to tasks
    const tasksRef = ref(database, `tasks/${user.uid}`);
    const unsubscribeTasks = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksList = Object.entries(data).map(([id, task]: [string, any]) => ({
          id,
          ...task,
        }));
        setTasks(tasksList);
      } else {
        setTasks([]);
      }
    });

    return () => {
      unsubscribeAgents();
      unsubscribeTasks();
    };
  }, [user]);

  const handleCreateAgent = async (agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>) => {
    if (!user || !database) {
      // Demo mode - create agent locally
      const newAgent: Agent = {
        id: Date.now().toString(),
        ...agentData,
        createdAt: new Date().toISOString(),
        userId: user?.uid || 'demo-user',
      };
      setAgents(prev => [...prev, newAgent]);
      toast.success('AI Agent created successfully! (Demo Mode)');
      return;
    }
    
    try {
      const agentsRef = ref(database, `agents/${user.uid}`);
      const newAgentRef = push(agentsRef);
      
      const newAgent: Omit<Agent, 'id'> = {
        ...agentData,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };
      
      await set(newAgentRef, newAgent);
      toast.success('AI Agent created successfully!');
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent');
    }
  };

  const handleEditAgent = async (agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>) => {
    if (!user || !editingAgent || !database) return;
    
    try {
      const agentRef = ref(database, `agents/${user.uid}/${editingAgent.id}`);
      await set(agentRef, {
        ...agentData,
        createdAt: editingAgent.createdAt,
        userId: user.uid,
      });
      setEditingAgent(null);
      toast.success('Agent updated successfully!');
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!user || !database) return;
    
    try {
      const agentRef = ref(database, `agents/${user.uid}/${agentId}`);
      await remove(agentRef);
      
      // Also delete associated tasks
      const agentTasks = tasks.filter(t => t.agentId === agentId);
      for (const task of agentTasks) {
        const taskRef = ref(database, `tasks/${user.uid}/${task.id}`);
        await remove(taskRef);
      }
      
      toast.success('Agent deleted successfully!');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    attachments?: string[];
    priority?: string;
    deadline?: string;
    taskType?: string;
    wordCount?: number;
    instructions?: string;
    targetAudience?: string;
    tone?: string;
    keywords?: string[];
    references?: string[];
  }) => {
    if (!user || !selectedAgentId || !database) {
      // Demo mode - create task locally
      if (!selectedAgentId) return;
      
      const selectedAgent = agents.find(a => a.id === selectedAgentId);
      if (!selectedAgent) return;

      const newTask: Task = {
        id: Date.now().toString(),
        agentId: selectedAgentId,
        title: taskData.title,
        description: taskData.description,
        content: '',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: taskData.attachments || [],
        revisions: [],
        priority: taskData.priority,
        deadline: taskData.deadline,
        taskType: taskData.taskType,
        wordCount: taskData.wordCount,
        instructions: taskData.instructions,
        targetAudience: taskData.targetAudience,
        tone: taskData.tone,
        keywords: taskData.keywords,
        references: taskData.references,
      };
      
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created! AI is generating content... (Demo Mode)');
      
      // Generate initial content in demo mode
      try {
        const { generateInitialContent } = await import('@/lib/gemini');

        const generatedContent = await generateInitialContent(
          taskData.title,
          taskData.description,
          selectedAgent.writingStyle,
          taskData.tone || selectedAgent.tone, // Use task tone or fallback to agent tone
          taskData.keywords && taskData.keywords.length > 0 ? taskData.keywords : selectedAgent.keywords || [],
          taskData.wordCount,
          taskData.targetAudience,
          taskData.instructions,
          taskData.references
        );
        
        const updatedTask = {
          ...newTask,
          content: generatedContent,
          status: 'completed' as const,
          updatedAt: new Date().toISOString(),
          revisions: [{
            id: Date.now().toString(),
            content: generatedContent,
            timestamp: new Date().toISOString(),
            type: 'ai-generated' as const,
          }],
        };
        
        setTasks(prev => prev.map(t => t.id === newTask.id ? updatedTask : t));
        toast.success('Content generated successfully! (Demo Mode)');
      } catch (error) {
        console.error('Error generating content:', error);
        toast.error('Failed to generate content');
      }
      
      setSelectedAgentId(null);
      return;
    }
    
    try {
      const tasksRef = ref(database, `tasks/${user.uid}`);
      const newTaskRef = push(tasksRef);
      
      const selectedAgent = agents.find(a => a.id === selectedAgentId);
      if (!selectedAgent) return;

      const newTask: Omit<Task, 'id'> = {
        agentId: selectedAgentId,
        title: taskData.title,
        description: taskData.description,
        content: '',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: taskData.attachments || [],
        revisions: [],
        priority: taskData.priority,
        deadline: taskData.deadline,
        taskType: taskData.taskType,
        wordCount: taskData.wordCount,
        instructions: taskData.instructions,
        targetAudience: taskData.targetAudience,
        tone: taskData.tone,
        keywords: taskData.keywords,
        references: taskData.references,
      };
      
      await set(newTaskRef, newTask);
      toast.success('Task created! AI is generating content...');
      
      // Generate initial content
      try {
        const { generateInitialContent } = await import('@/lib/gemini');

        const generatedContent = await generateInitialContent(
          taskData.title,
          taskData.description,
          selectedAgent.writingStyle,
          taskData.tone || selectedAgent.tone, // Use task tone or fallback to agent tone
          taskData.keywords && taskData.keywords.length > 0 ? taskData.keywords : selectedAgent.keywords || [],
          taskData.wordCount,
          taskData.targetAudience,
          taskData.instructions,
          taskData.references
        );
        
        const updatedTask = {
          ...newTask,
          content: generatedContent,
          status: 'completed' as const,
          updatedAt: new Date().toISOString(),
          revisions: [{
            id: Date.now().toString(),
            content: generatedContent,
            timestamp: new Date().toISOString(),
            type: 'ai-generated' as const,
          }],
        };
        
        await set(newTaskRef, updatedTask);
        toast.success('Content generated successfully!');
      } catch (error) {
        console.error('Error generating content:', error);
        toast.error('Failed to generate content');
      }
      
      setSelectedAgentId(null);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleSaveTask = async (taskId: string, content: string, revisions?: any[]) => {
    if (!user || !database) return;

    try {
      const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        content,
        updatedAt: new Date().toISOString(),
        revisions: revisions || task.revisions, // Use provided revisions or keep existing
      };

      await set(taskRef, updatedTask);
      toast.success('Task saved successfully!');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !database) return;
    
    try {
      const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
      await remove(taskRef);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getAgentTasks = (agentId: string) => tasks.filter(t => t.agentId === agentId);


  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const renderDashboardOverview = () => (
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
              onClick={() => setShowCreateAgent(true)}
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
                  <p className="text-3xl font-bold text-gray-900">{agents.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    AI writers created
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
                  <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Writing tasks created
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
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task, index) => (
                  <div key={task.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' : 
                      task.status === 'in-progress' ? 'bg-blue-500' : 'bg-orange-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {agents.find(a => a.id === task.agentId)?.name} • {new Date(task.updatedAt).toLocaleDateString()}
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
                onClick={() => setShowCreateAgent(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create AI Agent
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
                onClick={() => setCurrentView('tasks')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View All Tasks
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
                onClick={() => setCurrentView('analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Target className="h-4 w-4 mr-2" />
                Set Goals
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAgentsView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Writer Agents</h2>
          <p className="text-gray-600">Manage your specialized AI writing assistants</p>
        </div>
        <Button
          onClick={() => setShowCreateAgent(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Agent
        </Button>
      </div>

      {/* Agent Card List */}
      <AgentCardList
        agents={agents}
        onEditAgent={(agent) => {
          setEditingAgent(agent);
          setShowCreateAgent(true);
        }}
        onDeleteAgent={handleDeleteAgent}
      />
    </div>
  );

  const renderTasksView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-600">All writing tasks across your agents</p>
        </div>
      </div>

      {/* Tasks Card List */}
      <TaskCardList
        tasks={tasks}
        agents={agents}
        onEditTask={(task) => {
          setSelectedTask(task);
          setShowEditor(true);
        }}
        onViewTask={(task) => {
          setSelectedTask(task);
          setShowEditor(true);
        }}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'agents':
        return renderAgentsView();
      case 'tasks':
        return renderTasksView();
      case 'create-agent':
        setShowCreateAgent(true);
        setCurrentView('agents');
        return renderAgentsView();
      case 'create-task':
        if (agents.length > 0) {
          setShowAgentSelection(true);
        } else {
          toast.error('Create an agent first before adding tasks');
        }
        setCurrentView('dashboard');
        return renderDashboardOverview();
      default:
        return renderDashboardOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 bg-white border-r border-gray-200"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        agentCount={agents.length}
        taskCount={tasks.length}
        tokensUsed={tokensUsed}
        tokensLimit={tokensLimit}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
        onOpenHelp={() => setShowHelp(true)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <CreateAgentModal
        open={showCreateAgent}
        onClose={() => {
          setShowCreateAgent(false);
          setEditingAgent(null);
        }}
        onSave={editingAgent ? handleEditAgent : handleCreateAgent}
        editingAgent={editingAgent}
      />
      
      <AgentSelectionModal
        open={showAgentSelection}
        onClose={() => setShowAgentSelection(false)}
        agents={agents}
        onSelectAgent={(agentId) => {
          setSelectedAgentId(agentId);
          setShowAddTask(true);
        }}
      />
      
      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        onSave={handleAddTask}
        agentName={agents.find(a => a.id === selectedAgentId)?.name || ''}
      />
      
      {selectedTask && (
        <EditorModal
          open={showEditor}
          onClose={() => {
            setShowEditor(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSave={handleSaveTask}
          agentStyle={agents.find(a => a.id === selectedTask.agentId)?.writingStyle || ''}
          agentTone={agents.find(a => a.id === selectedTask.agentId)?.tone || ''}
        />
      )}
      
      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
      
      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
      
      {/* Help Modal */}
      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}