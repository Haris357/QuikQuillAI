import { supabase } from './supabase';
import type { Database } from './supabase';

// Type aliases for cleaner code
type User = Database['public']['Tables']['users']['Row'];
type Agent = Database['public']['Tables']['agents']['Row'];
type Script = Database['public']['Tables']['scripts']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type UsageTracking = Database['public']['Tables']['usage_tracking']['Row'];

type UserInsert = Database['public']['Tables']['users']['Insert'];
type AgentInsert = Database['public']['Tables']['agents']['Insert'];
type ScriptInsert = Database['public']['Tables']['scripts']['Insert'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type UsageTrackingInsert = Database['public']['Tables']['usage_tracking']['Insert'];

type UserUpdate = Database['public']['Tables']['users']['Update'];
type AgentUpdate = Database['public']['Tables']['agents']['Update'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Storage bucket name
export const STORAGE_BUCKET = 'agent-scripts';

// =====================================================
// USER OPERATIONS
// =====================================================

export const userService = {
  /**
   * Create or update user profile
   */
  async upsertUser(userData: UserInsert): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  },

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get user's monthly token usage
   */
  async getMonthlyTokenUsage(userId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_user_monthly_token_usage', { p_user_id: userId });

    if (error) {
      console.error('Error fetching token usage:', error);
      return 0;
    }
    return data || 0;
  },
};

// =====================================================
// AGENT OPERATIONS
// =====================================================

export const agentService = {
  /**
   * Create a new agent
   */
  async createAgent(agentData: AgentInsert): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .insert(agentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get all agents for a user
   */
  async getAgents(userId: string): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Get single agent by ID
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
    return data;
  },

  /**
   * Update an agent
   */
  async updateAgent(agentId: string, updates: AgentUpdate): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
    return data;
  },

  /**
   * Delete an agent (cascades to scripts and tasks)
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    // First, delete all scripts from storage
    const scripts = await scriptService.getScriptsByAgent(agentId);
    for (const script of scripts) {
      await scriptService.deleteScript(script.id);
    }

    // Then delete the agent from database (tasks will be set to null due to ON DELETE SET NULL)
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId);

    if (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
    return true;
  },

  /**
   * Get agent with script count
   */
  async getAgentWithScriptCount(agentId: string): Promise<{ agent: Agent; scriptCount: number } | null> {
    const { data, error } = await supabase
      .rpc('get_agent_with_script_count', { p_agent_id: agentId });

    if (error) {
      console.error('Error fetching agent with script count:', error);
      return null;
    }
    return data?.[0] || null;
  },
};

// =====================================================
// SCRIPT OPERATIONS (File Upload + Database)
// =====================================================

export const scriptService = {
  /**
   * Upload a script file and create database record
   */
  async uploadScript(
    file: File,
    agentId: string,
    userId: string
  ): Promise<Script | null> {
    try {
      // 1. Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${agentId}/${timestamp}_${sanitizedFileName}`;

      // 2. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        throw uploadError;
      }

      // 3. Read file content for AI context (if text file)
      let content: string | null = null;
      if (file.type.startsWith('text/') || file.type.includes('javascript') || file.type.includes('python')) {
        content = await file.text();
      }

      // 4. Create database record
      const scriptData: ScriptInsert = {
        agent_id: agentId,
        user_id: userId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        content: content,
      };

      const { data, error } = await supabase
        .from('scripts')
        .insert(scriptData)
        .select()
        .single();

      if (error) {
        // Rollback: delete uploaded file
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        console.error('Error creating script record:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in uploadScript:', error);
      return null;
    }
  },

  /**
   * Get all scripts for an agent
   */
  async getScriptsByAgent(agentId: string): Promise<Script[]> {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scripts:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Get single script by ID
   */
  async getScript(scriptId: string): Promise<Script | null> {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (error) {
      console.error('Error fetching script:', error);
      return null;
    }
    return data;
  },

  /**
   * Get public URL for a script file
   */
  getScriptPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Download script file content
   */
  async downloadScript(filePath: string): Promise<Blob | null> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error) {
      console.error('Error downloading script:', error);
      return null;
    }
    return data;
  },

  /**
   * Delete a script (file + database record)
   */
  async deleteScript(scriptId: string): Promise<boolean> {
    try {
      // 1. Get script record to get file path
      const script = await this.getScript(scriptId);
      if (!script) {
        console.error('Script not found');
        return false;
      }

      // 2. Delete file from storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([script.file_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }

      // 3. Delete database record
      const { error: dbError } = await supabase
        .from('scripts')
        .delete()
        .eq('id', scriptId);

      if (dbError) {
        console.error('Error deleting script record:', dbError);
        throw dbError;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteScript:', error);
      return false;
    }
  },

  /**
   * Get all script contents for AI context
   */
  async getScriptContentsForAgent(agentId: string): Promise<string[]> {
    const scripts = await this.getScriptsByAgent(agentId);
    return scripts
      .filter(script => script.content !== null)
      .map(script => script.content as string);
  },
};

