import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Kanban,
  Sparkles,
  Users,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const highlights = [
    {
      icon: <Kanban className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Simple Boards',
      desc: 'Drag tasks effortlessly across To Do, In Progress, and Done with an intuitive visual board.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'AI Helper',
      desc: 'Turn project goals into structured task lists, checklists, and action plans in seconds.',
    },
    {
      icon: <Users className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Work Together',
      desc: 'Invite your teammates, assign tasks, and collaborate live in real time with zero clutter.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF6EE] dark:bg-[#000000] text-[#2C1810] dark:text-slate-100 transition-colors selection:bg-maroon-600/20 selection:text-maroon-800 dark:selection:bg-[#992355]/30 dark:selection:text-[#F9CFE2]">
      {/* ── Top Navigation ── */}
      <header className="w-full shrink-0 border-b border-[#E6DACB] dark:border-[#242424] bg-[#FAF6EE]/90 dark:bg-[#000000]/90 backdrop-blur-md sticky top-0 z-40">
        <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white shadow-md shadow-maroon-900/15 dark:shadow-[#992355]/25 group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#2C1810] dark:text-white group-hover:text-maroon-700 dark:group-hover:text-[#BD326D] transition-colors">
              TaskFlow
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">


            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl text-[#7C6E65] dark:text-slate-400 hover:text-[#2C1810] dark:hover:text-slate-100 hover:bg-[#F0E8DC] dark:hover:bg-[#141414] transition-colors border border-transparent hover:border-[#E6DACB] dark:hover:border-[#242424]"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-maroon-900/15 dark:shadow-[#992355]/25 hover:scale-[1.02]"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#7C6E65] dark:text-slate-300 hover:text-[#2C1810] dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-maroon-900/15 dark:shadow-[#992355]/25 hover:scale-[1.02]"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── Main Content (Full-sized, Bold & Centered) ── */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto w-full text-center relative">
        {/* Soft Ambient Glow in Dark Mode */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-maroon-600/5 dark:bg-[#992355]/12 blur-[130px] rounded-full"
        />

        {/* Live pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-maroon-700/20 dark:border-[#992355]/30 bg-maroon-600/5 dark:bg-[#992355]/15 text-maroon-700 dark:text-[#E66E9F] text-xs sm:text-sm font-medium mb-6 select-none shadow-xs">
          <span className="w-2 h-2 rounded-full bg-maroon-600 dark:bg-[#BD326D] animate-pulse" />
          <span>Simple, focused task management</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#1A0D08] dark:text-white mb-6">
          Manage your tasks.
          <br />
          <span className="bg-gradient-to-r from-maroon-700 via-maroon-600 to-maroon-500 dark:from-[#F3A7C8] dark:via-[#BD326D] dark:to-[#992355] bg-clip-text text-transparent">
            Get work done.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-[#7C6E65] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
          A clean, minimal workspace to organize your daily tasks, track team projects, and keep everything in sync with zero clutter.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-maroon-900/20 dark:shadow-[#992355]/30 hover:scale-[1.02] active:scale-100"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/tasks"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 border border-[#E6DACB] dark:border-[#242424] bg-white dark:bg-[#0D0D0D] hover:bg-[#F5EDE4] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 font-semibold text-base rounded-2xl transition-all shadow-xs"
              >
                <span>View Tasks</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-maroon-900/20 dark:shadow-[#992355]/30 hover:scale-[1.02] active:scale-100"
              >
                <span>Start for free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 border border-[#E6DACB] dark:border-[#242424] bg-white dark:bg-[#0D0D0D] hover:bg-[#F5EDE4] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 font-semibold text-base rounded-2xl transition-all shadow-xs"
              >
                <span>Sign in</span>
              </Link>
            </>
          )}
        </div>

        {/* User state indicator */}
        {isAuthenticated && user?.name && (
          <p className="mt-4 text-sm text-[#7C6E65] dark:text-slate-400">
            Welcome back, <span className="font-semibold text-[#2C1810] dark:text-slate-200">{user.name}</span> • Your workspace is ready
          </p>
        )}

        {/* ── Feature Pillars (Properly sized & spaced) ── */}
        <div className="w-full max-w-4xl mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-[#E6DACB] dark:border-[#242424]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-left">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex flex-col items-start space-y-2">
                <div className="w-10 h-10 rounded-xl bg-maroon-50 dark:bg-[#38061B]/60 border border-maroon-200/60 dark:border-[#821946]/50 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-[#1A0D08] dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-sm text-[#7C6E65] dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full shrink-0 border-t border-[#E6DACB] dark:border-[#242424] py-6 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#800020] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-[#2C1810] dark:text-slate-200 group-hover:text-maroon-700 dark:group-hover:text-[#BD326D] transition-colors">
              TaskFlow
            </span>
          </Link>

          <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-slate-400 text-center sm:text-right">
            A simple, clean task and project management tool for teams.
          </p>
        </div>
      </footer>
    </div>
  );
};
