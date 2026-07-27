import express from 'express';
import {
  getSummary,
  getMonthlyTrend,
  getCategories,
  getIncomeVsExpense,
  getRecentActivity,
  getSpendingStats,
  getDashboardAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/monthly', getMonthlyTrend);
router.get('/categories', getCategories);
router.get('/income-expense', getIncomeVsExpense);
router.get('/recent', getRecentActivity);
router.get('/stats', getSpendingStats);
router.get('/dashboard', getDashboardAnalytics);

export default router;
