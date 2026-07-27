import express from 'express';
import {
  parseAndCreateExpense,
  categorize,
  getMonthlyInsights,
  getBudgetAdvice,
  chatAI,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/parse-expense', parseAndCreateExpense);
router.post('/categorize', categorize);
router.get('/insights', getMonthlyInsights);
router.get('/budget-advice', getBudgetAdvice);
router.post('/chat', chatAI);

export default router;
