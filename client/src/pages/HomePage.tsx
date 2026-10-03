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
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const minimalFeatures = [
    {
      icon: <Kanban className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Simple Boards',
      desc: 'Drag tasks effortlessly across To Do, In Progress, and Done. See your entire day at a glance.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'AI Helper',
      desc: 'Type your project goal and let AI create structured task lists and action items in seconds.',
    },
    {
      icon: <Users className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Work Together',
      desc: 'Invite your team, assign tasks, and watch updates happen live in real time.',
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

          <div className="flex items-center gap-2 sm:gap-3">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
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

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="pt-20 sm:pt-28 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          {/* Minimal badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-maroon-700/20 dark:border-[#992355]/40 bg-maroon-600/5 dark:bg-[#992355]/15 text-maroon-700 dark:text-[#E66E9F] text-xs font-medium mb-6 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-maroon-600 dark:bg-[#BD326D] animate-pulse" />
            <span>Simple task management for teams</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-[#1A0D08] dark:text-white mb-6">
            Manage your tasks.
            <br />
            <span className="bg-gradient-to-r from-maroon-700 via-maroon-600 to-maroon-500 dark:from-[#E66E9F] dark:via-[#BD326D] dark:to-[#992355] bg-clip-text text-transparent">
              Get work done.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#7C6E65] dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
            A clean, focused space to organize your daily tasks, track projects, and work with your team with zero clutter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/15 dark:shadow-[#992355]/25 hover:scale-[1.02]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/15 dark:shadow-[#992355]/25 hover:scale-[1.02]"
                >
                  <span>Start for free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-[#E6DACB] dark:border-[#242424] bg-[#FFFDF9] dark:bg-[#0D0D0D] hover:bg-[#F5EDE4] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 font-medium text-sm rounded-xl transition-colors"
                >
                  <span>Sign in</span>
                </Link>
              </>
            )}
          </div>

        </section>

        {/* ── Minimal 3-Feature Section ── */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#E6DACB] dark:border-[#1F1F1F]">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A0D08] dark:text-white mb-3">
              Built for everyday productivity
            </h2>
            <p className="text-sm text-[#7C6E65] dark:text-slate-400">
              Only the tools you need to move work forward without unnecessary complications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {minimalFeatures.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-[#E6DACB] dark:border-[#1F1F1F] bg-[#FFFDF9] dark:bg-[#0D0D0D] shadow-xs hover:border-maroon-300 dark:hover:border-[#992355]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-maroon-50 dark:bg-[#38061B]/50 border border-maroon-200/60 dark:border-[#821946]/50 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-[#1A0D08] dark:text-slate-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#7C6E65] dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Minimal Closing Call to Action ── */}
        {!isAuthenticated && (
          <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
            <div className="p-8 sm:p-12 rounded-3xl border border-[#E6DACB] dark:border-[#242424] bg-gradient-to-b from-[#FFFDF9] to-[#F5EFEB] dark:from-[#0D0D0D] dark:to-[#050505]">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A0D08] dark:text-white mb-3">
                Ready to organize your tasks?
              </h2>
              <p className="text-sm text-[#7C6E65] dark:text-slate-400 max-w-md mx-auto mb-6">
                Create a free account in seconds and start managing your tasks the clean way.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/15 dark:shadow-[#992355]/25 hover:scale-[1.02]"
              >
                <span>Create free account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}
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