// =====================================================
// TASK OPERATIONS
// =====================================================

export const taskService = {
  /**
   * Create a new task
   */
  async createTask(taskData: TaskInsert): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get all tasks for a user
   */
  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Get single task by ID
   */
  async getTask(taskId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return null;
    }
    return data;
  },

  /**
   * Get tasks by agent ID
   */
  async getTasksByAgent(agentId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks by agent:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Update a task
   */
  async updateTask(taskId: string, updates: TaskUpdate): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    return data;
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
    return true;
  },

  /**
   * Mark task as completed
   */
  async completeTask(taskId: string): Promise<Task | null> {
    return this.updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },
};

// =====================================================
// TASK REVISION OPERATIONS
// =====================================================

export const revisionService = {
  /**
   * Create a new task revision
   */
  async createRevision(
    taskId: string,
    userId: string,
    content: string,
    revisionType: 'ai-generated' | 'user-edit' | 'rephrased',
    revisionName?: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from('task_revisions')
      .insert({
        task_id: taskId,
        user_id: userId,
        content: content,
        revision_type: revisionType,
        revision_name: revisionName || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating revision:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get all revisions for a task
   */
  async getTaskRevisions(taskId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('task_revisions')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching revisions:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Delete a revision
   */
  async deleteRevision(revisionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('task_revisions')
      .delete()
      .eq('id', revisionId);

    if (error) {
      console.error('Error deleting revision:', error);
      throw error;
    }
    return true;
  },

  /**
   * Update revision name
   */
  async updateRevisionName(revisionId: string, name: string): Promise<any> {
    const { data, error } = await supabase
      .from('task_revisions')
      .update({ revision_name: name })
      .eq('id', revisionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating revision name:', error);
      throw error;
    }
    return data;
  },
};

// =====================================================
// USAGE TRACKING OPERATIONS
// =====================================================

export const usageService = {
  /**
   * Track token usage
   */
  async trackUsage(usageData: UsageTrackingInsert): Promise<UsageTracking | null> {
    const { data, error } = await supabase
      .from('usage_tracking')
      .insert(usageData)
      .select()
      .single();

    if (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get user's usage history
   */
  async getUserUsage(userId: string, limit: number = 100): Promise<UsageTracking[]> {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching usage history:', error);
      return [];
    }
    return data || [];
  },
};

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

export const subscriptionService = {
  /**
   * Subscribe to agent changes
   */
  subscribeToAgents(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('agents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to task changes
   */
  subscribeToTasks(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to script changes for an agent
   */
  subscribeToScripts(agentId: string, callback: (payload: any) => void) {
    return supabase
      .channel('scripts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scripts',
          filter: `agent_id=eq.${agentId}`,
        },
        callback
      )
      .subscribe();
  },
};

// Export all services
export default {
  user: userService,
  agent: agentService,
  script: scriptService,
  task: taskService,
  revision: revisionService,
  usage: usageService,
  subscription: subscriptionService,
};
