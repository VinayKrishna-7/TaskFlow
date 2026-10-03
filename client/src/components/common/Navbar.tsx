import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Bell,
  CheckCheck,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { formatDistanceToNow } from 'date-fns';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data?.data?.notifications || [];
    },
    refetchInterval: 30000,
  });

  const notifications: any[] = notifData || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close menus on outside click or Esc
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (link) {
        setIsNotifOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 border-b border-[#E6DACB] dark:border-[#242424] bg-[#FAF6EE] dark:bg-[#000000] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Search Bar with Clear & Keyboard Esc */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#7C6E65] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchTerm('');
                searchInputRef.current?.blur();
              }
            }}
            placeholder="Search tasks, projects, keywords..."
            aria-label="Search tasks and projects"
            className="w-full pl-10 pr-9 py-2 bg-[#F5EFEB] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-[#242424] rounded-xl text-sm text-[#2C1810] dark:text-slate-100 placeholder-[#7C6E65]/70 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-[#992355] dark:focus:ring-[#992355]/30 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              title="Clear search (Esc)"
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7C6E65] hover:text-[#2C1810] dark:hover:text-slate-200 rounded-lg hover:bg-[#EBE2D5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsUserMenuOpen(false);
            }}
            className="relative p-2 text-[#2C1810] dark:text-slate-300 hover:text-maroon-600 dark:hover:text-[#E66E9F] hover:bg-[#F3ECE2] dark:hover:bg-[#141414] rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#E6DACB] dark:hover:border-[#242424]"
            title="Notifications"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-maroon-600 dark:bg-[#992355] ring-2 ring-[#FAF6EE] dark:ring-[#000000]" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-[#242424] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="p-3.5 border-b border-[#E6DACB] dark:border-[#242424] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2C1810] dark:text-slate-100">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-maroon-50 text-maroon-700 dark:bg-[#38061B] dark:text-[#F9CFE2] border border-maroon-200 dark:border-[#821946]/60">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-maroon-600 dark:text-[#E66E9F] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E6DACB]/50 dark:divide-[#242424]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-1.5">
                    <p className="text-sm font-semibold text-[#2C1810] dark:text-slate-200">
                      You're all caught up 🎉
                    </p>
                    <p className="text-xs text-[#7C6E65] dark:text-slate-400">No new notifications.</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div
                      key={notif._id}
                      onClick={() => handleMarkRead(notif._id, notif.link)}
                      className={`p-3.5 hover:bg-[#F5EFEB] dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${
                        !notif.isRead ? 'bg-maroon-50/50 dark:bg-[#38061B]/40' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[#2C1810] dark:text-slate-200 truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#7C6E65] dark:text-slate-400 flex-shrink-0">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-[#7C6E65] dark:text-slate-400 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-maroon-600 dark:bg-[#992355] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-[#2C1810] dark:text-slate-300 hover:text-maroon-600 dark:hover:text-amber-400 hover:bg-[#F3ECE2] dark:hover:bg-[#141414] rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#E6DACB] dark:hover:border-[#242424]"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-maroon-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* User Avatar Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotifOpen(false);
            }}
            aria-label="User account menu"
            className="flex items-center p-1 rounded-xl hover:bg-[#F3ECE2] dark:hover:bg-[#141414] transition-colors cursor-pointer border border-transparent hover:border-[#E6DACB] dark:hover:border-[#242424]"
          >
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-[#242424] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2.5 border-b border-[#E6DACB] dark:border-[#242424]">
                <p className="text-xs font-bold text-[#2C1810] dark:text-slate-100 truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-[#7C6E65] truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-maroon-50 dark:bg-[#38061B] text-maroon-700 dark:text-[#F9CFE2] border border-maroon-200 dark:border-[#821946]/60">
                  {user?.role}
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#2C1810] dark:text-slate-300 hover:bg-[#F5EFEB] dark:hover:bg-[#1A1A1A] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#7C6E65] dark:text-slate-400" />
                  Account & Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-[#E66E9F] hover:bg-rose-50 dark:hover:bg-[#38061B]/30 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};