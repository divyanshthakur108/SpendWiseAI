import express from 'express';
import {
  setBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(setBudget)
  .get(getBudgets);

router.route('/:id')
  .get(getBudgetById)
  .put(updateBudget)
  .delete(deleteBudget);

export default router;
