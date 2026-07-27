import cloudinary from '../config/cloudinary.js';

/**
 * @desc    Upload receipt image to Cloudinary
 * @route   POST /api/upload/receipt
 * @access  Private
 */
export const uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      console.warn('[Upload Controller] No file found in request');
      return res.status(400).json({
        success: false,
        message: 'Please attach a receipt image file',
      });
    }

    console.log('[Upload Controller] File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
    });

    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_CLOUD_NAME.trim() !== '' &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

    if (isCloudinaryConfigured) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'spendwise_receipts',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        console.log('[Cloudinary Upload Success]', {
          url: result.secure_url,
          public_id: result.public_id,
        });

        return res.status(200).json({
          success: true,
          message: 'Receipt uploaded to Cloudinary successfully',
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (cloudinaryError) {
        console.error('[Cloudinary Upload API Error]', cloudinaryError);
        // Fallback to Data URI if Cloudinary SDK rejects due to bad credentials/network error
        const base64Data = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

        return res.status(200).json({
          success: true,
          message: 'Receipt image uploaded successfully (fallback URL)',
          url: dataUrl,
          public_id: `spendwise_receipts/${Date.now()}`,
        });
      }
    } else {
      console.log('[Upload Controller] Cloudinary credentials missing in .env. Using Data URI storage fallback.');
      const base64Data = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

      return res.status(200).json({
        success: true,
        message: 'Receipt image uploaded successfully',
        url: dataUrl,
        public_id: `spendwise_receipts/${Date.now()}`,
      });
    }
  } catch (error) {
    console.error('[Upload Controller Fatal Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Image upload to Cloudinary failed',
    });
  }
};

