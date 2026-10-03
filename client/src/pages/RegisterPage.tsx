import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { api } from '../lib/axios';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Layers, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isEmailConflict, setIsEmailConflict] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth, isAuthenticated } = useAuthStore();
  const { setWorkspaces, setActiveWorkspace, setActiveProject } = useWorkspaceStore();
  const navigate = useNavigate();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsEmailConflict(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!hasUppercase) {
      setError('Password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!hasNumber) {
      setError('Password must contain at least one number (0-9).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      localStorage.setItem('taskflow_remember_me', 'true');
      localStorage.setItem('taskflow_remember_login', trimmedEmail);

      // Create a clean, personalized workspace for the new user
      try {
        const wsRes = await api.post('/workspaces', {
          name: `${trimmedName}'s Workspace`,
          description: 'Primary workspace for projects and task management',
        });

        const newWs = wsRes.data?.data?.workspace;
        if (newWs) {
          setWorkspaces([newWs]);
          setActiveWorkspace(newWs);

          // Create a clean starter project for the new user
          try {
            const projRes = await api.post('/projects', {
              workspace: newWs._id,
              name: 'General Project',
              key: 'GEN',
              description: 'Main project for tasks and team collaboration',
            });
            const newProj = projRes.data?.data?.project;
            if (newProj) {
              setActiveProject(newProj);
            }
          } catch (projErr) {
            console.warn('Initial project setup note:', projErr);
          }
        }
      } catch (wsErr) {
        console.warn('Workspace initialization warning:', wsErr);
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      const serverMsg = err.response?.data?.message || '';
      const isConflict =
        err.response?.status === 409 ||
        serverMsg.toLowerCase().includes('already exists') ||
        serverMsg.toLowerCase().includes('already registered');

      if (isConflict) {
        setIsEmailConflict(true);
        setError('An account with this email already exists. Please sign in below.');
      } else if (serverMsg) {
        setIsEmailConflict(false);
        setError(serverMsg);
      } else {
        setIsEmailConflict(false);
        setError('Registration failed. Please check your information and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF6EE] dark:bg-[#0B0F17]">
      <div className="w-full max-w-md bg-[#FFFDF9] dark:bg-[#111827] rounded-2xl shadow-xl border border-[#E6DACB]/80 dark:border-slate-800/80 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-blue-600 dark:via-blue-500 dark:to-cyan-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-maroon-900/25">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">
            Create an account
          </h2>
          <p className="text-xs text-[#7C6E65] dark:text-slate-400">
            Start managing your projects and tasks with TaskFlow
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-blue-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-blue-400 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {isEmailConflict && (
              <Link
                to={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                state={{ email: email.trim().toLowerCase() }}
                className="inline-flex items-center justify-center w-full py-2.5 px-3 mt-1 bg-maroon-600 hover:bg-maroon-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Sign in with this email &rarr;
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. John Doe"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) {
                setError('');
                setIsEmailConflict(false);
              }
            }}
            placeholder="e.g. john@example.com"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Create a strong password"
                className="w-full px-3.5 py-2 pr-10 bg-[#FFFDF9] dark:bg-[#111827] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-sm text-[#2C1810] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:border-blue-500 transition-all shadow-xs"
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

            {/* Password security requirement indicators */}
            {password.length > 0 && (
              <div className="mt-2 p-2.5 bg-[#FAF6EE] dark:bg-[#0B0F17] border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-xl space-y-1 text-[11px]">
                <div className={`flex items-center gap-1.5 font-medium ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#7C6E65]'}`}>
                  {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#7C6E65]'}`}>
                  {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#7C6E65]'}`}>
                  {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>At least one number (0-9)</span>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Create Account & Get Started
          </Button>
        </form>

        <p className="text-xs text-center text-[#7C6E65] dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-maroon-700 dark:text-blue-300 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};