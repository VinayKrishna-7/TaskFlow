import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
    <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B0F17] flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/25">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">TaskFlow</h1>
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Task Management</p>
        </div>
      </div>

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
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-slate-100'
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
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 bg-gradient-to-r from-blue-50/90 to-cyan-50/70 dark:from-blue-950/40 dark:to-cyan-950/30 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/50 dark:hover:to-cyan-900/40 border border-blue-200/80 dark:border-blue-800/60 transition-all cursor-pointer shadow-xs group my-1"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                  <span>AI Planner</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-600 text-white dark:bg-blue-500 shadow-xs">
                  AI
                </span>
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Bottom User Info */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
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