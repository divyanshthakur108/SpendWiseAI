import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { getReportSummaryAPI, exportCSVAPI } from '../services/reportService';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  User,
} from 'lucide-react';

const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'Last 6 Months', value: 'last_6_months' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Custom Range', value: 'custom' },
];

const Reports = () => {
  const [preset, setPreset] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { preset };
      if (preset === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      const res = await getReportSummaryAPI(params);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError('Could not generate report for the selected date range.');
    } finally {
      setLoading(false);
    }
  }, [preset, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleExportCSV = async () => {
    setDownloadingCSV(true);
    try {
      const params = { preset };
      if (preset === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      await exportCSVAPI(params);
      showToast('CSV Report downloaded successfully');
    } catch (err) {
      console.error('CSV Export Error:', err);
      alert('Failed to download CSV report');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '-';
    return new Date(dateVal).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const userInfo = data?.userInfo || { name: 'User', email: '' };
  const dateRange = data?.dateRange || { startDate: '', endDate: '' };
  const summary = data?.financialSummary || {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    totalBudget: 0,
    budgetUsed: 0,
    remainingBudget: 0,
    transactionCount: 0,
  };

  const categories = data?.topSpendingCategories || [];
  const transactions = data?.transactions || [];

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-fade-in print:hidden">
          <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Financial Statement & Reports"
        subtitle="Generate comprehensive PDF and CSV statements with customized date filters."
        icon={FileText}
        action={
          <div className="flex items-center space-x-3 print:hidden">
            <button
              onClick={handleExportCSV}
              disabled={downloadingCSV || loading}
              className="btn-secondary disabled:opacity-50"
            >
              {downloadingCSV ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#DC2626]" />
              ) : (
                <Download className="w-4 h-4 text-[#DC2626]" />
              )}
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        }
      />

      {/* Date Preset Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Preset Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  preset === p.value
                    ? 'bg-white text-[#DC2626] border border-[#FECACA] shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {preset === 'custom' && (
            <div className="flex items-center space-x-3 bg-[#F8FAFC] border border-[#E2E8F0] p-2 rounded-xl">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-xs focus:outline-none focus:border-[#DC2626]"
              />
              <span className="text-[#94A3B8] text-xs font-medium">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-xs focus:outline-none focus:border-[#DC2626]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Document */}
      <div className="space-y-6 print:text-black print:bg-white print:p-0">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E8F0] rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
            <p className="text-xs text-[#475569]">Generating report statement for selected range...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3 bg-white border border-[#E2E8F0] rounded-2xl">
            <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto" />
            <p className="text-xs text-[#EF4444] font-semibold">{error}</p>
          </div>
        ) : (
          <>
            {/* Header Branding Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#DC2626]">
                  SpendWise AI Official Statement
                </span>
                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  Financial Statement Report
                </h2>
                <p className="text-xs text-[#475569] mt-1 flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Account: <strong className="text-[#0F172A]">{userInfo.name}</strong> ({userInfo.email})</span>
                </p>
              </div>

              <div className="text-right text-xs text-[#64748B] space-y-0.5">
                <p>Statement Period: <strong className="text-[#0F172A]">{dateRange.startDate}</strong> to <strong className="text-[#0F172A]">{dateRange.endDate}</strong></p>
                <p>Generated: {new Date().toLocaleDateString()}</p>
                <p>Total Entries: <strong className="text-[#0F172A]">{summary.transactionCount}</strong> transactions</p>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Income', value: summary.totalIncome, icon: TrendingUp, color: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', iconColor: 'text-[#22C55E]' },
                { label: 'Total Expense', value: summary.totalExpenses, icon: TrendingDown, color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', iconColor: 'text-[#EF4444]' },
                { label: 'Net Balance', value: summary.netBalance, icon: Wallet, color: summary.netBalance >= 0 ? 'text-[#DC2626]' : 'text-[#DC2626]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', iconColor: 'text-[#DC2626]' },
                { label: 'Budget Used', value: summary.budgetUsed, icon: Target, color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', iconColor: 'text-[#F59E0B]' },
              ].map((item) => (
                <div key={item.label} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-2 hover:-translate-y-1 transition-all duration-250">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{item.label}</span>
                    <div className={`p-2 rounded-xl ${item.bg} border ${item.border}`}>
                      <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                  </div>
                  <div className={`text-xl font-extrabold ${item.color}`}>
                    {formatCurrency(item.value)}
                  </div>
                </div>
              ))}
            </div>

            {/* Top Spending Categories */}
            {categories.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A]">Expense Categories Breakdown</h3>
                <div className="space-y-3">
                  {categories.map((c) => (
                    <div key={c.category} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#334155]">{c.category}</span>
                        <span className="font-semibold text-[#475569]">
                          {formatCurrency(c.amount)} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                        <div
                          className="bg-gradient-to-r from-[#DC2626] to-[#F97316] h-full rounded-full transition-all duration-500"
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Breakdown Table */}
            <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="text-sm font-bold text-[#0F172A]">Transaction Breakdown</h3>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#94A3B8]">
                  No transactions recorded for this period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Description</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Type</th>
                        <th className="px-5 py-3.5">Payment Method</th>
                        <th className="px-5 py-3.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                      {transactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">
                            {formatDate(tx.transactionDate || tx.date)}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-[#0F172A]">{tx.description}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-[#334155] font-semibold">
                              {tx.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${
                              tx.type === 'income'
                                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                                : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[#64748B] capitalize">
                            {(tx.paymentMethod || 'credit_card').replace('_', ' ')}
                          </td>
                          <td className={`px-5 py-3.5 text-right font-extrabold whitespace-nowrap ${
                            tx.type === 'income' ? 'text-[#16A34A]' : 'text-[#0F172A]'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
