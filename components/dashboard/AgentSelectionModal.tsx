"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Agent } from '@/types';
import { Users, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentSelectionModalProps {
  open: boolean;
  onClose: () => void;
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
}

export function AgentSelectionModal({ 
  open, 
  onClose, 
  agents, 
  onSelectAgent 
}: AgentSelectionModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const handleContinue = () => {
    if (selectedAgentId) {
      onSelectAgent(selectedAgentId);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-green-600" />
            Select AI Agent
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Choose which AI agent will handle this writing task
          </p>
        </DialogHeader>
        
        <div className="mt-6">
          {agents.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedAgentId === agent.id 
                        ? 'ring-2 ring-green-500 bg-green-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600">
                            <AvatarFallback className="text-white font-semibold text-sm">
                              {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                            <p className="text-sm text-gray-600">{agent.role}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 mb-1">
                              {agent.writingStyle}
                            </Badge>
                            <br />
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {agent.tone}
                            </Badge>
                          </div>
                          {selectedAgentId === agent.id && (
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <ChevronRight className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {agent.keywords && agent.keywords.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {agent.keywords.slice(0, 3).map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              {keyword}
                            </Badge>
                          ))}
                          {agent.keywords.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              +{agent.keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Available</h3>
              <p className="text-gray-600 mb-4">Create your first AI agent to start adding tasks</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="border-gray-200 hover:bg-gray-50">
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedAgentId || agents.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Continue with Agent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}