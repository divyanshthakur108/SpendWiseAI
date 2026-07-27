import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected Routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logoutUser);

export default router;
