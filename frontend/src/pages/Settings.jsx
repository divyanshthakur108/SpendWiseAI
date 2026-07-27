import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { Settings as SettingsIcon, Bell, Database, Save, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [budgetWarnings, setBudgetWarnings] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [toast, setToast] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setToast('Application settings saved successfully');
    setTimeout(() => setToast(''), 3000);
  };

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
        title="Application Settings"
        subtitle="Configure system preferences, notification alerts, and currency options."
        icon={SettingsIcon}
      />

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Notifications & Alert Settings */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#DC2626]" />
              <span>Notification Preferences</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">Control threshold warnings and monthly AI insight notifications</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Monthly Budget Threshold Warnings</p>
                <p className="text-[11px] text-[#64748B]">Receive alerts when 80%, 90%, or 100% of budget capacity is reached</p>
              </div>
              <input
                type="checkbox"
                checked={budgetWarnings}
                onChange={(e) => setBudgetWarnings(e.target.checked)}
                className="w-4 h-4 accent-[#DC2626] rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#0F172A]">AI Financial Summary Digests</p>
                <p className="text-[11px] text-[#64748B]">Receive automated spending trend insights and money-saving recommendations</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#DC2626] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Currency Options */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#7C3AED]" />
              <span>Currency & Locale</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">Default currency formatting for statement calculation</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Base Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full max-w-xs px-3.5 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] text-xs focus:outline-none"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default Settings;
