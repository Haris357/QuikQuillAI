"use client";

import { useState } from 'react';
import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  Trash2,
  MoreVertical,
  Search,
  User,
  Briefcase,
  Hash,
  Palette,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentCardListProps {
  agents: Agent[];
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agentId: string) => void;
}

export function AgentCardList({
  agents,
  onEditAgent,
  onDeleteAgent,
}: AgentCardListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Get unique roles
  const uniqueRoles = Array.from(new Set(agents.map((a) => a.role).filter(Boolean)));

  // Filter agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.writingStyle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || agent.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'role':
        return a.role.localeCompare(b.role);
      default:
        return 0;
    }
  });

  const getAgentColor = (index: number) => {
    const colors = [
      { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', border: 'border-blue-200', text: 'text-blue-700' },
      { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', border: 'border-purple-200', text: 'text-purple-700' },
      { bg: 'bg-gradient-to-br from-pink-500 to-pink-600', border: 'border-pink-200', text: 'text-pink-700' },
      { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', border: 'border-orange-200', text: 'text-orange-700' },
      { bg: 'bg-gradient-to-br from-teal-500 to-teal-600', border: 'border-teal-200', text: 'text-teal-700' },
      { bg: 'bg-gradient-to-br from-green-500 to-green-600', border: 'border-green-200', text: 'text-green-700' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents by name, role, or style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[160px] border-gray-200">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="role">Role</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Agent Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{sortedAgents.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{agents.length}</span> agents
        </p>
      </div>

      {/* Agent Cards Grid */}
      {sortedAgents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || roleFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Create your first AI agent to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedAgents.map((agent, index) => {
              const color = getAgentColor(index);
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  layout
                >
                  <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                    {/* Header with gradient background */}
                    <div className={`${color.bg} p-5 relative`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-bold text-white text-base truncate"
                              title={agent.name}
                            >
                              {agent.name}
                            </h3>
                            <p className="text-white/80 text-sm truncate" title={agent.role}>
                              {agent.role}
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditAgent(agent)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Agent
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteAgent(agent.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Description */}
                      {agent.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2" title={agent.description}>
                          {agent.description}
                        </p>
                      )}

                      {/* Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2">
                          <Palette className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Writing Style</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{agent.writingStyle}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Tone</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{agent.tone}</p>
                          </div>
                        </div>

                        {agent.keywords && agent.keywords.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Hash className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-1">Keywords</p>
                              <div className="flex flex-wrap gap-1">
                                {agent.keywords.slice(0, 3).map((keyword, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                                {agent.keywords.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                                  >
                                    +{agent.keywords.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer - Created date */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Created {new Date(agent.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditAgent(agent)}
                          className="flex-1 text-xs h-8 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteAgent(agent.id)}
                          className="flex-1 text-xs h-8 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
