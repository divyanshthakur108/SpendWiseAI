import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Budget Alert (90%)',
    message: 'Dining Out budget reached 90% threshold capacity.',
    time: '10m ago',
    read: false,
    type: 'warning',
  },
  {
    id: 2,
    title: 'AI Insight Available',
    message: 'New monthly spending trajectory report generated.',
    time: '1h ago',
    read: false,
    type: 'ai',
  },
  {
    id: 3,
    title: 'Receipt Processed',
    message: 'Receipt image successfully scanned & stored.',
    time: '2h ago',
    read: true,
    type: 'success',
  },
];

const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const popoverRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#DC2626] hover:bg-[#F1F5F9] transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_16px_32px_rgba(15,23,42,0.12)] overflow-hidden z-50 animate-fade-in">
          <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-bold text-[#DC2626] hover:text-[#B91C1C] flex items-center space-x-1"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 space-y-1 transition-colors ${
                  n.read ? 'bg-white' : 'bg-[#FEF2F2]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F172A] flex items-center space-x-1.5">
                    {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />}
                    {n.type === 'ai' && <Zap className="w-3.5 h-3.5 text-[#DC2626]" />}
                    {n.type === 'success' && <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />}
                    <span>{n.title}</span>
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">{n.time}</span>
                </div>
                <p className="text-[11px] text-[#475569] leading-snug">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
