"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { AgentCardList } from '@/components/dashboard/AgentCardList';
import { CreateAgentModal } from '@/components/dashboard/CreateAgentModal';
import { Plus } from 'lucide-react';
import { Agent } from '@/types';

export default function AgentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agents, loading, handleCreateAgent, handleUpdateAgent, handleDeleteAgent } = useData();
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    // Check if we should open create modal from query params
    if (searchParams.get('create') === 'true') {
      setShowCreateAgent(true);
      // Remove query param
      router.replace('/agents');
    }
  }, [searchParams, router]);

  const handleSave = async (agentData: Omit<Agent, 'id' | 'createdAt' | 'userId'>, scriptFiles?: File[]) => {
    if (editingAgent) {
      await handleUpdateAgent(editingAgent.id, agentData, scriptFiles);
      setEditingAgent(null);
    } else {
      await handleCreateAgent(agentData, scriptFiles);
    }
    setShowCreateAgent(false);
  };

  return (
    <>
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AgentCardList
            agents={agents}
            onEditAgent={(agent) => {
              setEditingAgent(agent);
              setShowCreateAgent(true);
            }}
            onDeleteAgent={handleDeleteAgent}
          />
        )}
      </div>

      <CreateAgentModal
        open={showCreateAgent}
        onClose={() => {
          setShowCreateAgent(false);
          setEditingAgent(null);
        }}
        onSave={handleSave}
        editingAgent={editingAgent}
      />
    </>
  );
}
