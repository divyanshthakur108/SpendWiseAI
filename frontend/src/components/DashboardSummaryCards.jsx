import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const DashboardSummaryCards = ({
  summaryData = {
    totalIncome: 8450.00,
    totalExpenses: 3280.40,
    currentBalance: 5169.60,
    monthlyBudget: 4000.00,
  },
}) => {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);

  const budgetUsedPercentage = Math.min(
    Math.round(((summaryData.totalExpenses || 0) / (summaryData.monthlyBudget || 1)) * 100),
    100
  );

  const cards = [
    {
      id: 'income',
      title: 'Total Income',
      amount: formatCurrency(summaryData.totalIncome),
      change: '+15.2%',
      changeType: 'positive',
      subtext: 'vs previous month',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glowColor: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'expenses',
      title: 'Total Expenses',
      amount: formatCurrency(summaryData.totalExpenses),
      change: '-4.8%',
      changeType: 'positive-down',
      subtext: 'vs previous month',
      icon: TrendingDown,
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glowColor: 'hover:border-rose-500/40 hover:shadow-rose-500/10',
      badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    {
      id: 'balance',
      title: 'Current Balance',
      amount: formatCurrency(summaryData.currentBalance),
      change: '+61.2%',
      changeType: 'positive',
      subtext: 'net savings rate',
      icon: Wallet,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glowColor: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    },
    {
      id: 'budget',
      title: 'Monthly Budget',
      amount: formatCurrency(summaryData.monthlyBudget),
      progress: budgetUsedPercentage,
      subtext: `${budgetUsedPercentage}% spent of budget`,
      icon: Target,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glowColor: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
      badgeBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`group relative p-5 sm:p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${card.glowColor}`}
          >
            {/* Ambient Overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            {/* Header: Title + Icon */}
            <div className="flex items-center justify-between space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Main Value Display */}
            <div className="mt-3 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {card.amount}
              </div>

              {/* Progress bar for Budget card */}
              {card.progress !== undefined ? (
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Budget Spent</span>
                    <span className="font-semibold text-slate-200">{card.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        card.progress > 90
                          ? 'bg-rose-500'
                          : card.progress > 75
                          ? 'bg-amber-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* Trend Badge */
                <div className="flex items-center space-x-2 pt-1">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-semibold ${card.badgeBg}`}
                  >
                    {card.changeType === 'positive' && (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                    {card.changeType === 'positive-down' && (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>{card.change}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {card.subtext}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardSummaryCards;
