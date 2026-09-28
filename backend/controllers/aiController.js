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
 * Helper to extract category from text based on standard and user-defined categories
 */
const extractCategoryFromQuery = (message, userCategories = []) => {
  const standardCategoryMap = [
    { name: 'Groceries', patterns: [/\bgrocer(?:y|ies)\b/i, /\bfood items?\b/i, /\bration\b/i, /\bkirana\b/i, /\bsupermarket\b/i] },
    { name: 'Dining Out', patterns: [/\bdining(?:\s*out)?\b/i, /\brestaurants?\b/i, /\bcafe[s]?\b/i, /\beating out\b/i, /\bswiggy\b/i, /\bzomato\b/i, /\btakeout\b/i, /\bfast food\b/i, /\blunch\b/i, /\bdinner\b/i, /\bcoffee\b/i] },
    { name: 'Utilities', patterns: [/\butilit(?:y|ies)\b/i, /\belectricity\b/i, /\bwater bill\b/i, /\bgas bill\b/i, /\bwifi\b/i, /\binternet\b/i, /\bphone bill\b/i, /\bmobile bill\b/i, /\bbills?\b/i] },
    { name: 'Software & Tech', patterns: [/\bsoftware\b/i, /\btech\b/i, /\bsubscriptions?\b/i, /\bsaas\b/i, /\bhosting\b/i, /\bcloud\b/i, /\btools?\b/i] },
    { name: 'Salary', patterns: [/\bsalary\b/i, /\bwages?\b/i, /\bstipend\b/i, /\bpaycheck\b/i] },
    { name: 'Freelance', patterns: [/\bfreelanc(?:e|ing)\b/i, /\bclient work\b/i, /\bgigs?\b/i, /\bconsulting\b/i] },
    { name: 'Entertainment', patterns: [/\bentertainment\b/i, /\bmovies?\b/i, /\bcinema\b/i, /\bnetflix\b/i, /\bgaming\b/i, /\bgames?\b/i, /\bshows?\b/i] },
    { name: 'Health', patterns: [/\bhealth(?:care)?\b/i, /\bmedical\b/i, /\bmedicines?\b/i, /\bhospital\b/i, /\bdoctor\b/i, /\bpharmacy\b/i, /\bgym\b/i, /\bfitness\b/i] },
    { name: 'Travel', patterns: [/\btravel\b/i, /\btrip\b/i, /\btransport(?:ation)?\b/i, /\bcommuting\b/i, /\bflight[s]?\b/i, /\btrain[s]?\b/i, /\btaxi\b/i, /\bcab[s]?\b/i, /\buber\b/i, /\bola\b/i, /\bbus\b/i, /\bfuel\b/i, /\bpetrol\b/i] },
    { name: 'Shopping', patterns: [/\bshopping\b/i, /\bclothes\b/i, /\bclothing\b/i, /\bshoes\b/i, /\bamazon\b/i, /\bflipkart\b/i] },
    { name: 'Other', patterns: [/\bother\b/i, /\bmisc(?:ellaneous)?\b/i] },
  ];

  // 1. Check user-defined categories first
  if (Array.isArray(userCategories)) {
    for (const cat of userCategories) {
      if (!cat) continue;
      const regex = new RegExp(`\\b${cat}\\b`, 'i');
      if (regex.test(message)) {
        return cat;
      }
    }
  }

  // 2. Check standard category mapping patterns
  for (const item of standardCategoryMap) {
    for (const pat of item.patterns) {
      if (pat.test(message)) {
        return item.name;
      }
    }
  }

  return null;
};

/**
 * Detect User Intent from Natural Language Message
 */
