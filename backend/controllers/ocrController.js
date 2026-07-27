import { processReceiptOCR } from '../services/ocrService.js';

/**
 * @desc    Scan receipt image & extract structured transaction details using OCR
 * @route   POST /api/ocr/scan
 * @access  Private
 */
export const scanReceiptOCR = async (req, res, next) => {
  try {
    const { imageUrl, rawText } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a receipt image URL for OCR scanning',
      });
    }

    const extractedData = await processReceiptOCR(imageUrl, rawText);

    return res.status(200).json({
      success: true,
      message: 'Receipt scanned & fields extracted successfully',
      data: extractedData,
    });
  } catch (error) {
    next(error);
  }
};
