import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

/**
 * Helper to compute Financial Health Score (0 - 100)
 */
const calculateHealthScore = (totalIncome, totalExpense, totalBudget, actualSpent) => {
  if (totalIncome === 0) return { score: 50, rating: 'Average' };

  // 1. Savings Rate (0 - 40 pts)
  const savingsRate = Math.max(0, (totalIncome - totalExpense) / totalIncome);
  const savingsScore = Math.min(40, savingsRate * 100);

  // 2. Expense Ratio (0 - 40 pts)
  const expenseRatio = totalExpense / totalIncome;
  const expenseScore = Math.max(0, Math.min(40, (1 - expenseRatio) * 50));

  // 3. Budget Control (0 - 20 pts)
  let budgetScore = 20;
  if (totalBudget > 0) {
    const budgetUsedRatio = actualSpent / totalBudget;
    if (budgetUsedRatio > 1) budgetScore = 0;
    else if (budgetUsedRatio > 0.9) budgetScore = 5;
    else if (budgetUsedRatio > 0.8) budgetScore = 12;
    else budgetScore = 20;
  }

  const finalScore = Math.round(savingsScore + expenseScore + budgetScore);

  let rating = 'Average';
  if (finalScore >= 80) rating = 'Excellent';
  else if (finalScore >= 65) rating = 'Good';
  else if (finalScore >= 45) rating = 'Average';
  else rating = 'Poor';

  return { score: Math.min(100, Math.max(0, finalScore)), rating };
};

/**
 * 1. Get Dashboard Summary & Overview Analytics
 */
export const getSummaryAnalyticsService = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const startCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
  const endCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  const startPrevMonth = new Date(currentYear, currentMonth - 2, 1);
  const endPrevMonth = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59, 999);

  // Total Lifetime Income & Expenses
  const lifetimeAgg = await Transaction.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalTransactions = 0;

  lifetimeAgg.forEach((item) => {
    if (item._id === 'income') totalIncome = item.total;
    if (item._id === 'expense') totalExpenses = item.total;
    totalTransactions += item.count;
  });

  const currentBalance = totalIncome - totalExpenses;

  // Current Month Income & Expenses
  const currentMonthAgg = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        transactionDate: { $gte: startCurrentMonth, $lte: endCurrentMonth },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let currentMonthIncome = 0;
  let currentMonthExpenses = 0;

  currentMonthAgg.forEach((item) => {
    if (item._id === 'income') currentMonthIncome = item.total;
    if (item._id === 'expense') currentMonthExpenses = item.total;
  });

  // Previous Month Income & Expenses for Percentage Changes
  const prevMonthAgg = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        transactionDate: { $gte: startPrevMonth, $lte: endPrevMonth },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let prevMonthIncome = 0;
  let prevMonthExpenses = 0;

  prevMonthAgg.forEach((item) => {
    if (item._id === 'income') prevMonthIncome = item.total;
    if (item._id === 'expense') prevMonthExpenses = item.total;
  });

  const incomeChangePct = prevMonthIncome > 0
    ? Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100 * 10) / 10
    : 0;

  const expenseChangePct = prevMonthExpenses > 0
    ? Math.round(((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 * 10) / 10
    : 0;

  // Active Monthly Budget
  const budgets = await Budget.find({
    user: userId,
    month: currentMonth,
    year: currentYear,
  });

  const monthlyBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetUsedPct = monthlyBudget > 0 ? Math.round((currentMonthExpenses / monthlyBudget) * 100 * 10) / 10 : 0;
  const remainingBudget = Math.max(0, monthlyBudget - currentMonthExpenses);

  const healthScore = calculateHealthScore(totalIncome, totalExpenses, monthlyBudget, currentMonthExpenses);

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    currentBalance: Math.round(currentBalance * 100) / 100,
    monthlyBudget: Math.round(monthlyBudget * 100) / 100,
    budgetUsedPct,
    remainingBudget: Math.round(remainingBudget * 100) / 100,
    totalTransactions,
    currentMonthIncome: Math.round(currentMonthIncome * 100) / 100,
    currentMonthExpenses: Math.round(currentMonthExpenses * 100) / 100,
    incomeChangePct,
    expenseChangePct,
    healthScore,
  };
};

