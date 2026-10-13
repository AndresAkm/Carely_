import path from 'path';
import multer from 'multer';
import AppError from '../../common/errors/AppError.js';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new AppError('Formato de imagen no permitido. Usa JPG, PNG, WEBP, AVIF, GIF o SVG.', 400));
  }
  if (file.mimetype && !file.mimetype.startsWith('image/')) {
    return cb(new AppError('El archivo debe ser una imagen.', 400));
  }
  cb(null, true);
};

const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const uploadProductImage = (req, res, next) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      req.uploadError = err;
    }
    next();
  });
};

export { uploadImage, uploadProductImage };