import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, CheckCircle2, Loader2, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (typeof updateProfile === 'function') {
        await updateProfile({ name: name.trim() });
        showToast('Profile name updated successfully!');
      } else {
        showToast('Profile updated locally.');
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-2xl shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="User Profile & Account Settings"
        subtitle="Manage your personal information, role credentials, and preferences."
        icon={User}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* User Badge Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#111827] text-white text-2xl font-bold flex items-center justify-center shadow-xs shrink-0">
            {initial}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{user?.name || 'Account User'}</h2>
            <p className="text-xs text-[#64748B]">{user?.email}</p>
            <span className="inline-flex items-center space-x-1 mt-2 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
              <Shield className="w-3 h-3 text-[#111827]" />
              <span>Role: {user?.role || 'user'}</span>
            </span>
          </div>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleUpdate} className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
            Personal Details
          </h3>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#475569]">
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
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#111827] rounded-xl text-[#0F172A] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#475569]">
              Email Address (Read-only)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] rounded-xl text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
