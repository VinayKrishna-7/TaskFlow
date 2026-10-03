import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menus on outside click or Esc
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
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