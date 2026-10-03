import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/axios';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Layers, Check, X, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';
  
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Password rules validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanToken = token.trim();
    if (!cleanToken) {
      setError('Password reset token is required. Please check your reset link or email.');
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setError('Password must be at least 8 characters, contain an uppercase letter, and a number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: cleanToken,
        newPassword,
      });
      setIsSuccess(true);
      if (emailParam) {
        localStorage.setItem('taskflow_remember_login', emailParam);
      }
      setTimeout(() => {
        navigate('/login', { state: { email: emailParam } });
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed. Token may be invalid or expired.');
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
            Set New Password
          </h2>
          {emailParam ? (
            <p className="text-xs text-[#7C6E65] dark:text-slate-400">
              Resetting password for: <span className="font-semibold text-maroon-700 dark:text-blue-400">{emailParam}</span>
            </p>
          ) : (
            <p className="text-xs text-[#7C6E65] dark:text-slate-400">
              Create a new secure password for your account
            </p>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 text-center">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto text-lg">
              ✓
            </div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              Password Reset Successfully!
            </p>
            <p className="text-xs text-[#7C6E65] dark:text-slate-400">
              Your new password is now active. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!urlToken && (
              <Input
                label="Password Reset Token"
                type="text"
                required
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Paste the reset token here"
              />
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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

              {/* Password requirement indicators */}
              {newPassword.length > 0 && (
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

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Re-enter new password"
            />

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Update Password & Sign In
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-[#7C6E65] hover:text-[#2C1810] dark:hover:text-slate-200 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};