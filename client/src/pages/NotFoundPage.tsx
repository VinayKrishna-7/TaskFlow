import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center p-4 text-center bg-[#F8FAFC] dark:bg-[#0B0F17]">
    <div className="space-y-4 max-w-md">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue- via-blue- to-cyan- text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-/25 font-bold">
        <Layers className="w-6 h-6" />
      </div>
      <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Page Not Found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400">The page you requested does not exist or has been moved.</p>
      <Link
        to="/dashboard"
        className="inline-block px-5 py-2.5 bg-blue- hover:bg-blue- active:bg-blue- text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-/20 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  </div>
);