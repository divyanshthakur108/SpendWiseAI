import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { getReportSummaryAPI, exportPDFAPI } from '../services/reportService';
import {
  FileText,
  Download,
  Calendar,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

const PRESETS = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'This Year', value: 'year' },
];

const Reports = () => {
  const [selectedPreset, setSelectedPreset] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { preset: selectedPreset };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getReportSummaryAPI(params);
      if (res && res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report data', err);
      setError('Could not generate financial report. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedPreset, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const params = { preset: selectedPreset };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      await exportPDFAPI(params);
      showToast('PDF Financial Report downloaded successfully!');
    } catch (err) {
      console.error('Error downloading PDF', err);
      alert('Failed to download PDF report');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

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
        title="Financial Statement Reports"
        subtitle="Generate printable PDF audit reports, net savings summary statements, and category breakdowns."
        icon={FileText}
        badge="PDF Export"
        action={
          <button
            onClick={handleExportPDF}
            disabled={exporting || loading}
            className="btn-primary shrink-0 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export PDF Report</span>
              </>
            )}
          </button>
        }
      />

      {/* Control Bar: Presets & Custom Date Picker */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  setSelectedPreset(p.value);
                  setStartDate('');
                  setEndDate('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedPreset === p.value && !startDate
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-[#111827] shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedPreset('custom');
              }}
              className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] text-xs focus:border-[#111827] focus:outline-none"
            />
            <span className="text-[#64748B]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedPreset('custom');
              }}
              className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] text-xs focus:border-[#111827] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Report Document Preview */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#111827]" />
          <p className="text-xs text-[#64748B]">Compiling financial statement report...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
          <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
          <p className="text-xs text-[#DC2626] font-semibold">{error}</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 lg:p-8 shadow-xs space-y-6">
          {/* Statement Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xl font-semibold text-[#0F172A]">Financial Statement Audit Summary</h2>
              <p className="text-xs text-[#64748B] mt-1">
                Statement Period: {reportData?.periodLabel || 'All Time'}
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-xs font-semibold">
                Verified Statement
              </span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                <span>Total Income</span>
              </span>
              <p className="text-2xl font-semibold text-[#16A34A]">
                {formatCurrency(reportData?.totalIncome)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider flex items-center space-x-1.5">
                <TrendingDown className="w-4 h-4 text-[#DC2626]" />
                <span>Total Expenses</span>
              </span>
              <p className="text-2xl font-semibold text-[#DC2626]">
                {formatCurrency(reportData?.totalExpenses)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-[#111827]" />
                <span>Net Savings</span>
              </span>
              <p className="text-2xl font-semibold text-[#0F172A]">
                {formatCurrency(reportData?.netSavings)}
              </p>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">Category Expense Breakdown</h3>
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[#0F172A]">
                  {(reportData?.categoryBreakdown || []).map((cat) => (
                    <tr key={cat.category} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-semibold text-[#0F172A]">{cat.category}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(cat.amount)}</td>
                      <td className="px-4 py-3 text-right font-medium text-[#64748B]">{cat.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reports;
