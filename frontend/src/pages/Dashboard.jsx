import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { StatCard, DashboardCard } from '../components/DashboardCard';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import RecentTransactionsCard from '../components/RecentTransactionsCard';

import { getDashboardAnalyticsAPI } from '../services/analyticsService';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  PieChart as PieIcon,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDashboardAnalyticsAPI(timeframe);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
      setError('Could not load financial analytics data.');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const summary = data?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    monthlyBudget: 0,
    incomeChangePct: 0,
    expenseChangePct: 0,
    remainingBudget: 0,
    healthScore: { score: 50, rating: 'Average' },
  };

  const recent = data?.recentActivity || [];
  const categories = data?.categoryAnalytics || [];
  const monthlyTrend = data?.monthlyTrend || [];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="Financial Dashboard"
        subtitle="Real-time cash flow metrics, category breakdowns, and AI recommendations."
        badge="Live Database"
        action={
          <div className="flex items-center space-x-3">
            {/* Timeframe Filter Dropdown */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-[#334155] text-xs font-semibold focus:outline-none focus:border-[#DC2626]"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
            </select>

            <Link
              to="/dashboard/ai"
              className="btn-primary"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Copilot</span>
            </Link>
          </div>
        }
      />

      {loading ? (
        /* Loading Skeleton */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />
            <div className="h-72 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-12 text-center space-y-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto" />
          <p className="text-xs text-[#EF4444] font-semibold">{error}</p>
        </div>
      ) : (
        <>
          {/* Top 4 Summary StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Income"
              value={formatCurrency(summary.totalIncome)}
              change={summary.incomeChangePct ? `${summary.incomeChangePct > 0 ? '+' : ''}${summary.incomeChangePct}%` : null}
              isPositive={summary.incomeChangePct >= 0}
              description="Compared to previous month"
              icon={TrendingUp}
              accentColor="emerald"
            />
            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary.totalExpenses)}
              change={summary.expenseChangePct ? `${summary.expenseChangePct > 0 ? '+' : ''}${summary.expenseChangePct}%` : null}
              isPositive={summary.expenseChangePct <= 0}
              description="Compared to previous month"
              icon={TrendingDown}
              accentColor="rose"
            />
            <StatCard
              title="Current Balance"
              value={formatCurrency(summary.currentBalance)}
              change={null}
              isPositive={summary.currentBalance >= 0}
              description="Net available liquid assets"
              icon={Wallet}
              accentColor="indigo"
            />
            <StatCard
              title="Monthly Budget"
              value={formatCurrency(summary.monthlyBudget)}
              change={`${summary.budgetUsedPct || 0}% used`}
              isPositive={summary.budgetUsedPct <= 90}
              description={`${formatCurrency(summary.remainingBudget)} remaining in budget`}
              icon={Target}
              accentColor="amber"
            />
          </div>

          {/* Main Grid: Charts & Analytics Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Income vs Expense Bar Chart */}
              <DashboardCard
                title="Income vs Expense Trajectory"
                action={
                  <Link to="/dashboard/analytics" className="text-xs font-bold text-[#DC2626] hover:text-[#B91C1C] flex items-center space-x-1 transition-colors">
                    <span>Full Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              >
                <IncomeExpenseBarChart data={monthlyTrend} />
              </DashboardCard>

              {/* Monthly Spending Area Chart */}
              <DashboardCard
                title="Monthly Cash Flow & Spending Trajectory"
                action={<Activity className="w-4 h-4 text-[#DC2626]" />}
              >
                <SpendingLineChart data={monthlyTrend} />
              </DashboardCard>

              {/* Recent Activity */}
              <RecentTransactionsCard initialData={recent} loading={loading} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Financial Health Score Widget */}
              <DashboardCard
                title="Financial Health Score"
                action={<ShieldCheck className="w-4 h-4 text-[#22C55E]" />}
              >
                <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">
                      Overall Rating
                    </span>
                    <div className="text-xl font-extrabold text-[#0F172A] flex items-center space-x-2">
                      <span>{summary.healthScore.rating}</span>
                    </div>
                    <p className="text-[11px] text-[#475569]">Based on savings & budget ratio</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#F97316] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-red-500/20">
                    {summary.healthScore.score}
                  </div>
                </div>
              </DashboardCard>

              {/* Expense Category Pie Chart */}
              <DashboardCard
                title="Expense By Category"
                action={<PieIcon className="w-4 h-4 text-[#64748B]" />}
              >
                <ExpensePieChart data={categories} />
              </DashboardCard>

              {/* Top Spending Categories List */}
              <DashboardCard title="Top Spending Breakdown">
                {categories.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#94A3B8]">
                    No expense category data logged yet.
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {categories.slice(0, 5).map((c) => (
                      <div key={c.category} className="space-y-1.5">
                        <div className="flex justify-between text-[#334155]">
                          <span className="font-bold">{c.category}</span>
                          <span className="font-semibold text-[#475569]">
                            {formatCurrency(c.totalAmount)} ({c.percentage}%)
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
                )}
              </DashboardCard>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
