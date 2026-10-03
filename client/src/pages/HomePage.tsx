import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Kanban,
  BarChart3,
  Users2,
  Calendar,
  CheckCircle2,
  Sun,
  Moon,
  Github,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const features = [
    {
      icon: <Kanban className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Interactive Kanban Boards',
      description:
        'Smooth drag-and-drop movement across customizable stages: To Do, In Progress, In Review, and Completed.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'AI Task Decomposition',
      description:
        'Break down high-level project goals into actionable milestones, estimates, and subtasks using Google Gemini AI.',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Productivity Analytics',
      description:
        'Real-time velocity tracking, completion ratios, priority breakdowns, and overdue alerts for full transparency.',
    },
    {
      icon: <Users2 className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Real-Time Team Sync',
      description:
        'Instant multi-user updates powered by Socket.IO. Changes appear on your teammates’ screens in milliseconds.',
    },
    {
      icon: <Calendar className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Timeline & Deadlines',
      description:
        'Track schedules, due dates, and time estimates on a centralized calendar view so nothing slips through.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-maroon-600 dark:text-[#E66E9F]" />,
      title: 'Secure & Lightweight',
      description:
        'Robust email account authentication with persistent sessions, secure password handling, and instant access.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#000000] text-[#2C1810] dark:text-slate-100 flex flex-col transition-colors selection:bg-maroon-600/20 selection:text-maroon-800 dark:selection:bg-[#992355]/30 dark:selection:text-[#F9CFE2]">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E6DACB] dark:border-[#242424] bg-[#FAF6EE]/90 dark:bg-[#000000]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group select-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white shadow-md shadow-maroon-900/20 dark:shadow-[#992355]/30 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors">
              TaskFlow
            </span>
          </Link>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-[#4A3B32] dark:text-slate-300 hover:text-maroon-700 dark:hover:text-[#E66E9F] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-maroon-50 dark:bg-[#38061B]/60 border border-maroon-200/80 dark:border-[#821946]/60 text-maroon-700 dark:text-[#F9CFE2] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-maroon-600 dark:text-[#E66E9F]" />
            <span>AI-Powered Project & Sprint Management</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-[#2C1810] dark:text-white">
            Organize deliverables. <br className="hidden sm:inline" />
            Ship faster with <span className="text-maroon-700 dark:text-[#BD326D]">clarity</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#7C6E65] dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            TaskFlow combines interactive Kanban boards, Google Gemini AI task decomposition, and productivity analytics in a fast, minimal workspace.
          </p>

          {/* Call to Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/20 dark:shadow-[#992355]/30 hover:scale-[1.02]"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/20 dark:shadow-[#992355]/30 hover:scale-[1.02]"
                >
                  <span>Start Free with Email</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-[#E6DACB] dark:border-[#242424] hover:bg-[#F3ECE2] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 font-semibold text-sm rounded-xl transition-all shadow-xs"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* 3. Sleek App Preview Card */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="p-3 sm:p-5 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-3xl border border-[#E6DACB]/80 dark:border-[#242424] shadow-2xl">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E6DACB]/70 dark:border-[#242424]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[11px] font-semibold text-[#7C6E65] dark:text-slate-400">
                TaskFlow Workspace • Sprint View
              </span>
              <div className="w-10" />
            </div>

            {/* Mockup columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Column 1 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] dark:bg-[#141414] border border-[#E6DACB]/60 dark:border-[#242424] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
                    To Do
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    2
                  </span>
                </div>
                <div className="p-3 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-xl border border-[#E6DACB]/80 dark:border-[#242424] space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      Medium
                    </span>
                    <span className="text-[10px] text-[#7C6E65] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Tomorrow
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#2C1810] dark:text-slate-100">
                    Implement OAuth token refresh strategy
                  </p>
                </div>
                <div className="p-3 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-xl border border-[#E6DACB]/80 dark:border-[#242424] space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-slate-300">
                      Low
                    </span>
                    <span className="text-[10px] text-[#7C6E65]">Oct 6</span>
                  </div>
                  <p className="text-xs font-semibold text-[#2C1810] dark:text-slate-100">
                    Optimize client bundle gzip assets
                  </p>
                </div>
              </div>

              {/* Column 2 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] dark:bg-[#141414] border border-[#E6DACB]/60 dark:border-[#242424] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-maroon-700 dark:text-[#E66E9F]">
                    In Progress
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-maroon-100 dark:bg-[#38061B] text-maroon-800 dark:text-[#F9CFE2]">
                    1
                  </span>
                </div>
                <div className="p-3 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-xl border-2 border-maroon-500/50 dark:border-[#992355] space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      High
                    </span>
                    <span className="text-[10px] text-maroon-600 dark:text-[#E66E9F] font-semibold">
                      In Review
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#2C1810] dark:text-slate-100">
                    Integrate Gemini AI sprint breakdown
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#7C6E65]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>3 of 4 subtasks completed</span>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] dark:bg-[#141414] border border-[#E6DACB]/60 dark:border-[#242424] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Completed
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                    4
                  </span>
                </div>
                <div className="p-3 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-xl border border-[#E6DACB]/80 dark:border-[#242424] opacity-85 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Done
                    </span>
                    <span className="text-[10px] text-[#7C6E65]">Today</span>
                  </div>
                  <p className="text-xs font-semibold text-[#2C1810] dark:text-slate-300 line-through">
                    Pure black and plum theme overhaul
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#E6DACB]/70 dark:border-[#242424]">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2C1810] dark:text-white">
              Everything your team needs to deliver
            </h2>
            <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-slate-400">
              Clean, focused tooling without bloated complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB]/80 dark:border-[#242424] shadow-sm hover:shadow-md hover:border-maroon-300 dark:hover:border-[#992355]/60 transition-all space-y-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-maroon-50 dark:bg-[#38061B]/60 border border-maroon-200/80 dark:border-[#821946]/60 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-bold text-[#2C1810] dark:text-slate-100">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#7C6E65] dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Minimal Bottom CTA Banner */}
        <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-maroon-50 via-[#FAF6EE] to-maroon-100/50 dark:from-[#141414] dark:via-[#0D0D0D] dark:to-[#1a0a12] border border-maroon-200/80 dark:border-[#821946]/50 shadow-lg space-y-5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] dark:text-white">
              Ready to streamline your task management?
            </h3>
            <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-slate-300 max-w-lg mx-auto">
              Create an account with your email in seconds. No setup fees, no complex onboarding.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-maroon-900/20 dark:shadow-[#992355]/30 hover:scale-[1.02]"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-[#E6DACB] dark:border-[#242424] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7C6E65] dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-maroon-600 dark:bg-[#992355] flex items-center justify-center text-white text-[10px]">
              <Layers className="w-3 h-3" />
            </div>
            <span className="font-semibold text-[#2C1810] dark:text-slate-200">TaskFlow</span>
            <span>• © {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-maroon-700 dark:hover:text-[#E66E9F] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-maroon-700 dark:hover:text-[#E66E9F] transition-colors">
              Create Account
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
