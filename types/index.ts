export interface Agent {
  id: string;
  name: string;
  role: string;
  writingStyle: string;
  tone: string;
  keywords?: string[];
  createdAt: string;
  userId: string;
  referenceFiles?: string[];
}

export interface Task {
  id: string;
  agentId: string;
  title: string;
  description: string;
  content: string;
  status: 'pending' | 'completed' | 'in-progress';
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  revisions: Revision[];
}

export interface Revision {
  id: string;
  content: string;
  timestamp: string;
  type: 'ai-generated' | 'user-edit' | 'rephrased';
  changes?: TextChange[];
  name?: string;
}

export interface TextChange {
  type: 'added' | 'removed' | 'modified';
  start: number;
  end: number;
  text: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  tokensUsed?: number;
  tokensLimit?: number;
  subscription?: {
    status: 'active' | 'inactive' | 'trial';
    planId: string;
    expiresAt: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  dueDate: string;
  agentIds: string[];
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  color: string;
}