import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Settings, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-2.5 p-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all group"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#DC2626] to-[#F97316] flex items-center justify-center text-white text-xs font-bold shadow-xs">
          {initial}
        </div>
        <span className="text-xs font-bold text-[#334155] hidden md:inline truncate max-w-[100px]">
          {user?.name || 'Account'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#0F172A] transition-transform" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_16px_32px_rgba(15,23,42,0.12)] overflow-hidden z-50 animate-fade-in p-1 space-y-1">
          {/* User Info Header */}
          <div className="px-3.5 py-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-1">
            <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name || 'User Account'}</p>
            <p className="text-[10px] text-[#64748B] truncate">{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </span>
            )}
          </div>

          <Link
            to="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#334155] hover:text-[#DC2626] hover:bg-[#FEF2F2] font-semibold transition-colors"
          >
            <User className="w-4 h-4 text-[#DC2626]" />
            <span>My Profile</span>
          </Link>

          <Link
            to="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#334155] hover:text-[#DC2626] hover:bg-[#FEF2F2] font-semibold transition-colors"
          >
            <Settings className="w-4 h-4 text-[#F97316]" />
            <span>Settings</span>
          </Link>

          <div className="pt-1 border-t border-[#E2E8F0]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#EF4444] hover:bg-[#FEF2F2] font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4 text-[#EF4444]" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