export const detectUserIntent = (message, userCategories = []) => {
  const lower = message.toLowerCase().trim();
  const category = extractCategoryFromQuery(lower, userCategories);

  // 1. SAVING ADVICE: e.g. "How can I reduce my grocery expenses?", "How can I save more?"
  const advicePattern = /(?:how (?:can|do) i|ways to|tips to|how to|suggestions? (?:to|for)|advise me on|advice on|help me) (?:reduce|cut|save|decrease|lower|curtail|minimize)/i;
  const generalAdvicePattern = /(?:reduce.*expenses?|cut down|save more|cut back|saving advice|saving tips|financial advice|money-saving)/i;
  if (advicePattern.test(lower) || generalAdvicePattern.test(lower)) {
    return { intent: 'SAVING_ADVICE', category };
  }

  // 2. MONTH COMPARISON: e.g. "Compare this month with last month"
  if (
    /(?:compare|comparison|difference between).*(?:last month|previous month)/i.test(lower) ||
    /(?:this month).*(?:vs|versus|compared to|compared with).*(?:last month|previous month)/i.test(lower) ||
    /(?:last month vs this month|this month vs last month)/i.test(lower) ||
    (lower.includes('compare') && (lower.includes('month') || lower.includes('last month')))
  ) {
    return { intent: 'MONTH_COMPARISON' };
  }

  // 3. BUDGET QUESTIONS: e.g. "How much budget remains?", "Am I over my grocery budget?"
  if (/\bbudget(?:s)?\b/i.test(lower)) {
    return { intent: 'BUDGET_REMAINING', category };
  }

  // 4. CATEGORY COMPARISON: e.g. "How much did I spend on groceries compared to my total spending?"
  if (
    category &&
    (/(?:compared to|compare(?:d)? with|percentage of|proportion of|share of|vs total|versus total|out of total|relative to)/i.test(lower) ||
     (/(?:how much|what percentage|what portion).*(?:spend|spent).*(?:compared|out of|proportion)/i.test(lower)))
  ) {
    return { intent: 'CATEGORY_COMPARISON', category };
  }

  // 5. HIGHEST SPENDING CATEGORY: e.g. "Which category did I spend the most on?", "What is my highest expense category?"
  if (
    /(?:which|what|top|highest|biggest|most expensive) category/i.test(lower) ||
    /(?:category).*(?:spend the most|spent the most|highest|maximum|top)/i.test(lower) ||
    /(?:spend the most on|spent the most on|where did i spend the most)/i.test(lower) ||
    /(?:top|highest|maximum) (?:spending|expense) category/i.test(lower)
  ) {
    return { intent: 'HIGHEST_CATEGORY' };
  }

  // 6. LARGEST INDIVIDUAL EXPENSE: e.g. "What was my largest expense?", "biggest expense"
  if (
    /(?:largest|biggest|maximum|highest|max|most expensive) (?:single )?(?:expense|transaction|purchase|item|cost)/i.test(lower) ||
    /(?:what was my largest expense|what is my biggest expense)/i.test(lower)
  ) {
    return { intent: 'LARGEST_EXPENSE' };
  }

  // 7. RECENT TRANSACTIONS: e.g. "Show my recent transactions."
  if (
    /(?:recent|latest|last|past) (?:few )?(?:transactions|expenses|purchases|payments|records|history)/i.test(lower) ||
    /(?:show|display|list|get) (?:my )?(?:recent|latest|last) (?:transactions|expenses|activity)/i.test(lower)
  ) {
    return { intent: 'RECENT_TRANSACTIONS' };
  }

  // 8. CATEGORY SPENDING: e.g. "How much did I spend on groceries this month?"
  if (category) {
    return { intent: 'CATEGORY_SPENDING', category };
  }

  // 9. SAVINGS: e.g. "How much have I saved this month?", "what are my savings"
  if (
    /(?:how much).*(?:have i saved|did i save|saved|save this month)/i.test(lower) ||
    /\b(?:net savings|total savings|my savings|how much saved|savings this month)\b/i.test(lower)
  ) {
    return { intent: 'SAVINGS' };
  }

  // 10. TOTAL INCOME: e.g. "How much income did I receive this month?", "how much did I earn"
  if (
    /(?:income|earnings|salary received|money received|how much did i earn|how much income)/i.test(lower)
  ) {
    return { intent: 'TOTAL_INCOME' };
  }

  // 11. TOTAL MONTHLY SPENDING: e.g. "How much did I spend this month?"
  if (
    /(?:how much did i spend|how much i spent|total (?:spending|spend|expense|expenses)|monthly spending|monthly expense|spend this month|spent this month)/i.test(lower) ||
    /\b(?:spend|spent|expenses)\b/i.test(lower)
  ) {
    return { intent: 'TOTAL_SPENDING' };
  }

  return { intent: 'GENERAL_FINANCIAL_QUERY' };
};

/**
 * Fetch and calculate accurate financial data from MongoDB based on detected intent
 */
