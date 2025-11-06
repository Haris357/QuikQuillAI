"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Users,
  FileText,
  Settings,
  HelpCircle,
  CreditCard,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Sparkles,
  User,
  LogOut,
  TrendingUp,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  agentCount: number;
  taskCount: number;
  tokensUsed?: number;
  tokensLimit?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenSettings?: () => void;
  onOpenUpgrade?: () => void;
  onOpenHelp?: () => void;
}

export function Sidebar({ 
  currentView, 
  onViewChange, 
  agentCount, 
  taskCount,
  tokensUsed = 0,
  tokensLimit = 10000,
  isCollapsed = false,
  onToggleCollapse,
  onOpenSettings,
  onOpenUpgrade,
  onOpenHelp
}: SidebarProps) {
  const { user, signOut } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      badge: null,
      description: 'Overview and analytics'
    },
    {
      id: 'agents',
      label: 'AI Agents',
      icon: Users,
      badge: agentCount > 0 ? agentCount.toString() : null,
      description: 'Manage your AI writers'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: FileText,
      badge: taskCount > 0 ? taskCount.toString() : null,
      description: 'Writing assignments'
    }
  ];

  const bottomItems = [
    {
      id: 'upgrade',
      label: 'Upgrade to Pro',
      icon: Star,
      badge: 'NEW',
      description: 'Unlock premium features',
      special: true,
      onClick: onOpenUpgrade
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
      description: 'Account preferences',
      onClick: onOpenSettings
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      badge: null,
      description: 'Get assistance',
      onClick: onOpenHelp
    }
  ];

  const NavItem = ({ item, isBottom = false }: { item: any; isBottom?: boolean }) => {
    const handleClick = () => {
      if (item.onClick) {
        item.onClick();
      } else {
        onViewChange(item.id);
      }
    };

    return (
      <div className="nav-item-wrapper">
        <Button
          variant="ghost"
          onClick={handleClick}
          className={cn(
            "w-full justify-start h-12 px-3 mb-1 transition-all duration-200",
            currentView === item.id 
              ? "bg-green-600 text-white hover:bg-green-700 hover:text-white" 
              : "text-gray-600 hover:bg-green-600 hover:text-white",
            isCollapsed && "justify-center px-2",
            item.special && "bg-green-50 hover:bg-green-600 hover:text-white text-green-700 border border-green-200 font-medium"
          )}
        >
          <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "" : "mr-3")} />
          
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant={item.special ? "default" : "secondary"}
                  className={cn(
                    "ml-auto text-xs",
                    item.special ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col h-full shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">QuikQuill</h1>
                <p className="text-xs text-gray-500">AI Writing Platform</p>
              </div>
            </div>
          )}
          
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-100">
          <div className="space-y-2">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white justify-start font-medium"
              onClick={() => onViewChange('create-agent')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New AI Agent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-gray-200 hover:bg-green-600 hover:text-white"
              onClick={() => onViewChange('create-task')}
            >
              <FileText className="h-3 w-3 mr-1" />
              New Task
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Main Menu
            </p>
          )}
          
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>
        </div>

        {/* Stats Section */}
        {!isCollapsed && (
          <div className="px-6 py-4 mt-4">
            {/* Token Usage */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
              <div className="flex items-center mb-3">
                <Zap className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">API Usage</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Tokens Used</span>
                  <span className="font-semibold text-blue-800">{tokensUsed.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(tokensUsed / tokensLimit) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-blue-600">
                  <span>{Math.round((tokensUsed / tokensLimit) * 100)}% used</span>
                  <span>{(tokensLimit - tokensUsed).toLocaleString()} left</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Quick Stats</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Active Agents</span>
                  <span className="font-semibold text-green-800">{agentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Total Tasks</span>
                  <span className="font-semibold text-green-800">{taskCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">This Month</span>
                  <span className="font-semibold text-green-800">+{Math.floor(taskCount * 0.7)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 p-3">
        {!isCollapsed && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Account
          </p>
        )}
        
        <nav className="space-y-1">
          {bottomItems.map((item) => (
            <NavItem key={item.id} item={item} isBottom />
          ))}
        </nav>

        {/* User Profile */}
        {user && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-12 px-3 hover:bg-green-600 hover:text-white",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback className="bg-green-600 text-white text-sm">
                      {user.displayName?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {!isCollapsed && (
                    <div className="ml-3 flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenSettings}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing & Plans
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}