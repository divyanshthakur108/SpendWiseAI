import express from 'express';
import { scanReceiptOCR } from '../controllers/ocrController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/scan', scanReceiptOCR);

export default router;
