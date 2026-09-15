import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { api } from '../lib/axios';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Layers, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setAuth, isAuthenticated } = useAuthStore();
  const { setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  // 1. Auto Sign-In: If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 2. Remember Me: Restore remembered user login details
  const savedRememberMe = localStorage.getItem('taskflow_remember_me') !== 'false';
  const savedLogin = localStorage.getItem('taskflow_remember_login') || '';

  const [emailOrUsername, setEmailOrUsername] = useState(savedLogin);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(savedRememberMe);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (savedLogin && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [savedLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedIdentifier = emailOrUsername.trim();
    if (!trimmedIdentifier) {
      setError('Please enter your email address or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        emailOrUsername: trimmedIdentifier,
        password,
      });

      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);

      // Save or remove remembered login details
      localStorage.setItem('taskflow_remember_me', rememberMe ? 'true' : 'false');
      if (rememberMe) {
        localStorage.setItem('taskflow_remember_login', trimmedIdentifier);
      } else {
        localStorage.removeItem('taskflow_remember_login');
      }

      // Fetch user's workspaces
      try {
        const wsRes = await api.get('/workspaces', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const wsList = wsRes.data?.data?.workspaces || [];
        setWorkspaces(wsList);
        if (wsList.length > 0) {
          setActiveWorkspace(wsList[0]);
        }
      } catch (wsErr) {
        console.warn('Workspace initial sync warning:', wsErr);
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the TaskFlow server. Please ensure the backend is running.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF6EE] dark:bg-[#0B0F17]">
      <div className="w-full max-w-md bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl shadow-xl border border-[#E6DACB]/80 dark:border-slate-800/80 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-blue-600 dark:via-blue-500 dark:to-cyan-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-maroon-900/25">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">
            Sign in to TaskFlow
          </h2>
          <p className="text-xs text-[#7C6E65] dark:text-slate-400">
            Welcome back! Please enter your details to access your workspace.
          </p>
        </div>

        {/* Error Notification Alert with Direct Solutions */}
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-blue-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-blue-400 space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>

            {/* Direct 1-Click Solution for Non-Existent Account */}
            {(error.toLowerCase().includes('no account') ||
              error.toLowerCase().includes('create an account') ||
              error.toLowerCase().includes('not found')) && (
              <div className="pt-1">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center w-full py-2 px-3 bg-maroon-600 hover:bg-maroon-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Create an account now &rarr;
                </Link>
              </div>
            )}

            {/* Direct 1-Click Solution for Incorrect Password */}
            {(error.toLowerCase().includes('incorrect password') ||
              error.toLowerCase().includes('forgot password')) && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-[#7C6E65] dark:text-slate-400">Can't remember your password?</span>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-maroon-700 dark:text-blue-300 hover:underline"
                >
                  Reset password &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Email Address <span className="normal-case font-normal text-[#7C6E65]">(or username)</span>
            </label>
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => {
                setEmailOrUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="you@company.com"
              className={`w-full px-3.5 py-2 bg-[#FFFDF9] dark:bg-[#111827] border rounded-xl text-sm text-[#2C1810] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-xs ${
                error.toLowerCase().includes('email') || error.toLowerCase().includes('account')
                  ? 'border-rose-300 dark:border-blue-800 focus:ring-rose-500/40 focus:border-rose-500'
                  : 'border-[#E6DACB] dark:border-slate-700 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-maroon-700 dark:text-blue-300 hover:text-maroon-700 hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your password"
                className={`w-full px-3.5 py-2 pr-10 bg-[#FFFDF9] dark:bg-[#111827] border rounded-xl text-sm text-[#2C1810] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-xs ${
                  error.toLowerCase().includes('password')
                    ? 'border-rose-300 dark:border-blue-800 focus:ring-rose-500/40 focus:border-rose-500'
                    : 'border-[#E6DACB] dark:border-slate-700 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C6E65] hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#E6DACB] text-maroon-700 focus:ring-maroon-600/30"
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-xs text-center text-[#7C6E65] dark:text-slate-400 pt-2 border-t border-[#E6DACB]/60 dark:border-slate-800/80">
          Don't have an account?{' '}
          <Link to="/register" className="text-maroon-700 dark:text-blue-300 font-bold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};