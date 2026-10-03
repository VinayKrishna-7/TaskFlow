import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  BarChart3,
  Users,
  Settings,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { AIAssistantModal } from './AIAssistantModal';
import { Avatar } from './Avatar';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { label: 'Projects', icon: FolderKanban, path: '/projects' },
    { label: 'Calendar', icon: Calendar, path: '/calendar' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Team', icon: Users, path: '/team' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 border-r border-[#E6DACB] dark:border-[#1F1F1F] bg-[#FAF6EE] dark:bg-[#000000] flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <Link
        to="/"
        title="Go to Home"
        className="h-16 px-6 border-b border-[#E6DACB] dark:border-[#1F1F1F] flex items-center gap-3 hover:bg-[#F3ECE2]/60 dark:hover:bg-[#121212] transition-all cursor-pointer group select-none"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-[#FFFDF9] font-bold shadow-md shadow-maroon-900/25 dark:shadow-[#992355]/30 group-hover:scale-105 transition-transform">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#2C1810] dark:text-slate-100 tracking-tight group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors">
            TaskFlow
          </h1>
          <p className="text-[10px] font-semibold text-maroon-600 dark:text-[#E66E9F] uppercase tracking-wider">
            Task Management
          </p>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <React.Fragment key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all',
                  isActive
                    ? 'bg-[#F3ECE2] text-maroon-700 dark:bg-[#38061B]/80 dark:text-[#F9CFE2] dark:border dark:border-[#821946]/50 font-semibold shadow-xs'
                    : 'text-[#7C6E65] dark:text-slate-400 hover:bg-[#F3ECE2]/80 dark:hover:bg-[#121212] hover:text-[#2C1810] dark:hover:text-slate-100'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>

            {item.path === '/projects' && (
              <button
                type="button"
                onClick={() => setIsAIModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-maroon-700 dark:text-[#F3A7C8] bg-gradient-to-r from-maroon-50 to-[#F5EFEB] dark:from-[#38061B]/50 dark:to-[#141414] hover:from-maroon-100 hover:to-[#EBE2D5] dark:hover:from-[#540F2C]/60 dark:hover:to-[#1A1A1A] border border-maroon-200/80 dark:border-[#821946]/60 transition-all cursor-pointer shadow-xs group my-1"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-maroon-600 dark:text-[#E66E9F] group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                  <span>AI Planner</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-maroon-600 text-white dark:bg-[#992355] shadow-xs">
                  AI
                </span>
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Bottom User Info */}
      <div className="p-4 border-t border-[#E6DACB] dark:border-[#1F1F1F] flex items-center gap-3">
        <Avatar src={user?.avatar} name={user?.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#2C1810] dark:text-slate-200 truncate">{user?.name}</p>
          <p className="text-[10px] text-[#7C6E65] dark:text-slate-400 truncate">{user?.email}</p>
        </div>
      </div>

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        workspaceId={activeWorkspace?._id}
      />
    </aside>
  );
};