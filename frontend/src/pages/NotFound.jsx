import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-6 shadow-2xl animate-pulse">
        <Compass className="w-10 h-10" />
      </div>

      <span className="text-xs uppercase font-extrabold tracking-widest text-red-400 mb-2">
        Error 404
      </span>

      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-xs text-slate-400 max-w-md mb-8">
        The requested URL was not found on this server. It might have been moved, renamed, or deleted.
      </p>

      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-red-500/25 flex items-center space-x-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
