import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import User from '../models/User.js';

/**
 * Helper to compute date boundaries for presets
 */
export const getPresetDateRange = (preset, customStart, customEnd) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_week':
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'last_3_months':
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    case 'last_6_months':
      start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'custom':
      start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      end = customEnd ? new Date(customEnd) : new Date();
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { start, end };
};

/**
 * Service: Generate complete report summary data
 */
export const getReportSummaryService = async (userId, query) => {
  const { preset = 'this_month', startDate, endDate } = query;
  const { start, end } = getPresetDateRange(preset, startDate, endDate);

  const user = await User.findById(userId).select('name email');

  const filter = {
    user: userId,
    transactionDate: { $gte: start, $lte: end },
  };

  const transactions = await Transaction.find(filter).sort({ transactionDate: -1 }).lean();

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals = {};

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpenses += tx.amount;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    }
  });

  const netBalance = totalIncome - totalExpenses;

  // Active Budget Calculations
  const currentMonth = start.getMonth() + 1;
  const currentYear = start.getFullYear();

  const budgets = await Budget.find({
    user: userId,
    month: currentMonth,
    year: currentYear,
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetUsed = totalExpenses;
  const remainingBudget = Math.max(0, totalBudget - budgetUsed);

  // Category Breakdown sorted from highest to lowest
  const topSpendingCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100 * 10) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    userInfo: {
      name: user ? user.name : 'User',
      email: user ? user.email : '',
    },
    dateRange: {
      preset,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    },
    financialSummary: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      totalBudget: Math.round(totalBudget * 100) / 100,
      budgetUsed: Math.round(budgetUsed * 100) / 100,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
      transactionCount: transactions.length,
    },
    topSpendingCategories,
    transactions,
  };
};

/**
 * Service: Generate CSV report content
 */
export const getCSVReportService = async (userId, query) => {
  const { preset = 'this_month', startDate, endDate } = query;
  const { start, end } = getPresetDateRange(preset, startDate, endDate);

  const transactions = await Transaction.find({
    user: userId,
    transactionDate: { $gte: start, $lte: end },
  }).sort({ transactionDate: -1 }).lean();

  let csv = 'Date,Type,Category,Description,Amount,Payment Method,Notes\n';

  transactions.forEach((t) => {
    const formattedDate = new Date(t.transactionDate || t.date).toISOString().split('T')[0];
    const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
    const cat = `"${(t.category || '').replace(/"/g, '""')}"`;
    const pm = `"${(t.paymentMethod || '').replace(/"/g, '""')}"`;
    const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;
    const amount = t.type === 'income' ? t.amount : -t.amount;

    csv += `${formattedDate},${t.type},${cat},${desc},${amount},${pm},${notes}\n`;
  });

  return csv;
};
