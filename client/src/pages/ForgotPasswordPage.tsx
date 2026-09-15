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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      if (res.data.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err) {
      console.error(err);
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
            Reset Password
          </h2>
          <p className="text-xs text-[#7C6E65] dark:text-slate-400">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
              <p className="font-semibold">Reset instructions sent!</p>
              <p>Check your email for the reset link.</p>
              {resetToken && (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <p className="text-[10px] text-[#7C6E65] mb-1">Password Reset Token:</p>
                  <code className="block p-1.5 bg-[#FFFDF9] dark:bg-[#111827] rounded text-[11px] font-mono break-all select-all">
                    {resetToken}
                  </code>
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="inline-block mt-2 text-xs font-bold text-maroon-700 dark:text-blue-300 underline"
                  >
                    Click to proceed to reset password &rarr;
                  </Link>
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