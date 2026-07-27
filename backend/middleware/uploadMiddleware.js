import multer from 'multer';

// Use memory storage for direct buffer upload to Cloudinary
const storage = multer.memoryStorage();

// File filter validation for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, etc.) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max limit
  },
});

export default upload;
