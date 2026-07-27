import React from 'react';
import { Wallet, Heart, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-[#CBD5E1] border-t border-[#334155] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#F97316] flex items-center justify-center text-white shadow-md">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#F8FAFC] tracking-tight">SpendWise AI</span>
            </div>
            <p className="text-xs text-[#CBD5E1] max-w-sm leading-relaxed">
              Intelligent financial management powered by AI. Real-time cash flow analytics, receipt OCR scanning, and automated budget thresholds.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">Platform</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/dashboard" className="text-[#CBD5E1] hover:text-[#60A5FA] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/transactions" className="text-[#CBD5E1] hover:text-[#60A5FA] transition-colors">
                  Transactions
                </Link>
              </li>
              <li>
                <Link to="/dashboard/budgets" className="text-[#CBD5E1] hover:text-[#60A5FA] transition-colors">
                  Budgets
                </Link>
              </li>
              <li>
                <Link to="/dashboard/ai" className="text-[#CBD5E1] hover:text-[#60A5FA] transition-colors flex items-center space-x-1">
                  <span>AI Copilot</span>
                  <Sparkles className="w-3 h-3 text-[#F97316]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Security */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">System</h4>
            <div className="space-y-2 text-xs">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#1E293B] border border-[#334155] text-emerald-400 font-semibold text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>Encrypted & Secured</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">Version 1.0.0 • Production Build</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-[#334155]" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-2">
          <p>© {new Date().getFullYear()} SpendWise AI. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Built with precision for SaaS financial intelligence</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
