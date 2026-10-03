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
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const highlights = [
    {
      icon: <Kanban className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Simple Boards',
      desc: 'Drag tasks effortlessly across To Do, In Progress, and Done. Keep your day organized and visible.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'AI Helper',
      desc: 'Type your project goal and let AI create structured task lists and action items in seconds.',
    },
    {
      icon: <Users className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Work Together',
      desc: 'Invite your team, assign tasks, and collaborate in real time with zero unnecessary clutter.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#000000] text-[#2C1810] dark:text-slate-100 flex flex-col transition-colors selection:bg-maroon-600/20 selection:text-maroon-800 dark:selection:bg-[#992355]/30 dark:selection:text-[#F9CFE2]">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 border-b border-[#E6DACB] dark:border-[#1F1F1F] bg-[#FAF6EE]/90 dark:bg-[#000000]/90 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-[#2C1810] dark:text-white group-hover:text-maroon-700 dark:group-hover:text-[#BD326D] transition-colors">
              TaskFlow
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick nav links for logged-in users */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#7C6E65] dark:text-slate-400 mr-2">
                <Link
                  to="/tasks"
                  className="px-2.5 py-1.5 rounded-lg hover:text-[#2C1810] dark:hover:text-slate-100 hover:bg-[#F0E8DC] dark:hover:bg-[#141414] transition-colors"
                >
                  Tasks
                </Link>
                <Link
                  to="/projects"
                  className="px-2.5 py-1.5 rounded-lg hover:text-[#2C1810] dark:hover:text-slate-100 hover:bg-[#F0E8DC] dark:hover:bg-[#141414] transition-colors"
                >
                  Projects
                </Link>
              </div>
            )}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-[#7C6E65] dark:text-slate-400 hover:text-[#2C1810] dark:hover:text-slate-100 hover:bg-[#F0E8DC] dark:hover:bg-[#141414] transition-colors border border-transparent hover:border-[#E6DACB] dark:hover:border-[#242424]"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-maroon-900/15 dark:shadow-[#992355]/25 hover:scale-[1.02]"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-medium text-[#7C6E65] dark:text-slate-400 hover:text-[#2C1810] dark:hover:text-slate-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col justify-center">
        {/* Ambient Top Glow in Dark Mode */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-maroon-600/5 dark:bg-[#992355]/10 blur-[130px] rounded-full"
        />

        {/* ── Hero Section ── */}
        <section className="relative px-5 sm:px-8 pt-20 pb-20 sm:pt-28 sm:pb-24 max-w-4xl mx-auto text-center">
          {/* Subtle live badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-maroon-700/20 dark:border-[#992355]/30 bg-maroon-600/5 dark:bg-[#992355]/15 text-maroon-700 dark:text-[#E66E9F] text-xs font-medium mb-6 select-none shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-maroon-600 dark:bg-[#BD326D] animate-pulse" />
            <span>Simple, focused task management</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#1A0D08] dark:text-white mb-6">
            Manage your tasks.
            <br />
            <span className="bg-gradient-to-r from-maroon-700 via-maroon-600 to-maroon-500 dark:from-[#F3A7C8] dark:via-[#BD326D] dark:to-[#992355] bg-clip-text text-transparent">
              Get work done.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#7C6E65] dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
            A clean, minimal workspace to organize your daily tasks, track team projects, and keep everything in sync with zero clutter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/15 dark:shadow-[#992355]/25 hover:scale-[1.02]"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/tasks"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-[#E6DACB] dark:border-[#242424] bg-[#FFFDF9] dark:bg-[#0D0D0D] hover:bg-[#F5EDE4] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 font-medium text-sm rounded-xl transition-colors"
                >
                  <span>View Tasks</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/15 dark:shadow-[#992355]/25 hover:scale-[1.02]"
                >
                  <span>Start for free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 border border-[#E6DACB] dark:border-[#242424] bg-[#FFFDF9] dark:bg-[#0D0D0D] hover:bg-[#F5EDE4] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 font-medium text-sm rounded-xl transition-colors"
                >
                  <span>Sign in</span>
                </Link>
              </>
            )}
          </div>

          {/* User state indicator */}
          {isAuthenticated && user?.name && (
            <p className="mt-6 text-xs text-[#7C6E65] dark:text-slate-500">
              Welcome back, <span className="font-semibold text-[#2C1810] dark:text-slate-300">{user.name}</span> • Your workspace is ready
            </p>
          )}
        </section>

        {/* ── Minimal 3-Feature Section ── */}
        <section className="border-t border-[#E6DACB] dark:border-[#1A1A1A] py-16 px-5 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex flex-col items-start space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-maroon-50 dark:bg-[#38061B]/60 border border-maroon-200/60 dark:border-[#821946]/50 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-[#1A0D08] dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E6DACB] dark:border-[#1F1F1F] py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#800020] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#2C1810] dark:text-slate-200 group-hover:text-maroon-700 dark:group-hover:text-[#BD326D] transition-colors">
              TaskFlow
            </span>
          </Link>

          <p className="text-xs text-[#7C6E65] dark:text-slate-500 text-center sm:text-right">
            A simple, clean task and project management tool for teams.
          </p>
        </div>
      </footer>
    </div>
  );
};
