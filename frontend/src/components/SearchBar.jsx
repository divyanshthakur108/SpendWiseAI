import React, { useState, useEffect } from 'react';
import { Search, Command, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const searchItems = [
    { title: 'Dashboard Overview', href: '/dashboard' },
    { title: 'Transactions Management', href: '/dashboard/transactions' },
    { title: 'Income Tracker', href: '/dashboard/income' },
    { title: 'Expense Tracker', href: '/dashboard/expenses' },
    { title: 'Budgets & Limits', href: '/dashboard/budgets' },
    { title: 'Financial Analytics', href: '/dashboard/analytics' },
    { title: 'Export Reports', href: '/dashboard/reports' },
    { title: 'AI Insights Copilot', href: '/dashboard/ai' },
    { title: 'Receipt OCR Scanner', href: '/dashboard/receipts' },
    { title: 'User Profile', href: '/dashboard/profile' },
    { title: 'Account Settings', href: '/dashboard/settings' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = query.trim()
    ? searchItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : searchItems;

  const handleSelect = (href) => {
    navigate(href);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Navbar Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-3 px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-[#64748B] text-xs transition-all w-48 sm:w-64 justify-between shadow-xs"
      >
        <div className="flex items-center space-x-2 truncate">
          <Search className="w-4 h-4 text-[#64748B] shrink-0" />
          <span className="truncate">Search views...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center space-x-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569]">
          <Command className="w-3 h-3" />
          <span>K</span>
        </kbd>
      </button>

      {/* Modal Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white border border-[#E2E8F0] rounded-2xl shadow-md overflow-hidden z-10 animate-fade-in">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center space-x-3 bg-[#F8FAFC]">
              <Search className="w-5 h-5 text-[#111827] shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search views, pages, or features..."
                className="w-full bg-transparent text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 divide-y divide-[#F1F5F9]">
              {filtered.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-[#F1F5F9] text-xs text-[#0F172A] font-medium transition-colors flex items-center justify-between"
                >
                  <span>{item.title}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">{item.href}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
