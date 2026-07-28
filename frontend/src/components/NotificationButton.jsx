import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Zap, AlertTriangle, ShieldCheck, X } from 'lucide-react';

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

  const markAllRead = (e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleReadStatus = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const removeNotification = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    setNotifications([]);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-md overflow-hidden z-50 animate-fade-in">
          <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#0F172A]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[10px] font-semibold text-[#111827] hover:text-[#475569] flex items-center space-x-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] font-semibold text-[#64748B] hover:text-[#DC2626] transition-colors"
                  title="Clear all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => toggleReadStatus(n.id)}
                  className={`p-3.5 space-y-1.5 transition-colors cursor-pointer group ${
                    n.read ? 'bg-white hover:bg-[#F8FAFC]' : 'bg-[#F8FAFC] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A] flex items-center space-x-1.5">
                      {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />}
                      {n.type === 'ai' && <Zap className="w-3.5 h-3.5 text-[#111827] shrink-0" />}
                      {n.type === 'success' && <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
                      <span>{n.title}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-[#64748B]">{n.time}</span>
                      <button
                        type="button"
                        onClick={(e) => removeNotification(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#64748B] hover:text-[#DC2626] transition-opacity p-0.5"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-snug">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
