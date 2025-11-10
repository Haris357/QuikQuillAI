export interface Agent {
  id: string;
  name: string;
  role: string;
  writingStyle: string;
  tone: string;
  keywords?: string[];
  description?: string;
  expertise?: string;
  targetAudience?: string;
  contentTypes?: string[];
  referenceFiles?: string[];
  createdAt: string;
  userId: string;
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
  priority?: string;
  deadline?: string;
  taskType?: string;
  wordCount?: number;
  instructions?: string;
  targetAudience?: string;
  tone?: string;
  keywords?: string[];
  references?: string[];
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
  subscription?: UserSubscription;
}

export interface UserSubscription {
  status: 'active' | 'inactive' | 'trial' | 'past_due' | 'canceled';
  tier: 'free' | 'starter' | 'pro' | 'unlimited';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  tokensUsedThisPeriod: number;
  tokensLimit: number;
  createdAt: string;
  updatedAt: string;
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