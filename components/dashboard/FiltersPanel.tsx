"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  Search, 
  X, 
  Calendar, 
  User, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Agent } from '@/types';

interface FiltersPanelProps {
  agents: Agent[];
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  search: string;
  selectedAgent: string;
  status: string;
  dateRange: string;
  writingStyle: string;
  tone: string;
}

const initialFilters: FilterState = {
  search: '',
  selectedAgent: 'all',
  status: 'all',
  dateRange: 'all',
  writingStyle: 'all',
  tone: 'all'
};

export function FiltersPanel({ agents, onFiltersChange, className = "" }: FiltersPanelProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      value !== 'all' && value !== ''
    ).length;
  };

  const writingStyles = Array.from(new Set(agents.map(a => a.writingStyle))).filter(Boolean);
  const tones = Array.from(new Set(agents.map(a => a.tone))).filter(Boolean);

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-green-600" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge className="ml-2 bg-green-100 text-green-800">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">

        {/* Agent Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            AI Agent
          </Label>
          <Select value={filters.selectedAgent} onValueChange={(value) => updateFilter('selectedAgent', value)}>
            <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {agent.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Status
          </Label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-orange-500" />
                  Pending
                </div>
              </SelectItem>
              <SelectItem value="in-progress">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                  In Progress
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Completed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            <Separator />
            
            {/* Writing Style */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Writing Style
              </Label>
              <Select value={filters.writingStyle} onValueChange={(value) => updateFilter('writingStyle', value)}>
                <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="All Styles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  {writingStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tone */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Tone
              </Label>
              <Select value={filters.tone} onValueChange={(value) => updateFilter('tone', value)}>
                <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="All Tones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tones</SelectItem>
                  {tones.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Date Range
              </Label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}