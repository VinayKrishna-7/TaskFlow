import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/axios';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Layers, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      setIsSubmitted(true);
      if (res.data?.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.message ||
        'Unable to process password reset request. Please check your email address.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF6EE] dark:bg-[#000000]">
      <div className="w-full max-w-md bg-[#FFFDF9] dark:bg-[#0D0D0D] rounded-2xl shadow-xl border border-[#E6DACB]/80 dark:border-slate-800/80 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] flex items-center justify-center text-white mx-auto shadow-lg shadow-maroon-900/25">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2C1810] dark:text-slate-100">
            Reset Password
          </h2>
          <p className="text-xs text-[#7C6E65] dark:text-slate-400">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📧</span>
                <p className="font-bold">Reset instructions generated!</p>
              </div>
              <p className="text-[11px] leading-relaxed">
                An email has been sent to <strong>{email}</strong> with your password reset instructions.
              </p>
              {resetToken && (
                <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
                  <p className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                    Direct Reset Action:
                  </p>
                  <Link
                    to={`/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center justify-center w-full py-2.5 px-3 bg-maroon-600 hover:bg-maroon-700 dark:bg-[#992355] dark:hover:bg-[#BD326D] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Click to Reset Password Now &rarr;
                  </Link>
                  <div className="pt-1">
                    <p className="text-[10px] text-[#7C6E65] mb-0.5">Or use Reset Token manually:</p>
                    <code className="block p-1.5 bg-[#FFFDF9] dark:bg-[#0D0D0D] border border-emerald-200 dark:border-emerald-900 rounded text-[11px] font-mono break-all select-all">
                      {resetToken}
                    </code>
                  </div>
                </div>
              )}
            </div>
            <Link to="/login" className="block text-center text-xs font-semibold text-slate-600 hover:underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Send Reset Link
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