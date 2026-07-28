import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  TrendingDown,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  Sparkles,
  Camera,
  User,
  Settings,
  ShieldCheck,
  Users,
  Tag,
  X,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
  { name: 'Income', href: '/dashboard/income', icon: TrendingUp },
  { name: 'Expenses', href: '/dashboard/expenses', icon: TrendingDown },
  { name: 'Budgets', href: '/dashboard/budgets', icon: Target },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'AI Insights', href: '/dashboard/ai', icon: Sparkles, badge: 'AI' },
  { name: 'Receipt Scanner', href: '/dashboard/receipts', icon: Camera },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Category Management', href: '/admin/categories', icon: Tag },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] w-64 select-none">
      {/* Brand Header */}
      <div className="h-[72px] flex items-center justify-between px-5 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#111827] flex items-center justify-center text-white shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-[#0F172A] tracking-tight text-base block leading-tight">
              SpendWise
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-[#64748B]">
              Financial Hub
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest">
          Main Menu
        </div>

        {mainNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#111827] text-white shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded-full bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Admin Navigation Section */}
        {user?.role === 'admin' && (
          <div className="pt-4 space-y-1">
            <div className="px-3 py-1 text-[10px] font-semibold text-[#64748B] uppercase tracking-widest flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#111827]" />
              <span>Admin Control</span>
            </div>
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#111827] text-white shadow-xs font-semibold'
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer Status */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
        <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="text-xs text-[#0F172A] font-medium">System Live</span>
          </div>
          <span className="text-[10px] text-[#64748B] font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:shrink-0 h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 animate-fade-in">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
