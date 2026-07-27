import express from 'express';
import { uploadReceipt } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post(
  '/receipt',
  (req, res, next) => {
    upload.single('receipt')(req, res, (err) => {
      if (err) {
        console.error('[Multer Error]', err.message);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
        });
      }
      next();
    });
  },
  uploadReceipt
);

export default router;

