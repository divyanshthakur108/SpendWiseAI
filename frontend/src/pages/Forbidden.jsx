import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 shadow-2xl">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400 mb-2">
        Error 403
      </span>

      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
        Access Denied
      </h1>

      <p className="text-xs text-slate-400 max-w-md mb-8">
        You do not have administrative permissions to view this protected resource.
      </p>

      <Link
        to="/dashboard"
        className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold text-xs shadow-lg flex items-center space-x-2 transition-all"
      >
        <Home className="w-4 h-4 text-red-400" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default Forbidden;