export const calculateFinancialDataForIntent = async (userId, intentInfo) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const startOfThisMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
  const endOfThisMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
  const startOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1, 0, 0, 0, 0);
  const endOfLastMonth = new Date(
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = `${monthNames[currentMonth - 1]} ${currentYear}`;
  const lastMonthName = `${monthNames[lastMonthDate.getMonth()]} ${lastMonthDate.getFullYear()}`;

  // Check if user has any transactions at all
  const totalUserTransactionsCount = await Transaction.countDocuments({ user: userId });
  if (totalUserTransactionsCount === 0) {
    return {
      hasTransactions: false,
      intent: intentInfo.intent,
      category: intentInfo.category || null,
      message: 'No transactions found for this user in the database.',
    };
  }

  const { intent, category } = intentInfo;

  switch (intent) {
    case 'CATEGORY_SPENDING':
    case 'CATEGORY_COMPARISON': {
      const categoryRegex = new RegExp(`^${category}$`, 'i');

      // 1. Fetch current month expense transactions for this specific category
      const categoryTransactions = await Transaction.find({
        user: userId,
        type: 'expense',
        category: categoryRegex,
        transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }).sort({ transactionDate: -1 }).lean();

      const categoryTotal = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const transactionCount = categoryTransactions.length;

      // 2. Fetch all current month expense transactions to compute proportion & total
      const allThisMonthExpenses = await Transaction.find({
        user: userId,
        type: 'expense',
        transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }).lean();

      const totalMonthlyExpense = allThisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
      const sharePercentage = totalMonthlyExpense > 0
        ? Math.round((categoryTotal / totalMonthlyExpense) * 100)
        : 0;

      // Also check all-time category spend if current month has zero
      let allTimeCategorySpend = 0;
      let allTimeCategoryCount = 0;
      if (transactionCount === 0) {
        const allTimeCatTxs = await Transaction.find({
          user: userId,
          type: 'expense',
          category: categoryRegex,
        }).lean();
        allTimeCategorySpend = allTimeCatTxs.reduce((sum, t) => sum + t.amount, 0);
        allTimeCategoryCount = allTimeCatTxs.length;
      }

      return {
        hasTransactions: true,
        intent,
        category,
        currentMonthName,
        categoryTotal,
        transactionCount,
        totalMonthlyExpense,
        sharePercentage,
        transactions: categoryTransactions.map((t) => ({
          description: t.description,
          amount: t.amount,
          date: new Date(t.transactionDate).toISOString().split('T')[0],
        })),
        allTimeCategorySpend,
        allTimeCategoryCount,
      };
    }

    case 'HIGHEST_CATEGORY': {
      // Fetch all expense transactions for current month
      const thisMonthExpenses = await Transaction.find({
        user: userId,
        type: 'expense',
        transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }).lean();

      const categoryTotals = {};
      const categoryCounts = {};
      let totalExpense = 0;

      thisMonthExpenses.forEach((t) => {
        totalExpense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      });

      let highestCategory = 'None';
      let highestCategoryAmount = 0;
      let highestCategoryCount = 0;

      Object.entries(categoryTotals).forEach(([cat, amt]) => {
        if (amt > highestCategoryAmount) {
          highestCategoryAmount = amt;
          highestCategory = cat;
          highestCategoryCount = categoryCounts[cat] || 0;
        }
      });

      // Fallback to all-time top category if none found this month
      let isAllTimeFallback = false;
      if (highestCategory === 'None') {
        const allExpenses = await Transaction.find({ user: userId, type: 'expense' }).lean();
        allExpenses.forEach((t) => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
          categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        });
        Object.entries(categoryTotals).forEach(([cat, amt]) => {
          if (amt > highestCategoryAmount) {
            highestCategoryAmount = amt;
            highestCategory = cat;
            highestCategoryCount = categoryCounts[cat] || 0;
          }
        });
        if (highestCategory !== 'None') isAllTimeFallback = true;
      }

      const sharePercentage = totalExpense > 0
        ? Math.round((highestCategoryAmount / totalExpense) * 100)
        : 0;

      return {
        hasTransactions: true,
        intent,
        currentMonthName,
        highestCategory,
        highestCategoryAmount,
        highestCategoryCount,
        totalMonthlyExpense: totalExpense,
        sharePercentage,
        isAllTimeFallback,
        breakdown: categoryTotals,
      };
    }

    case 'LARGEST_EXPENSE': {
      const topExpense = await Transaction.findOne({ user: userId, type: 'expense' })
        .sort({ amount: -1 })
        .lean();

      if (!topExpense) {
        return {
          hasTransactions: true,
          intent,
          largestExpense: null,
        };
      }

      return {
        hasTransactions: true,
        intent,
        largestExpense: {
          description: topExpense.description,
          amount: topExpense.amount,
          category: topExpense.category,
          date: new Date(topExpense.transactionDate).toISOString().split('T')[0],
          paymentMethod: topExpense.paymentMethod || 'credit_card',
        },
      };
    }

    case 'TOTAL_SPENDING': {
      const thisMonthExpenses = await Transaction.find({
        user: userId,
        type: 'expense',
        transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }).lean();

      const totalMonthlyExpense = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

      return {
        hasTransactions: true,
        intent,
        currentMonthName,
        totalMonthlyExpense,
        transactionCount: thisMonthExpenses.length,
      };
    }

    case 'TOTAL_INCOME': {
      const thisMonthIncomeTxs = await Transaction.find({
        user: userId,
        type: 'income',
        transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }).lean();

      const totalMonthlyIncome = thisMonthIncomeTxs.reduce((sum, t) => sum + t.amount, 0);

      const allTimeIncomeTxs = await Transaction.find({ user: userId, type: 'income' }).lean();
      const allTimeTotalIncome = allTimeIncomeTxs.reduce((sum, t) => sum + t.amount, 0);

      return {
        hasTransactions: true,
        intent,
        currentMonthName,
        totalMonthlyIncome,
        transactionCount: thisMonthIncomeTxs.length,
        allTimeTotalIncome,
      };
    }

    case 'SAVINGS': {
      const thisMonthTxs = await Transaction.find({
        user: userId,
        transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }).lean();

      const thisMonthIncome = thisMonthTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const thisMonthExpense = thisMonthTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netSavings = thisMonthIncome - thisMonthExpense;
      const savingsRate = thisMonthIncome > 0
        ? Math.max(0, Math.round((netSavings / thisMonthIncome) * 100))
        : 0;

      return {
        hasTransactions: true,
        intent,
        currentMonthName,
        totalIncome: thisMonthIncome,
        totalExpense: thisMonthExpense,
        netSavings,
        savingsRate: `${savingsRate}%`,
      };
    }

    case 'RECENT_TRANSACTIONS': {
      const recent = await Transaction.find({ user: userId })
        .sort({ transactionDate: -1 })
        .limit(5)
        .lean();

      return {
        hasTransactions: true,
        intent,
        transactions: recent.map((t) => ({
          description: t.description,
          amount: t.amount,
          category: t.category,
          type: t.type,
          date: new Date(t.transactionDate).toISOString().split('T')[0],
        })),
      };
    }

    case 'BUDGET_REMAINING': {
      const budgets = await Budget.find({
        user: userId,
        month: currentMonth,
        year: currentYear,
      }).lean();

      // If asking about a specific category budget
      if (category) {
        const catRegex = new RegExp(`^${category}$`, 'i');
        const catBudget = budgets.find((b) => catRegex.test(b.category));

        const catExpenses = await Transaction.find({
          user: userId,
          type: 'expense',
          category: catRegex,
          transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
        }).lean();

        const catSpent = catExpenses.reduce((sum, t) => sum + t.amount, 0);

        if (!catBudget) {
          return {
            hasTransactions: true,
            intent,
            category,
            hasBudget: false,
            spent: catSpent,
            currentMonthName,
          };
        }

        const remaining = Math.max(0, catBudget.amount - catSpent);
        const isOver = catSpent > catBudget.amount;
        const overAmount = isOver ? catSpent - catBudget.amount : 0;
        const spentPercentage = catBudget.amount > 0
          ? Math.round((catSpent / catBudget.amount) * 100)
          : 0;

        return {
          hasTransactions: true,
          intent,
          category,
          hasBudget: true,
          budgetLimit: catBudget.amount,
          spent: catSpent,
          remaining,
          isOverBudget: isOver,
          overAmount,
          spentPercentage,
          currentMonthName,
        };
      }

      // General monthly budget
      const thisMonthExpenses = await Transaction.find({
        user: userId,
        type: 'expense',
        transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }).lean();

      const categoryTotals = {};
      let overallExpense = 0;
      thisMonthExpenses.forEach((t) => {
        overallExpense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

      let totalLimit = 0;
      let totalSpent = 0;

      const budgetBreakdown = budgets.map((b) => {
        let spent = 0;
        if (b.category.toLowerCase() === 'overall') {
          spent = overallExpense;
        } else {
          spent = categoryTotals[b.category] || 0;
        }
        totalLimit += b.amount;
        totalSpent += spent;
        return {
          category: b.category,
          limit: b.amount,
          spent,
          remaining: Math.max(0, b.amount - spent),
          isOver: spent > b.amount,
        };
      });

      return {
        hasTransactions: true,
        intent,
        currentMonthName,
        hasBudget: budgets.length > 0,
        totalBudgetLimit: totalLimit,
        totalBudgetSpent: totalSpent,
        remainingBudget: Math.max(0, totalLimit - totalSpent),
        budgetBreakdown,
      };
    }

    case 'MONTH_COMPARISON': {
      const thisMonthTxs = await Transaction.find({
        user: userId,
        transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
      }).lean();

      const lastMonthTxs = await Transaction.find({
        user: userId,
        transactionDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }).lean();

      const thisMonthExpense = thisMonthTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const thisMonthIncome = thisMonthTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const lastMonthExpense = lastMonthTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const lastMonthIncome = lastMonthTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenseDiff = thisMonthExpense - lastMonthExpense;
      const expenseDiffPercent = lastMonthExpense > 0
        ? Math.round(((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100)
        : 0;

      return {
        hasTransactions: true,
        intent,
        currentMonthName,
        lastMonthName,
        thisMonthExpense,
        thisMonthIncome,
        lastMonthExpense,
        lastMonthIncome,
        expenseDiff,
        expenseDiffPercent,
      };
    }

    case 'SAVING_ADVICE': {
      if (category) {
        const catRegex = new RegExp(`^${category}$`, 'i');
        const catTxs = await Transaction.find({
          user: userId,
          type: 'expense',
          category: catRegex,
          transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
        }).lean();

        const catSpent = catTxs.reduce((sum, t) => sum + t.amount, 0);

        const allExpenses = await Transaction.find({
          user: userId,
          type: 'expense',
          transactionDate: { $gte: startOfThisMonth, $lte: endOfThisMonth },
        }).lean();

        const totalExpense = allExpenses.reduce((sum, t) => sum + t.amount, 0);
        const share = totalExpense > 0 ? Math.round((catSpent / totalExpense) * 100) : 0;

        return {
          hasTransactions: true,
          intent,
          category,
          categoryTotal: catSpent,
          transactionCount: catTxs.length,
          totalMonthlyExpense: totalExpense,
          sharePercentage: share,
          currentMonthName,
        };
      }

      // General saving advice
      const fullContext = await buildUserFinancialContext(userId);
      return {
        hasTransactions: true,
        intent,
        highestCategory: fullContext.highestCategory,
        highestCategoryAmount: fullContext.highestCategoryAmount,
        averageDailySpending: fullContext.averageDailySpending,
        thisMonthIncome: fullContext.thisMonthIncome,
        thisMonthExpense: fullContext.thisMonthExpense,
        savingsRate: fullContext.savingsRate,
        currentMonthName,
      };
    }

    default: {
      const fullContext = await buildUserFinancialContext(userId);
      return {
        ...fullContext,
        intent: 'GENERAL_FINANCIAL_QUERY',
        currentMonthName,
      };
    }
  }
};

/**
 * @desc    AI Chatbot assistant with live database context and intent routing
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chatAI = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Please provide a chat message' });
    }

    const userId = req.user._id;

    // 1. Fetch user's distinct categories from MongoDB for personalized entity extraction
    const userCategories = await Transaction.distinct('category', { user: userId });

    // 2. Detect user's query intent and entities
    const intentInfo = detectUserIntent(message.trim(), userCategories);

    // 3. Query MongoDB & calculate exact financial metrics
    const financialData = await calculateFinancialDataForIntent(userId, intentInfo);

    // 4. Generate AI natural response strictly grounded in verified database facts
    const reply = await chatWithFinancialAI(message.trim(), financialData, intentInfo);

    return res.status(200).json({
      success: true,
      reply,
      intent: intentInfo.intent,
    });
  } catch (error) {
    next(error);
  }
};

