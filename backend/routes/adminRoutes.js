import express from 'express';
import {
  getAdminStats,
  getUsers,
  toggleBlockUser,
  deleteUser,
  getCategories,
  createCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict protection: Only authenticated users with role === 'admin' can access
router.use(protect, admin);

// Dashboard Statistics
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

// Category Management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
