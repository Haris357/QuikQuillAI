"use client";

import { EditorDrawer } from './EditorDrawer';
import { Task } from '@/types';
import { rephraseText, continueWriting } from '@/lib/gemini';

interface EditorModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onSave: (taskId: string, content: string) => void;
  agentStyle: string;
  agentTone: string;
}

export function EditorModal({ 
  open, 
  onClose, 
  task, 
  onSave, 
  agentStyle, 
  agentTone 
}: EditorModalProps) {
  const handleSave = (content: string) => {
    onSave(task.id, content);
  };

  const handleRephrase = async (selectedText: string): Promise<string> => {
    return await rephraseText(selectedText, agentTone);
  };

  const handlePromptSubmit = async (prompt: string): Promise<string> => {
    const { improveContent } = await import('@/lib/gemini');
    return await improveContent(task.content, prompt, agentStyle, agentTone);
  };

  return (
    <EditorDrawer
      open={open}
      onClose={onClose}
      task={task}
      onSave={handleSave}
      onRephrase={handleRephrase}
      onPromptSubmit={handlePromptSubmit}
      agentStyle={agentStyle}
      agentTone={agentTone}
    />
  );
}