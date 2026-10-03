import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  Layers,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';

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



      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E6DACB] dark:border-[#1C1C1C] py-8 px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
