"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import NProgress from 'nprogress';
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
  Database,
  Crown,
  Clock,
  AlertCircle,
  ArrowUpRight
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
import { UserSubscription } from '@/types';
import { getDaysRemainingInTrial, formatTokenCount } from '@/lib/subscription';

interface SidebarProps {
  agentCount: number;
  taskCount: number;
  tokensUsed?: number;
  tokensLimit?: number;
  subscription?: UserSubscription | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenSettings?: () => void;
  onOpenUpgrade?: () => void;
  onOpenHelp?: () => void;
}

export function Sidebar({
  agentCount,
  taskCount,
  tokensUsed = 0,
  tokensLimit = 10000,
  subscription,
  isCollapsed = false,
  onToggleCollapse,
  onOpenSettings,
  onOpenUpgrade,
  onOpenHelp
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPro = subscription?.tier === 'pro';
  const isTrial = subscription?.status === 'trial';
  const daysRemaining = isTrial ? getDaysRemainingInTrial(subscription) : 0;

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      badge: null,
      description: 'Overview and analytics',
      href: '/dashboard'
    },
    {
      id: 'agents',
      label: 'AI Agents',
      icon: Users,
      badge: agentCount > 0 ? agentCount.toString() : null,
      description: 'Manage your AI writers',
      href: '/agents'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: FileText,
      badge: taskCount > 0 ? taskCount.toString() : null,
      description: 'Writing assignments',
      href: '/tasks'
    }
  ];

  const bottomItems = [
    // Show upgrade button only for non-Pro users
    ...(!isPro ? [{
      id: 'upgrade',
      label: 'Upgrade to Pro',
      icon: Crown,
      badge: isTrial && daysRemaining <= 1 ? `${daysRemaining}d` : 'NEW',
      description: 'Unlock premium features',
      special: true,
      onClick: onOpenUpgrade
    }] : [])
  ];

  const NavItem = ({ item, isBottom = false }: { item: any; isBottom?: boolean }) => {
    const isActive = item.href ? pathname === item.href : false;

    const buttonContent = (
      <>
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
      </>
    );

    const buttonClassName = cn(
      "w-full justify-start h-12 px-3 mb-1 transition-all duration-200",
      isActive
        ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
        : "text-gray-600 hover:bg-green-600 hover:text-white",
      isCollapsed && "justify-center px-2",
      item.special && "bg-green-50 hover:bg-green-600 hover:text-white text-green-700 border border-green-200 font-medium"
    );

    if (item.href) {
      const handleClick = () => {
        if (pathname !== item.href) {
          NProgress.start();
        }
      };

      return (
        <Link
          href={item.href}
          className="nav-item-wrapper block"
          onClick={handleClick}
          prefetch={true}
        >
          <Button
            variant="ghost"
            className={buttonClassName}
          >
            {buttonContent}
          </Button>
        </Link>
      );
    }

    return (
      <div className="nav-item-wrapper">
        <Button
          variant="ghost"
          onClick={item.onClick}
          className={buttonClassName}
        >
          {buttonContent}
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
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-gray-900">QuikQuill</h1>
                  {isPro && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                      <Crown className="h-3 w-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {isPro ? 'Pro Plan' : isTrial ? `${daysRemaining} days trial left` : 'AI Writing Platform'}
                </p>
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

      {/* Trial Warning */}
      {!isCollapsed && isTrial && daysRemaining <= 2 && (
        <div className="p-4 border-b border-gray-100">
          <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-900">Trial Ending Soon!</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {daysRemaining === 0 ? 'Last day' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onOpenUpgrade}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-7"
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade Now
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
        <div className="mt-4 pt-4 border-t border-gray-100">
          {user ? (
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
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <span>My Account</span>
                    {isPro && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        PRO
                      </Badge>
                    )}
                  </div>
                  {isTrial && daysRemaining <= 1 && (
                    <p className="text-xs text-yellow-600 font-normal mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} trial left
                    </p>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenSettings}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  NProgress.start();
                  router.push('/billing');
                }}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing & Plans
                </DropdownMenuItem>
                {!isPro && (
                  <DropdownMenuItem onClick={onOpenUpgrade} className="text-green-600 focus:text-green-700">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className={cn(
              "w-full h-12 px-3 flex items-center",
              isCollapsed && "justify-center px-2"
            )}>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
              {!isCollapsed && (
                <div className="ml-3 flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}