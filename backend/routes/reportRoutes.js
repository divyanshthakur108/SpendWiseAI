import express from 'express';
import { getReportSummary, exportCSV, exportPDF } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getReportSummary);
router.get('/monthly', getReportSummary); // Backward compatibility alias
router.get('/csv', exportCSV);
router.get('/export/csv', exportCSV); // Backward compatibility alias
router.get('/pdf', exportPDF);

export default router;
