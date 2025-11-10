import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We use Firebase Auth instead
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-application-name': 'QuikQuillAI',
    },
  },
});

// Database Types (TypeScript interfaces)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          photo_url: string | null;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          subscription_status: 'active' | 'cancelled' | 'past_due';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          photo_url?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'cancelled' | 'past_due';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_ends_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          photo_url?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'cancelled' | 'past_due';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_ends_at?: string | null;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          role: string;
          description: string | null;
          writing_style: string;
          tone: string;
          keywords: string[];
          expertise: string | null;
          target_audience: string | null;
          content_types: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          role: string;
          description?: string | null;
          writing_style: string;
          tone: string;
          keywords?: string[];
          expertise?: string | null;
          target_audience?: string | null;
          content_types?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          role?: string;
          description?: string | null;
          writing_style?: string;
          tone?: string;
          keywords?: string[];
          expertise?: string | null;
          target_audience?: string | null;
          content_types?: string[];
        };
      };
      scripts: {
        Row: {
          id: string;
          agent_id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          content?: string | null;
        };
        Update: {
          id?: string;
          agent_id?: string;
          user_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          content?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string | null;
          title: string;
          description: string | null;
          content: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          priority: 'low' | 'medium' | 'high';
          word_count: number;
          tokens_used: number;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id?: string | null;
          title: string;
          description?: string | null;
          content?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          priority?: 'low' | 'medium' | 'high';
          word_count?: number;
          tokens_used?: number;
          due_date?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string | null;
          title?: string;
          description?: string | null;
          content?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          priority?: 'low' | 'medium' | 'high';
          word_count?: number;
          tokens_used?: number;
          due_date?: string | null;
          completed_at?: string | null;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          tokens_used: number;
          operation_type: 'generate' | 'rephrase' | 'continue' | 'edit';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          tokens_used: number;
          operation_type: 'generate' | 'rephrase' | 'continue' | 'edit';
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          tokens_used?: number;
          operation_type?: 'generate' | 'rephrase' | 'continue' | 'edit';
        };
      };
    };
  };
}

export default supabase;
