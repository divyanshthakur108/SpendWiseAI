import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Key, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [toast, setToast] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToast('Profile settings saved successfully');
    setTimeout(() => setToast(''), 3000);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      <PageHeader
        title="User Profile"
        subtitle="Manage your personal account settings, security preferences, and details."
        icon={User}
        badge={user?.role === 'admin' ? 'System Administrator' : 'Standard Member'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-6 text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#F97316] flex items-center justify-center text-white text-3xl font-extrabold shadow-md shadow-red-500/20">
              {initial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[#22C55E] border-2 border-white flex items-center justify-center text-white text-xs shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">{user?.name || 'User'}</h2>
            <p className="text-xs text-[#64748B] mt-0.5">{user?.email}</p>
            <div className="inline-flex items-center space-x-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              <Shield className="w-3.5 h-3.5" />
              <span className="capitalize">{user?.role || 'user'} Account</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] text-left space-y-3 text-xs text-[#64748B]">
            <div className="flex items-center justify-between">
              <span>Account Status</span>
              <span className="text-[#16A34A] font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span>Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Joined Date</span>
              <span className="text-[#0F172A] font-mono font-semibold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Edit Profile Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Personal Details</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Update your display name and personal settings</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#64748B] text-xs cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="btn-primary"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
