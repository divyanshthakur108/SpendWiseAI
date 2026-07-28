import React from 'react';
import { Wallet, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white text-[#64748B] border-t border-[#E2E8F0] mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#111827] flex items-center justify-center text-white shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-base font-semibold text-[#0F172A] tracking-tight">SpendWise AI</span>
            </div>
            <p className="text-xs text-[#64748B] max-w-sm leading-relaxed">
              Intelligent financial management platform. Real-time cash flow analytics, receipt OCR scanning, and automated budget thresholds.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">Platform</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/dashboard" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/transactions" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Transactions
                </Link>
              </li>
              <li>
                <Link to="/dashboard/budgets" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Budgets
                </Link>
              </li>
              <li>
                <Link to="/dashboard/ai" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                  AI Copilot
                </Link>
              </li>
            </ul>
          </div>

          {/* System Info */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">System</h4>
            <div className="space-y-2 text-xs">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] font-medium text-[11px]">
                <Shield className="w-3.5 h-3.5 text-[#111827]" />
                <span>Encrypted & Secured</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">Version 1.0.0 • Production Build</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-[#E2E8F0]" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-2">
          <p>© {new Date().getFullYear()} SpendWise AI. All rights reserved.</p>
          <p>Built for minimal SaaS financial intelligence</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
