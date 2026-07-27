import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

/**
 * Helper to compute warning level based on spent percentage
 */
const getWarningLevel = (spentPercentage) => {
  if (spentPercentage >= 100) return 'critical_100';
  if (spentPercentage >= 90) return 'warning_90';
  if (spentPercentage >= 80) return 'caution_80';
  return 'none';
};

/**
 * @desc    Create or update (Upsert) a monthly budget
 * @route   POST /api/budgets
 * @access  Private
 */
export const setBudget = async (req, res, next) => {
  try {
    const { category = 'Overall', amount, month, year } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Please provide a valid budget amount' });
    }

    const currentMonth = month ? Number(month) : new Date().getMonth() + 1;
    const currentYear = year ? Number(year) : new Date().getFullYear();

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        category: category.trim(),
        month: currentMonth,
        year: currentYear,
      },
      { amount: Number(amount) },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all budgets for current user with spending calculations & warnings
 * @route   GET /api/budgets
 * @access  Private
 */
export const getBudgets = async (req, res, next) => {
  try {
    const currentMonth = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
    const currentYear = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month: currentMonth,
      year: currentYear,
    }).sort({ category: 1 });

    // Calculate start & end date for the target month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Fetch all expense transactions for the month
    const monthExpenses = await Transaction.find({
      user: req.user._id,
      type: 'expense',
      transactionDate: { $gte: startDate, $lte: endDate },
    });

    // Compute spent amount per budget
    const enrichedBudgets = budgets.map((b) => {
      let spent = 0;
      if (b.category.toLowerCase() === 'overall') {
        spent = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
      } else {
        spent = monthExpenses
          .filter((tx) => tx.category.toLowerCase() === b.category.toLowerCase())
          .reduce((sum, tx) => sum + tx.amount, 0);
      }

      const remaining = Math.max(0, b.amount - spent);
      const spentPercentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      const warningLevel = getWarningLevel(spentPercentage);

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        spent,
        remaining,
        spentPercentage,
        warningLevel,
        month: b.month,
        year: b.year,
        createdAt: b.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedBudgets,
      month: currentMonth,
      year: currentYear,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single budget by ID with spending calculations
 * @route   GET /api/budgets/:id
 * @access  Private
 */
export const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59, 999);

    const query = {
      user: req.user._id,
      type: 'expense',
      transactionDate: { $gte: startDate, $lte: endDate },
    };

    if (budget.category.toLowerCase() !== 'overall') {
      query.category = { $regex: budget.category, $options: 'i' };
    }

    const expenses = await Transaction.find(query);
    const spent = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const remaining = Math.max(0, budget.amount - spent);
    const spentPercentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
    const warningLevel = getWarningLevel(spentPercentage);

    return res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        remaining,
        spentPercentage,
        warningLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update budget amount or details
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
export const updateBudget = async (req, res, next) => {
  try {
    const { amount, category } = req.body;

    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (amount !== undefined) budget.amount = Number(amount);
    if (category) budget.category = category.trim();

    await budget.save();

    return res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete budget by ID
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Budget removed successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};
