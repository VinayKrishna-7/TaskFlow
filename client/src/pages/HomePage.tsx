import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Github,
  Kanban,
  Sparkles,
  BarChart3,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: Kanban,
    title: 'Simple Boards',
    desc: 'Move tasks from To Do to Done with a clean drag-and-drop board.',
  },
  {
    icon: Sparkles,
    title: 'AI Helper',
    desc: 'Type a project name and let AI build your task list automatically.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    desc: 'See what is done, what is left, and if you are on schedule.',
  },
  {
    icon: Users,
    title: 'Work Together',
    desc: 'Invite teammates and collaborate on tasks in real time.',
  },
];

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#000000] text-[#2C1810] dark:text-slate-100 flex flex-col">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-[#E6DACB] dark:border-[#1C1C1C] bg-[#FAF6EE]/90 dark:bg-[#000000]/90 backdrop-blur-md">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group select-none">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#800020] to-[#540015] dark:from-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white group-hover:opacity-80 transition-opacity">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm tracking-tight">TaskFlow</span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-[#7C6E65] dark:text-slate-500 hover:text-[#2C1810] dark:hover:text-slate-200 hover:bg-[#EDE6DC] dark:hover:bg-[#111] transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="ml-2 flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium bg-[#800020] dark:bg-[#992355] hover:bg-[#6B0018] dark:hover:bg-[#BD326D] text-white rounded-lg transition-colors"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-[#7C6E65] dark:text-slate-400 hover:text-[#2C1810] dark:hover:text-slate-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="ml-1 flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium bg-[#800020] dark:bg-[#992355] hover:bg-[#6B0018] dark:hover:bg-[#BD326D] text-white rounded-lg transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6">

        {/* ── Hero ── */}
        <section className="pt-28 pb-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-[#1A0D08] dark:text-white mb-5">
            Manage your tasks.
            <br />
            <span className="text-[#800020] dark:text-[#BD326D]">Get work done.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#7C6E65] dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-10">
            A clean, simple place to organise tasks, plan projects, and work with your team.
          </p>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#800020] dark:bg-[#992355] hover:bg-[#6B0018] dark:hover:bg-[#BD326D] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#800020] dark:bg-[#992355] hover:bg-[#6B0018] dark:hover:bg-[#BD326D] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-[#DDD0C4] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] hover:bg-[#F5EDE4] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="border-t border-[#E6DACB] dark:border-[#1C1C1C]" />

        {/* ── Features ── */}
        <section className="py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#800020] dark:text-[#992355] mb-10 text-center">
            What's inside
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E6DACB] dark:bg-[#1C1C1C] border border-[#E6DACB] dark:border-[#1C1C1C] rounded-2xl overflow-hidden">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="bg-[#FAF6EE] dark:bg-[#000000] p-8 hover:bg-[#F5EDE4] dark:hover:bg-[#0A0A0A] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F0E4E8] dark:bg-[#1C0812] flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-[#800020] dark:text-[#BD326D]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1A0D08] dark:text-slate-100 mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-[#7C6E65] dark:text-slate-500 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E6DACB] dark:border-[#1C1C1C] py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C6E65] dark:text-slate-500">
          <span className="font-medium text-[#2C1810] dark:text-slate-300">TaskFlow</span>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-[#800020] dark:hover:text-[#BD326D] transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-[#800020] dark:hover:text-[#BD326D] transition-colors">Get started</Link>
            <a
              href="https://github.com/VinayKrishna-7/TaskFlow"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#800020] dark:hover:text-[#BD326D] transition-colors"
            >
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};
