import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import BudgetProgressChart from '../components/charts/BudgetProgressChart';
import { getDashboardAnalyticsAPI } from '../services/analyticsService';
import {
  PieChart as PieIcon,
  BarChart3,
  Activity,
  Target,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getDashboardAnalyticsAPI();
        if (res && res.success) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
        setError('Could not load analytics data. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader
        title="Financial Analytics & Live Charts"
        subtitle="Real-time MongoDB analytics charts powered by Recharts."
        icon={BarChart3}
        badge="Live Analytics"
      />

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#111827]" />
          <p className="text-xs text-[#64748B]">Processing live database analytics...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs">
          <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
          <p className="text-xs text-[#DC2626] font-semibold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Income vs Expense Bar Chart */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#111827] flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">Income vs Expense</h3>
                  <p className="text-[11px] text-[#64748B]">Last 12 Months Comparison</p>
                </div>
              </div>
            </div>
            <IncomeExpenseBarChart data={analyticsData?.monthlyTrend || []} />
          </div>

          {/* 2. Expense Category Pie Chart */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#111827] flex items-center justify-center font-bold">
                  <PieIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">Expense Category Distribution</h3>
                  <p className="text-[11px] text-[#64748B]">Breakdown by Expense Category</p>
                </div>
              </div>
            </div>
            <ExpensePieChart data={analyticsData?.categoryAnalytics || []} />
          </div>

          {/* 3. Monthly Spending Line Chart */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#111827] flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">Monthly Spending Trajectory</h3>
                  <p className="text-[11px] text-[#64748B]">Expense Trend (Last 12 Months)</p>
                </div>
              </div>
            </div>
            <SpendingLineChart data={analyticsData?.monthlyTrend || []} />
          </div>

          {/* 4. Budget Progress Chart */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#111827] flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">Budget vs Actual Spend</h3>
                  <p className="text-[11px] text-[#64748B]">Category Monthly Budget Progress</p>
                </div>
              </div>
            </div>
            <BudgetProgressChart data={analyticsData?.budgetProgress || []} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analytics;
