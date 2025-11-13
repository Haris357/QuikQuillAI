"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Agent, Task } from '@/types';
import toast from 'react-hot-toast';
import { canCreateAgent, canCreateTask } from '@/lib/subscription';
import supabaseService from '@/lib/supabase-service';
import { ensureTaskHasRevision } from '@/lib/revision-utils';

interface DataContextType {
  agents: Agent[];
  tasks: Task[];
  loading: boolean;
  handleCreateAgent: (agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>, scriptFiles?: File[]) => Promise<void>;
  handleUpdateAgent: (agentId: string, agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>, scriptFiles?: File[]) => Promise<void>;
  handleDeleteAgent: (agentId: string) => Promise<void>;
  handleCreateTask: (selectedAgentId: string, taskData: any) => Promise<void>;
  handleUpdateTask: (taskId: string, updates: Partial<Task>, revisions?: any[]) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Ensure user exists in Supabase
    const initializeUser = async () => {
      try {
        await supabaseService.user.upsertUser({
          id: user.uid,
          email: user.email || '',
          name: user.displayName || null,
          photo_url: user.photoURL || null,
        });
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initializeUser();

    // Load initial data
    const loadData = async () => {
      try {
        const [agentsData, tasksData] = await Promise.all([
          supabaseService.agent.getAgents(user.uid),
          supabaseService.task.getTasks(user.uid),
        ]);

        // Convert Supabase data to match existing Agent/Task types
        const convertedAgents = agentsData.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          description: agent.description,
          writingStyle: agent.writing_style,
          tone: agent.tone,
          keywords: agent.keywords || [],
          expertise: agent.expertise,
          targetAudience: agent.target_audience,
          contentTypes: agent.content_types || [],
          createdAt: agent.created_at,
          userId: agent.user_id,
        }));

        // Load revisions for each task and ensure each task has at least one revision
        const convertedTasks = await Promise.all(tasksData.map(async (task: any) => {
          // Ensure task has initial revision if it has content
          if (task.content && task.content.trim() !== '') {
            await ensureTaskHasRevision(task.id, user.uid, task.content);
          }

          // Load all revisions for the task
          const revisions = await supabaseService.revision.getTaskRevisions(task.id);

          return {
            id: task.id,
            agentId: task.agent_id,
            title: task.title,
            description: task.description,
            content: task.content || '',
            status: mapSupabaseStatus(task.status),
            priority: task.priority,
            deadline: task.due_date,
            wordCount: task.word_count,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            // Additional fields from old schema
            attachments: [],
            revisions: revisions.map((rev: any) => ({
              id: rev.id,
              content: rev.content,
              timestamp: rev.created_at,
              type: rev.revision_type,
              changes: [],
              name: rev.revision_name || 'Untitled',
            })),
            taskType: 'article',
            instructions: task.description,
            targetAudience: '',
            tone: '',
            keywords: [],
            references: '',
          };
        }));

        setAgents(convertedAgents);
        setTasks(convertedTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time changes
    const agentChannel = supabaseService.subscription.subscribeToAgents(user.uid, (payload) => {
      console.log('Agent change:', payload);
      loadData(); // Reload data on any change
    });

    const taskChannel = supabaseService.subscription.subscribeToTasks(user.uid, (payload) => {
      console.log('Task change:', payload);
      loadData(); // Reload data on any change
    });

    return () => {
      agentChannel.unsubscribe();
      taskChannel.unsubscribe();
    };
  }, [user]);

  // Helper to map Supabase status to old schema
  const mapSupabaseStatus = (status: string): 'pending' | 'in-progress' | 'completed' => {
    if (status === 'pending') return 'pending';
    if (status === 'in_progress') return 'in-progress';
    if (status === 'completed') return 'completed';
    return 'pending';
  };

