"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Agent, Task } from '@/types';
import toast from 'react-hot-toast';
import { canCreateAgent, canCreateTask } from '@/lib/subscription';

interface DataContextType {
  agents: Agent[];
  tasks: Task[];
  loading: boolean;
  handleCreateAgent: (agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  handleUpdateAgent: (agentId: string, agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  handleDeleteAgent: (agentId: string) => Promise<void>;
  handleCreateTask: (selectedAgentId: string, taskData: any) => Promise<void>;
  handleUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Check if user can create more agents
    const canCreate = await canCreateAgent(user.uid);
    if (!canCreate.allowed) {
      toast.error(canCreate.reason || 'Cannot create agent');
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

      // Sanitize data before saving
      const sanitizedAgent = sanitizeData(newAgent);
      await set(newAgentRef, sanitizedAgent);
      toast.success('AI Agent created successfully!');
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent');
    }
  };

  const handleUpdateAgent = async (agentId: string, agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>) => {
    if (!user || !database) return;

    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    try {
      const agentRef = ref(database, `agents/${user.uid}/${agentId}`);
      const updatedAgent = {
        ...agentData,
        createdAt: agent.createdAt,
        userId: user.uid,
      };

      // Sanitize data before saving
      const sanitizedAgent = sanitizeData(updatedAgent);
      await set(agentRef, sanitizedAgent);
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

  const handleCreateTask = async (selectedAgentId: string, taskData: any) => {
    if (!user || !database) {
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

      // Generate content in background
      try {
        const { generateInitialContent } = await import('@/lib/gemini');
        const generatedContent = await generateInitialContent(
          taskData.title,
          taskData.description,
          selectedAgent.writingStyle,
          taskData.tone || selectedAgent.tone,
          taskData.keywords && taskData.keywords.length > 0 ? taskData.keywords : selectedAgent.keywords || [],
          taskData.wordCount,
          taskData.references
        );

        newTask.content = generatedContent;
        newTask.status = 'completed';
        newTask.updatedAt = new Date().toISOString();
        setTasks(prev => prev.map(t => t.id === newTask.id ? newTask : t));
        toast.success('Content generated successfully!');
      } catch (error) {
        console.error('Error generating content:', error);
        newTask.status = 'pending';
        setTasks(prev => prev.map(t => t.id === newTask.id ? newTask : t));
        toast.error('Failed to generate content');
      }
      return;
    }

    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    if (!selectedAgent) return;

    // Check if user can create more tasks
    const canCreate = await canCreateTask(user.uid);
    if (!canCreate.allowed) {
      toast.error(canCreate.reason || 'Cannot create task');
      return;
    }

    try {
      const tasksRef = ref(database, `tasks/${user.uid}`);
      const newTaskRef = push(tasksRef);

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

      // Sanitize data before saving
      const sanitizedNewTask = sanitizeData(newTask);
      await set(newTaskRef, sanitizedNewTask);
      toast.success('Task created! AI is generating content...');

      try {
        const { generateInitialContent } = await import('@/lib/gemini');
        const generatedContent = await generateInitialContent(
          taskData.title,
          taskData.description,
          selectedAgent.writingStyle,
          taskData.tone || selectedAgent.tone,
          taskData.keywords && taskData.keywords.length > 0 ? taskData.keywords : selectedAgent.keywords || [],
          taskData.wordCount,
          taskData.references
        );

        const taskRef = ref(database, `tasks/${user.uid}/${newTaskRef.key}`);
        const updatedTaskData = {
          ...newTask,
          content: generatedContent,
          status: 'completed',
          updatedAt: new Date().toISOString(),
        };

        // Sanitize data before saving
        const sanitizedUpdateData = sanitizeData(updatedTaskData);
        await set(taskRef, sanitizedUpdateData);

        toast.success('Content generated successfully!');
      } catch (error) {
        console.error('Error generating content:', error);
        toast.error('Failed to generate content');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  // Helper function to remove undefined values from objects
  const sanitizeData = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj
        .filter(item => item !== undefined && item !== null)
        .map(item => sanitizeData(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value !== undefined && value !== null) {
          sanitized[key] = sanitizeData(value);
        }
      });
      return sanitized;
    }

    return obj;
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user || !database) return;

    try {
      const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Sanitize the data to remove undefined values
      const sanitizedTask = sanitizeData(updatedTask);

      await set(taskRef, sanitizedTask);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
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

  const value = {
    agents,
    tasks,
    loading,
    handleCreateAgent,
    handleUpdateAgent,
    handleDeleteAgent,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
