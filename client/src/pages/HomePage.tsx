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
  BarChart3,
  Clock,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const features = [
    {
      icon: <Kanban className="w-6 h-6" />,
      title: 'Simple Boards',
      desc: 'Drag tasks from To Do → In Progress → Done. See your whole day at a glance.',
      accent: 'from-[#800020] to-[#540015] dark:from-[#BD326D] dark:to-[#992355]',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Helper',
      desc: 'Type a project name and let AI build your task list in seconds.',
      accent: 'from-[#800020] to-[#540015] dark:from-[#BD326D] dark:to-[#992355]',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Track Progress',
      desc: 'See how much you have done, what is left, and if you are on time.',
      accent: 'from-[#800020] to-[#540015] dark:from-[#BD326D] dark:to-[#992355]',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Work Together',
      desc: 'Invite your team, share tasks, and see updates as they happen.',
      accent: 'from-[#800020] to-[#540015] dark:from-[#BD326D] dark:to-[#992355]',
    },
  ];

  const stats = [
    { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Tasks completed every day' },
    { icon: <Zap className="w-4 h-4" />, label: 'Fast and lightweight' },
    { icon: <Clock className="w-4 h-4" />, label: 'Always up to date' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#000000] text-[#2C1810] dark:text-slate-100 flex flex-col transition-colors">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E6DACB] dark:border-[#1A1A1A] bg-[#FAF6EE]/80 dark:bg-[#000000]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight group-hover:text-maroon-700 dark:group-hover:text-[#E66E9F] transition-colors">
              TaskFlow
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-[#4A3B32] dark:text-slate-400 hover:text-maroon-600 dark:hover:text-[#E66E9F] hover:bg-[#F0E8DC] dark:hover:bg-[#111111] rounded-lg transition-all border border-transparent hover:border-[#E6DACB] dark:hover:border-[#2A2A2A]"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#800020] hover:bg-[#6B0018] dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#4A3B32] dark:text-slate-300 hover:text-[#800020] dark:hover:text-[#E66E9F] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#800020] hover:bg-[#6B0018] dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* subtle radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[700px] h-[500px] rounded-full bg-[#800020]/8 dark:bg-[#992355]/10 blur-[120px]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-24 pb-20 text-center">
            {/* pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4B8BC] dark:border-[#3D1A2B] bg-[#F5E6E9] dark:bg-[#1C0812] text-[#800020] dark:text-[#E66E9F] text-xs font-semibold tracking-wide mb-8 select-none">
              <Zap className="w-3 h-3" />
              Simple task management — no clutter
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              <span className="text-[#2C1810] dark:text-white">Manage your tasks.</span>
              <br />
              <span className="bg-gradient-to-r from-[#800020] via-[#A0002A] to-[#C0304A] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#E66E9F] bg-clip-text text-transparent">
                Get work done.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#7C6E65] dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
              A clean, simple place to keep track of your tasks, plan your projects, and work with your team — all in one spot.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#800020] hover:bg-[#6B0018] dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-[#800020]/25 dark:shadow-[#992355]/30 hover:scale-[1.02] active:scale-100"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#800020] hover:bg-[#6B0018] dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-[#800020]/25 dark:shadow-[#992355]/30 hover:scale-[1.02] active:scale-100"
                  >
                    Start for free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-white dark:bg-[#0D0D0D] border border-[#DDD0C4] dark:border-[#2A2A2A] hover:bg-[#F5EDE4] dark:hover:bg-[#141414] text-[#2C1810] dark:text-slate-200 font-semibold text-sm rounded-2xl transition-all"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            {/* quick stats strip */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#7C6E65] dark:text-slate-500">
                  <span className="text-[#800020] dark:text-[#BD326D]">{s.icon}</span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section className="py-16 px-5 sm:px-8">
          <div className="max-w-5xl mx-auto">
            {/* section label */}
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#800020] dark:text-[#992355] mb-2">
                What you get
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] dark:text-white">
                Everything you need, nothing you don't
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative p-6 bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#E6DACB] dark:border-[#1F1F1F] hover:border-[#C49AAB] dark:hover:border-[#4A1A31] shadow-sm hover:shadow-md dark:shadow-none transition-all duration-200 overflow-hidden"
                >
                  {/* hover glow */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#800020]/4 to-transparent dark:from-[#992355]/6" />

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform duration-200`}>
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-[#2C1810] dark:text-slate-100 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#7C6E65] dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        {!isAuthenticated && (
          <section className="py-16 px-5 sm:px-8">
            <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#800020] to-[#540015] dark:from-[#1C0812] dark:to-[#2D0F1E] border border-[#A0002A] dark:border-[#4A1A31] rounded-3xl px-8 py-14 shadow-xl shadow-[#800020]/15 dark:shadow-[#992355]/10 relative overflow-hidden">
              {/* decorative circle */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 dark:bg-[#992355]/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5 dark:bg-[#992355]/8"
              />

              <h2 className="relative text-3xl sm:text-4xl font-extrabold text-white dark:text-slate-100 mb-4">
                Ready to get started?
              </h2>
              <p className="relative text-sm sm:text-base text-white/70 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Create a free account and start managing your tasks in under a minute.
              </p>
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white dark:bg-[#992355] hover:bg-[#F5EDE4] dark:hover:bg-[#BD326D] text-[#800020] dark:text-white font-bold text-sm rounded-2xl transition-all shadow-md hover:scale-[1.02] active:scale-100"
                >
                  Create free account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 border border-white/30 dark:border-[#4A1A31] hover:bg-white/10 dark:hover:bg-[#1C0812] text-white dark:text-slate-300 font-semibold text-sm rounded-2xl transition-all"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E6DACB] dark:border-[#1A1A1A] py-8 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#800020] to-[#540015] dark:from-[#BD326D] dark:to-[#992355] flex items-center justify-center text-white">
              <Layers className="w-3 h-3" />
            </div>
            <span className="text-sm font-bold text-[#2C1810] dark:text-slate-200">TaskFlow</span>
            <span className="text-xs text-[#7C6E65] dark:text-slate-500">— simple task management</span>
          </div>

          <div className="flex items-center gap-5 text-xs text-[#7C6E65] dark:text-slate-500">
            <Link to="/login" className="hover:text-[#800020] dark:hover:text-[#E66E9F] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-[#800020] dark:hover:text-[#E66E9F] transition-colors">
              Get Started
            </Link>
            <a
              href="https://github.com/VinayKrishna-7/TaskFlow"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#800020] dark:hover:text-[#E66E9F] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
