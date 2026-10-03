import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  Layers,
  ArrowRight,
  Kanban,
  Sparkles,
  CheckCircle2,
  Users,
  Sun,
  Moon,
  Github,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const simpleFeatures = [
    {
      icon: <Kanban className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Simple Boards',
      desc: 'Move tasks from To Do to Done with an easy drag-and-drop board.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'AI Helper',
      desc: 'Create task lists and project plans automatically with AI.',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Track Progress',
      desc: 'See completed tasks, upcoming dates, and overall progress at a glance.',
    },
    {
      icon: <Users className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Work Together',
      desc: 'Invite your teammates and work together on tasks in real time.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#000000] text-[#2C1810] dark:text-slate-100 flex flex-col transition-colors selection:bg-maroon-600/20 selection:text-maroon-800 dark:selection:bg-[#992355]/30 dark:selection:text-[#F9CFE2]">
      {/* Navigation */}
      <header className="w-full border-b border-[#E6DACB] dark:border-[#242424] bg-[#FAF6EE]/90 dark:bg-[#000000]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white shadow-md shadow-maroon-900/20 dark:shadow-[#992355]/30 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors">
              TaskFlow
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-[#4A3B32] dark:text-slate-300 hover:text-maroon-600 dark:hover:text-amber-400 hover:bg-[#F3ECE2] dark:hover:bg-[#141414] rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#E6DACB] dark:hover:border-[#242424]"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-[#4A3B32] dark:text-slate-300 hover:text-maroon-700 dark:hover:text-[#E66E9F] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#2C1810] dark:text-white leading-[1.15]">
            Manage your tasks. <br />
            <span className="text-maroon-700 dark:text-[#BD326D]">Get work done.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#7C6E65] dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            A simple, clean place to organize your daily tasks, track projects, and work with your team.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/20 dark:shadow-[#992355]/30 hover:scale-[1.02]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/20 dark:shadow-[#992355]/30 hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-[#242424] hover:bg-[#F3ECE2] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 font-semibold text-sm rounded-xl transition-all shadow-xs"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* 4 Simple Feature Cards */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full border-t border-[#E6DACB]/70 dark:border-[#242424]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {simpleFeatures.map((item, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-[#242424] shadow-xs space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-maroon-50 dark:bg-[#38061B]/60 border border-maroon-200/80 dark:border-[#821946]/60 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-[#2C1810] dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-xs text-[#7C6E65] dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6DACB] dark:border-[#242424] py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C6E65] dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#2C1810] dark:text-slate-200">TaskFlow</span>
            <span>• Simple task management</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-maroon-700 dark:hover:text-[#E66E9F] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-maroon-700 dark:hover:text-[#E66E9F] transition-colors">
              Get Started
            </Link>
            <a
              href="https://github.com/VinayKrishna-7/TaskFlow"
              target="_blank"
              rel="noreferrer"
              className="hover:text-maroon-700 dark:hover:text-[#E66E9F] flex items-center gap-1 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