  const handleCreateAgent = async (agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>, scriptFiles?: File[]) => {
    if (!user) {
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
      const newAgent = await supabaseService.agent.createAgent({
        user_id: user.uid,
        name: agentData.name,
        role: agentData.role,
        description: agentData.description || null,
        writing_style: agentData.writingStyle,
        tone: agentData.tone,
        keywords: agentData.keywords || [],
        expertise: agentData.expertise || null,
        target_audience: agentData.targetAudience || null,
        content_types: agentData.contentTypes || [],
      });

      if (newAgent) {
        // Optimistically update local state immediately
        const convertedAgent: Agent = {
          id: newAgent.id,
          name: newAgent.name,
          role: newAgent.role,
          description: newAgent.description,
          writingStyle: newAgent.writing_style,
          tone: newAgent.tone,
          keywords: newAgent.keywords || [],
          expertise: newAgent.expertise,
          targetAudience: newAgent.target_audience,
          contentTypes: newAgent.content_types || [],
          createdAt: newAgent.created_at,
          userId: newAgent.user_id,
        };
        setAgents(prev => [convertedAgent, ...prev]);

        // Upload script files if provided
        if (scriptFiles && scriptFiles.length > 0) {
          for (const file of scriptFiles) {
            await supabaseService.script.uploadScript(file, newAgent.id, user.uid);
          }
          toast.success(`AI Agent created with ${scriptFiles.length} training script(s)!`);
        } else {
          toast.success('AI Agent created successfully!');
        }
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent');
    }
  };

  const handleUpdateAgent = async (agentId: string, agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>, scriptFiles?: File[]) => {
    if (!user) return;

    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    try {
      const updatedAgent = await supabaseService.agent.updateAgent(agentId, {
        name: agentData.name,
        role: agentData.role,
        description: agentData.description || null,
        writing_style: agentData.writingStyle,
        tone: agentData.tone,
        keywords: agentData.keywords || [],
        expertise: agentData.expertise || null,
        target_audience: agentData.targetAudience || null,
        content_types: agentData.contentTypes || [],
      });

      if (updatedAgent) {
        // Optimistically update local state immediately
        const convertedAgent: Agent = {
          id: updatedAgent.id,
          name: updatedAgent.name,
          role: updatedAgent.role,
          description: updatedAgent.description,
          writingStyle: updatedAgent.writing_style,
          tone: updatedAgent.tone,
          keywords: updatedAgent.keywords || [],
          expertise: updatedAgent.expertise,
          targetAudience: updatedAgent.target_audience,
          contentTypes: updatedAgent.content_types || [],
          createdAt: updatedAgent.created_at,
          userId: updatedAgent.user_id,
        };
        setAgents(prev => prev.map(a => a.id === agentId ? convertedAgent : a));
      }

      // Upload script files if provided
      if (scriptFiles && scriptFiles.length > 0) {
        for (const file of scriptFiles) {
          await supabaseService.script.uploadScript(file, agentId, user.uid);
        }
        toast.success(`Agent updated with ${scriptFiles.length} new script(s)!`);
      } else {
        toast.success('Agent updated successfully!');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!user) return;

    try {
      // Optimistically remove from local state immediately
      setAgents(prev => prev.filter(a => a.id !== agentId));

      await supabaseService.agent.deleteAgent(agentId);
      toast.success('Agent deleted successfully!');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
      // Reload data to restore the agent if deletion failed
      supabaseService.agent.getAgents(user.uid).then(agentsData => {
        const convertedAgents = agentsData.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          description: agent.description,
          writingStyle: agent.writing_style,
          tone: agent.tone,
          keywords: agent.keywords || [],
          expertise: agent.expertise,
          targetAudience: agent.target_audience,
          contentTypes: agent.content_types || [],
          createdAt: agent.created_at,
          userId: agent.user_id,
        }));
        setAgents(convertedAgents);
      });
    }
  };

  const handleCreateTask = async (selectedAgentId: string, taskData: any) => {
    if (!user) {
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
      // Create task in Supabase
      const newTask = await supabaseService.task.createTask({
        user_id: user.uid,
        agent_id: selectedAgentId,
        title: taskData.title,
        description: taskData.description,
        content: '',
        status: 'in_progress',
        priority: taskData.priority || 'medium',
        word_count: taskData.wordCount || 0,
        due_date: taskData.deadline || null,
      });

      if (!newTask) {
        toast.error('Failed to create task');
        return;
      }

      // Optimistically add the task to local state immediately
      const convertedTask: Task = {
        id: newTask.id,
        agentId: newTask.agent_id,
        title: newTask.title,
        description: newTask.description,
        content: newTask.content || '',
        status: mapSupabaseStatus(newTask.status),
        priority: newTask.priority,
        deadline: newTask.due_date,
        wordCount: newTask.word_count,
        createdAt: newTask.created_at,
        updatedAt: newTask.updated_at,
        attachments: [],
        revisions: [],
        taskType: 'article',
        instructions: newTask.description,
        targetAudience: '',
        tone: '',
        keywords: [],
        references: '',
      };
      setTasks(prev => [convertedTask, ...prev]);

      toast.success('Task created! AI is generating content...');

      try {
        // Get script context from agent's uploaded scripts
        const scriptContents = await supabaseService.script.getScriptContentsForAgent(selectedAgentId);

        const { generateInitialContent } = await import('@/lib/gemini');
        const generatedContent = await generateInitialContent(
          taskData.title,
          taskData.description,
          selectedAgent.writingStyle,
          taskData.tone || selectedAgent.tone,
          taskData.keywords && taskData.keywords.length > 0 ? taskData.keywords : selectedAgent.keywords || [],
          taskData.wordCount,
          taskData.references,
          scriptContents // Pass script context to AI
        );

        // Update task with generated content
        const updatedTask = await supabaseService.task.updateTask(newTask.id, {
          content: generatedContent,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });

        // Update local state with generated content
        if (updatedTask) {
          const convertedTask: Task = {
            id: updatedTask.id,
            agentId: updatedTask.agent_id,
            title: updatedTask.title,
            description: updatedTask.description,
            content: updatedTask.content || '',
            status: mapSupabaseStatus(updatedTask.status),
            priority: updatedTask.priority,
            deadline: updatedTask.due_date,
            wordCount: updatedTask.word_count,
            createdAt: updatedTask.created_at,
            updatedAt: updatedTask.updated_at,
            attachments: [],
            revisions: [],
            taskType: 'article',
            instructions: updatedTask.description,
            targetAudience: '',
            tone: '',
            keywords: [],
            references: '',
          };
          setTasks(prev => prev.map(t => t.id === newTask.id ? convertedTask : t));
        }

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

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>, revisions?: any[]) => {
    if (!user) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Map old schema to new schema
      const supabaseUpdates: any = {};
      if (updates.title) supabaseUpdates.title = updates.title;
      if (updates.description) supabaseUpdates.description = updates.description;
      if (updates.content) supabaseUpdates.content = updates.content;
      if (updates.status) {
        // Map status to Supabase format
        if (updates.status === 'in-progress') supabaseUpdates.status = 'in_progress';
        else supabaseUpdates.status = updates.status;
      }
      if (updates.priority) supabaseUpdates.priority = updates.priority;
      if (updates.deadline) supabaseUpdates.due_date = updates.deadline;
      if (updates.wordCount) supabaseUpdates.word_count = updates.wordCount;

      const updatedTask = await supabaseService.task.updateTask(taskId, supabaseUpdates);

      if (updatedTask) {
        // Load updated revisions from database
        const dbRevisions = await supabaseService.revision.getTaskRevisions(taskId);

        // Optimistically update local state immediately
        const convertedTask: Task = {
          id: updatedTask.id,
          agentId: updatedTask.agent_id,
          title: updatedTask.title,
          description: updatedTask.description,
          content: updatedTask.content || '',
          status: mapSupabaseStatus(updatedTask.status),
          priority: updatedTask.priority,
          deadline: updatedTask.due_date,
          wordCount: updatedTask.word_count,
          createdAt: updatedTask.created_at,
          updatedAt: updatedTask.updated_at,
          attachments: [],
          revisions: dbRevisions.map((rev: any) => ({
            id: rev.id,
            content: rev.content,
            timestamp: rev.created_at,
            type: rev.revision_type,
            changes: [],
            name: rev.revision_name || 'Untitled',
          })),
          taskType: 'article',
          instructions: updatedTask.description,
          targetAudience: '',
          tone: '',
          keywords: [],
          references: '',
        };
        setTasks(prev => prev.map(t => t.id === taskId ? convertedTask : t));
      }

      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      // Optimistically remove from local state immediately
      setTasks(prev => prev.filter(t => t.id !== taskId));

      await supabaseService.task.deleteTask(taskId);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      // Reload data to restore the task if deletion failed
      supabaseService.task.getTasks(user.uid).then(tasksData => {
        const convertedTasks = tasksData.map((task: any) => ({
          id: task.id,
          agentId: task.agent_id,
          title: task.title,
          description: task.description,
          content: task.content || '',
          status: mapSupabaseStatus(task.status),
          priority: task.priority,
          deadline: task.due_date,
          wordCount: task.word_count,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          attachments: [],
          revisions: [],
          taskType: 'article',
          instructions: task.description,
          targetAudience: '',
          tone: '',
          keywords: [],
          references: '',
        }));
        setTasks(convertedTasks);
      });
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