/**
 * 2. Get 12-Month Monthly Spending Trend & Cash Flow
 */
export const getMonthlyTrendService = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const monthlyAgg = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        transactionDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const map = {};

  for (let i = 0; i < 12; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    map[key] = {
      month: `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`,
      income: 0,
      expenses: 0,
      savings: 0,
    };
  }

  monthlyAgg.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    if (map[key]) {
      if (item._id.type === 'income') map[key].income = Math.round(item.total * 100) / 100;
      if (item._id.type === 'expense') map[key].expenses = Math.round(item.total * 100) / 100;
      map[key].savings = Math.round((map[key].income - map[key].expenses) * 100) / 100;
    }
  });

  return Object.values(map);
};

/**
 * 3. Get Expense Category Analytics
 */
export const getCategoryAnalyticsService = async (userId, timeframe = 'all') => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const match = { user: userObjectId, type: 'expense' };

  const now = new Date();
  if (timeframe === 'month') {
    match.transactionDate = {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  } else if (timeframe === '3months') {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    match.transactionDate = { $gte: d };
  } else if (timeframe === '6months') {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    match.transactionDate = { $gte: d };
  } else if (timeframe === '12months') {
    const d = new Date();
    d.setMonth(d.getMonth() - 12);
    match.transactionDate = { $gte: d };
  }

  const categoryAgg = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  const grandTotal = categoryAgg.reduce((sum, c) => sum + c.totalAmount, 0);

  return categoryAgg.map((c) => ({
    category: c._id,
    totalAmount: Math.round(c.totalAmount * 100) / 100,
    percentage: grandTotal > 0 ? Math.round((c.totalAmount / grandTotal) * 100 * 10) / 10 : 0,
    count: c.count,
  }));
};

/**
 * 4. Get Latest 10 Recent Activity Transactions
 */
export const getRecentActivityService = async (userId) => {
  return await Transaction.find({ user: userId })
    .sort({ transactionDate: -1 })
    .limit(10)
    .lean();
};

/**
 * 5. Get Extended Spending Statistics
 */
export const getSpendingStatsService = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const highestExpenseDoc = await Transaction.findOne({ user: userId, type: 'expense' })
    .sort({ amount: -1 })
    .lean();

  const highestIncomeDoc = await Transaction.findOne({ user: userId, type: 'income' })
    .sort({ amount: -1 })
    .lean();

  const categoryAnalytics = await getCategoryAnalyticsService(userId, 'all');

  const largestCategory = categoryAnalytics.length > 0 ? categoryAnalytics[0].category : 'None';
  const smallestCategory = categoryAnalytics.length > 0 ? categoryAnalytics[categoryAnalytics.length - 1].category : 'None';

  return {
    highestExpense: highestExpenseDoc ? highestExpenseDoc.amount : 0,
    highestIncome: highestIncomeDoc ? highestIncomeDoc.amount : 0,
    largestCategory,
    smallestCategory,
  };
};

/**
 * 6. Get Budget Progress Analytics for Active Month
 */
export const getBudgetProgressService = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgets = await Budget.find({
    user: userId,
    month: currentMonth,
    year: currentYear,
  }).sort({ category: 1 }).lean();

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  const monthExpenses = await Transaction.find({
    user: userId,
    type: 'expense',
    transactionDate: { $gte: startDate, $lte: endDate },
  }).lean();

  return budgets.map((b) => {
    let spent = 0;
    if (b.category.toLowerCase() === 'overall') {
      spent = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    } else {
      spent = monthExpenses
        .filter((tx) => tx.category && tx.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, tx) => sum + tx.amount, 0);
    }
    return {
      category: b.category,
      budget: b.amount,
      spent: Math.round(spent * 100) / 100,
      pct: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
    };
  });
};
