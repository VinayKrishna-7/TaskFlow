import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center p-4 text-center bg-[#FAF6EE] dark:bg-[#0B0F17]">
    <div className="space-y-4 max-w-md">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-blue-600 dark:via-blue-500 dark:to-cyan-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-maroon-900/25 font-bold">
        <Layers className="w-6 h-6" />
      </div>
      <h1 className="text-4xl font-black tracking-tight text-[#2C1810] dark:text-slate-100">404</h1>
      <h2 className="text-lg font-semibold text-[#4A3B32] dark:text-slate-300">Page Not Found</h2>
      <p className="text-xs text-[#7C6E65] dark:text-slate-400">The page you requested does not exist or has been moved.</p>
      <Link
        to="/dashboard"
        className="inline-block px-5 py-2.5 bg-maroon-600 hover:bg-maroon-700 dark:bg-blue-600 dark:hover:bg-blue-500 active:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-maroon-900/20 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  </div>
);