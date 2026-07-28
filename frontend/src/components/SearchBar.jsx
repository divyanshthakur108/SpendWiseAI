import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in">
        <div className="p-4 border-b border-[#E5E7EB] flex items-center space-x-3 bg-[#F8FAFC]">
          <Search className="w-5 h-5 text-[#111827] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search views, pages, or features..."
            className="w-full bg-transparent text-[#111827] placeholder-[#94A3B8] text-xs focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-[#E5E7EB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto p-2 divide-y divide-[#F3F4F6]">
          {filtered.map((item) => (
            <button
              key={item.href}
              onClick={() => handleSelect(item.href)}
              className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-[#F3F4F6] text-xs text-[#111827] font-medium transition-colors flex items-center justify-between"
            >
              <span>{item.title}</span>
              <span className="text-[10px] text-[#6B7280] font-mono">{item.href}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Navbar Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-3 px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] hover:border-[#CBD5E1] rounded-xl text-[#6B7280] text-xs transition-all w-48 sm:w-64 justify-between shadow-xs"
      >
        <div className="flex items-center space-x-2 truncate">
          <Search className="w-4 h-4 text-[#6B7280] shrink-0" />
          <span className="truncate">Search views...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center space-x-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[#475569]">
          <Command className="w-3 h-3" />
          <span>K</span>
        </kbd>
      </button>

      {/* Portal Mount */}
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
};

export default SearchBar;
