import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import {
  parseNaturalLanguageExpense,
  categorizeTransaction,
  generateMonthlyInsights,
  chatWithFinancialAI,
} from '../services/aiService.js';

/**
 * Helper to build complete live financial context for an authenticated user
 */
const buildUserFinancialContext = async (userId) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const startOfThisMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfThisMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
  const startOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
  const endOfLastMonth = new Date(
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  // 1. Fetch all user transactions from MongoDB
  const allTransactions = await Transaction.find({ user: userId })
    .sort({ transactionDate: -1 })
    .lean();

  // 2. Fetch all user budgets
  const budgets = await Budget.find({ user: userId }).lean();

  if (!allTransactions || allTransactions.length === 0) {
    return {
      hasTransactions: false,
      totalTransactionsCount: 0,
      thisMonthTransactionCount: 0,
      thisMonthIncome: 0,
      thisMonthExpense: 0,
      thisMonthNetBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      netSavings: 0,
      savingsRate: '0%',
      highestCategory: 'None',
      highestCategoryAmount: 0,
      categoryBreakdown: {},
      categoryIncreasedMost: 'None',
      maxIncreaseAmount: 0,
      largestExpense: null,
      averageDailySpending: 0,
      lastMonthIncome: 0,
      lastMonthExpense: 0,
      expenseDiff: 0,
      expenseDiffPercent: 0,
      totalBudgetLimit: 0,
      totalBudgetSpent: 0,
      remainingBudget: 0,
      recentTransactions: [],
    };
  }

  // Filter current month transactions
  const thisMonthTransactions = allTransactions.filter((t) => {
    const d = new Date(t.transactionDate);
    return d >= startOfThisMonth && d <= endOfThisMonth;
  });

  const thisMonthExpense = thisMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthIncome = thisMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filter last month transactions
  const lastMonthTransactions = allTransactions.filter((t) => {
    const d = new Date(t.transactionDate);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  });

  const lastMonthExpense = lastMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthIncome = lastMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // All time totals
  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  // Category totals for this month
  const categoryTotalsThisMonth = {};
  thisMonthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotalsThisMonth[t.category] =
        (categoryTotalsThisMonth[t.category] || 0) + t.amount;
    });

  let highestCategory = 'None';
  let highestCategoryAmount = 0;
  Object.entries(categoryTotalsThisMonth).forEach(([cat, amt]) => {
    if (amt > highestCategoryAmount) {
      highestCategoryAmount = amt;
      highestCategory = cat;
    }
  });

  // If this month has no expense categories, fallback to all-time top category
  if (highestCategory === 'None') {
    const categoryTotalsAllTime = {};
    allTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotalsAllTime[t.category] =
          (categoryTotalsAllTime[t.category] || 0) + t.amount;
      });
    Object.entries(categoryTotalsAllTime).forEach(([cat, amt]) => {
      if (amt > highestCategoryAmount) {
        highestCategoryAmount = amt;
        highestCategory = cat;
      }
    });
  }

  // Category increased most comparison
  const categoryTotalsLastMonth = {};
  lastMonthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotalsLastMonth[t.category] =
        (categoryTotalsLastMonth[t.category] || 0) + t.amount;
    });

  let categoryIncreasedMost = 'None';
  let maxIncreaseAmount = 0;
  const allCategories = new Set([
    ...Object.keys(categoryTotalsThisMonth),
    ...Object.keys(categoryTotalsLastMonth),
  ]);

  allCategories.forEach((cat) => {
    const thisAmt = categoryTotalsThisMonth[cat] || 0;
    const lastAmt = categoryTotalsLastMonth[cat] || 0;
    const diff = thisAmt - lastAmt;
    if (diff > maxIncreaseAmount) {
      maxIncreaseAmount = diff;
      categoryIncreasedMost = cat;
    }
  });

  // Largest single expense across all transactions
  const expenseTransactions = allTransactions.filter((t) => t.type === 'expense');
  let largestExpense = null;
  if (expenseTransactions.length > 0) {
    const topExp = expenseTransactions.reduce(
      (max, t) => (t.amount > max.amount ? t : max),
      expenseTransactions[0]
    );
    largestExpense = {
      description: topExp.description,
      amount: topExp.amount,
      category: topExp.category,
      date: new Date(topExp.transactionDate).toISOString().split('T')[0],
    };
  }

  // Average daily spending this month
  const today = new Date();
  const daysPassed = Math.max(1, today.getDate());
  const averageDailySpending = Math.round((thisMonthExpense / daysPassed) * 100) / 100;

  // Budget computations
  const activeBudgets = budgets.filter(
    (b) => b.month === currentMonth && b.year === currentYear
  );
  let totalBudgetLimit = 0;
  let totalBudgetSpent = 0;

  activeBudgets.forEach((b) => {
    totalBudgetLimit += b.amount;
    if (b.category.toLowerCase() === 'overall') {
      totalBudgetSpent += thisMonthExpense;
    } else {
      totalBudgetSpent += categoryTotalsThisMonth[b.category] || 0;
    }
  });

  const remainingBudget = Math.max(0, totalBudgetLimit - totalBudgetSpent);

  // Recent 5 transactions
  const recentTransactions = allTransactions.slice(0, 5).map((t) => ({
    description: t.description,
    amount: t.amount,
    category: t.category,
    type: t.type,
    date: new Date(t.transactionDate).toISOString().split('T')[0],
  }));

  const expenseDiff = thisMonthExpense - lastMonthExpense;
  const expenseDiffPercent =
    lastMonthExpense > 0
      ? Math.round(((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100)
      : 0;

  return {
    hasTransactions: true,
    totalTransactionsCount: allTransactions.length,
    thisMonthTransactionCount: thisMonthTransactions.length,

    thisMonthIncome: Math.round(thisMonthIncome * 100) / 100,
    thisMonthExpense: Math.round(thisMonthExpense * 100) / 100,
    thisMonthNetBalance: Math.round((thisMonthIncome - thisMonthExpense) * 100) / 100,

    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    savingsRate: `${savingsRate}%`,

    highestCategory,
    highestCategoryAmount: Math.round(highestCategoryAmount * 100) / 100,
    categoryBreakdown: categoryTotalsThisMonth,
    categoryIncreasedMost,
    maxIncreaseAmount: Math.round(maxIncreaseAmount * 100) / 100,

    largestExpense,
    averageDailySpending,

    lastMonthIncome: Math.round(lastMonthIncome * 100) / 100,
    lastMonthExpense: Math.round(lastMonthExpense * 100) / 100,
    expenseDiff: Math.round(expenseDiff * 100) / 100,
    expenseDiffPercent,

    totalBudgetLimit: Math.round(totalBudgetLimit * 100) / 100,
    totalBudgetSpent: Math.round(totalBudgetSpent * 100) / 100,
    remainingBudget: Math.round(remainingBudget * 100) / 100,

    recentTransactions,
  };
};

/**
 * @desc    Parse natural language input & automatically create transaction
 * @route   POST /api/ai/parse-expense
 * @access  Private
 */
export const parseAndCreateExpense = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please provide expense text input' });
    }

    const parsed = await parseNaturalLanguageExpense(text.trim());

    // Automatically create the transaction in MongoDB
    const transaction = await Transaction.create({
      user: req.user._id,
      description: parsed.description || text.substring(0, 50),
      amount: parsed.amount || 10,
      type: parsed.type || 'expense',
      category: parsed.category || 'Other',
      transactionDate: parsed.date ? new Date(parsed.date) : new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Natural language expense parsed and created successfully',
      data: transaction,
      parsed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Automatic transaction categorization
 * @route   POST /api/ai/categorize
 * @access  Private
 */
export const categorize = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Please provide description' });
    }

    const category = await categorizeTransaction(description);

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate personalized monthly spending insights
 * @route   GET /api/ai/insights
 * @access  Private
 */
export const getMonthlyInsights = async (req, res, next) => {
  try {
    const context = await buildUserFinancialContext(req.user._id);
    const insights = await generateMonthlyInsights(context);

    return res.status(200).json({
      success: true,
      insights,
      summary: {
        totalIncome: context.thisMonthIncome || context.totalIncome,
        totalExpense: context.thisMonthExpense || context.totalExpense,
        highestCategory: context.highestCategory,
        highestCategoryAmount: context.highestCategoryAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI Budget Advice for threshold warnings
 * @route   GET /api/ai/budget-advice
 * @access  Private
 */
export const getBudgetAdvice = async (req, res, next) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month: currentMonth,
      year: currentYear,
    });

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const monthExpenses = await Transaction.find({
      user: req.user._id,
      type: 'expense',
      transactionDate: { $gte: startDate, $lte: endDate },
    });

    const warnings = [];

    budgets.forEach((b) => {
      let spent = 0;
      if (b.category.toLowerCase() === 'overall') {
        spent = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
      } else {
        spent = monthExpenses
          .filter((tx) => tx.category.toLowerCase() === b.category.toLowerCase())
          .reduce((sum, tx) => sum + tx.amount, 0);
      }

      const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

      if (pct >= 100) {
        warnings.push({
          category: b.category,
          level: 'critical',
          percentage: pct,
          message: `CRITICAL: You have spent $${spent} exceeding your $${b.amount} ${b.category} budget limit!`,
          recommendation: 'Freeze non-essential spending in this category immediately for the remainder of the month.',
        });
      } else if (pct >= 90) {
        warnings.push({
          category: b.category,
          level: 'warning',
          percentage: pct,
          message: `WARNING: ${b.category} budget is at ${pct}% capacity ($${spent} / $${b.amount}).`,
          recommendation: `Only $${b.amount - spent} remaining. Reallocate funds from savings if necessary.`,
        });
      } else if (pct >= 80) {
        warnings.push({
          category: b.category,
          level: 'caution',
          percentage: pct,
          message: `CAUTION: ${b.category} budget reached ${pct}% threshold.`,
          recommendation: 'Monitor upcoming transactions closely over the next week.',
        });
      }
    });

    return res.status(200).json({
      success: true,
      warnings,
      activeBudgetsCount: budgets.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Chatbot assistant with live database context
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chatAI = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Please provide a chat message' });
    }

    // Build complete live database context for the authenticated user
    const liveContext = await buildUserFinancialContext(req.user._id);

    const reply = await chatWithFinancialAI(message.trim(), liveContext);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
};
