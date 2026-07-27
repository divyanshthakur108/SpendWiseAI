import {
  getSummaryAnalyticsService,
  getMonthlyTrendService,
  getCategoryAnalyticsService,
  getRecentActivityService,
  getSpendingStatsService,
  getBudgetProgressService,
} from '../services/analyticsService.js';

/**
 * @desc    Get dashboard summary metrics & health score
 * @route   GET /api/analytics/summary
 * @access  Private
 */
export const getSummary = async (req, res, next) => {
  try {
    const summary = await getSummaryAnalyticsService(req.user._id);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get 12-month spending trend & cash flow
 * @route   GET /api/analytics/monthly
 * @access  Private
 */
export const getMonthlyTrend = async (req, res, next) => {
  try {
    const trend = await getMonthlyTrendService(req.user._id);
    return res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get expense category analytics
 * @route   GET /api/analytics/categories
 * @access  Private
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await getCategoryAnalyticsService(req.user._id, req.query.timeframe);
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get income vs expense comparison data
 * @route   GET /api/analytics/income-expense
 * @access  Private
 */
export const getIncomeVsExpense = async (req, res, next) => {
  try {
    const trend = await getMonthlyTrendService(req.user._id);
    return res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent 10 transactions
 * @route   GET /api/analytics/recent
 * @access  Private
 */
export const getRecentActivity = async (req, res, next) => {
  try {
    const recent = await getRecentActivityService(req.user._id);
    return res.status(200).json({
      success: true,
      data: recent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get extended spending stats
 * @route   GET /api/analytics/stats
 * @access  Private
 */
export const getSpendingStats = async (req, res, next) => {
  try {
    const stats = await getSpendingStatsService(req.user._id);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full combined dashboard analytics in a single call for high performance
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const [summary, monthlyTrend, categoryAnalytics, recentActivity, spendingStats, budgetProgress] = await Promise.all([
      getSummaryAnalyticsService(req.user._id),
      getMonthlyTrendService(req.user._id),
      getCategoryAnalyticsService(req.user._id, req.query.timeframe || 'all'),
      getRecentActivityService(req.user._id),
      getSpendingStatsService(req.user._id),
      getBudgetProgressService(req.user._id),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        summary,
        monthlyTrend,
        categoryAnalytics,
        recentActivity,
        spendingStats,
        budgetProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};
