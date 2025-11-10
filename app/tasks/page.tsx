"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { TaskCardList } from '@/components/dashboard/TaskCardList';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { AgentSelectionModal } from '@/components/dashboard/AgentSelectionModal';
import { EditorModal } from '@/components/editor/EditorModal';
import { Task } from '@/types';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agents, tasks, loading, handleCreateTask, handleUpdateTask, handleDeleteTask } = useData();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    // Check if we should open create modal from query params
    if (searchParams.get('create') === 'true') {
      if (agents.length > 0) {
        setShowAgentSelection(true);
      } else {
        toast.error('Create an agent first before adding tasks');
        router.replace('/agents?create=true');
      }
      // Remove query param
      router.replace('/tasks');
    }
  }, [searchParams, router, agents.length]);

  const handleAddTask = async (taskData: any) => {
    if (!selectedAgentId) return;
    await handleCreateTask(selectedAgentId, taskData);
    setShowAddTask(false);
    setSelectedAgentId(null);
  };

  const handleSaveTask = async (taskId: string, content: string, revisions?: any[]) => {
    const updates: any = { content };
    if (revisions) {
      updates.revisions = revisions;
    }
    await handleUpdateTask(taskId, updates);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <p className="text-gray-600">All writing tasks across your agents</p>
          </div>
          <Button
            onClick={() => {
              if (agents.length > 0) {
                setShowAgentSelection(true);
              } else {
                toast.error('Create an agent first before adding tasks');
                router.push('/agents?create=true');
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
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

      {/* Agent Selection Modal */}
      <AgentSelectionModal
        open={showAgentSelection}
        onClose={() => setShowAgentSelection(false)}
        agents={agents}
        onSelectAgent={(agentId) => {
          setSelectedAgentId(agentId);
          setShowAddTask(true);
          setShowAgentSelection(false);
        }}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddTask}
        onClose={() => {
          setShowAddTask(false);
          setSelectedAgentId(null);
        }}
        onSave={handleAddTask}
        agentName={agents.find(a => a.id === selectedAgentId)?.name || ''}
      />

      {/* Editor Modal */}
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
    </>
  );
}
