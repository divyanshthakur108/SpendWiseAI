import { getReportSummaryService, getCSVReportService } from '../services/reportService.js';

/**
 * @desc    Get complete report summary for selected date range or preset
 * @route   GET /api/reports/summary
 * @access  Private
 */
export const getReportSummary = async (req, res, next) => {
  try {
    const reportData = await getReportSummaryService(req.user._id, req.query);

    return res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export transactions to CSV for selected date range
 * @route   GET /api/reports/csv
 * @access  Private
 */
export const exportCSV = async (req, res, next) => {
  try {
    const csvContent = await getCSVReportService(req.user._id, req.query);

    const filename = `spendwise_report_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export printable PDF report payload
 * @route   GET /api/reports/pdf
 * @access  Private
 */
export const exportPDF = async (req, res, next) => {
  try {
    const reportData = await getReportSummaryService(req.user._id, req.query);

    return res.status(200).json({
      success: true,
      message: 'PDF report payload generated',
      data: reportData,
    });
  } catch (error) {
    next(error);
  }
};
