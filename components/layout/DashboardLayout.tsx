"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { PageTransition } from './PageTransition';
import { TopLoadingBar } from './TopLoadingBar';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/contexts/DataContext';
import { UserSubscription } from '@/types';
import { SettingsModal } from '../modals/SettingsModal';
import { UpgradeModal } from '../modals/UpgradeModal';
import { HelpModal } from '../modals/HelpModal';
import { getUserSubscription } from '@/lib/subscription';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const { agents, tasks } = useData(); // Use DataContext for agents and tasks from Supabase
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokensLimit] = useState(1000000);

  // Update token usage periodically
  useEffect(() => {
    const updateTokenUsage = async () => {
      const { getTotalTokensUsed } = await import('@/lib/gemini');
      setTokensUsed(getTotalTokensUsed());
    };

    updateTokenUsage();
    const interval = setInterval(updateTokenUsage, 2000);

    return () => clearInterval(interval);
  }, []);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load subscription
  useEffect(() => {
    if (!user) return;

    const loadSubscription = async () => {
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
    };

    loadSubscription();
  }, [user]);

  // No longer need to load agents/tasks here - they come from DataContext (Supabase)

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TopLoadingBar />
      <Sidebar
        agentCount={agents.length}
        taskCount={tasks.length}
        tokensUsed={tokensUsed}
        tokensLimit={tokensLimit}
        subscription={subscription}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
        onOpenHelp={() => setShowHelp(true)}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />

      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}
