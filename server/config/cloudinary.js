const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isRealCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'demo_key';

let storage;

if (isRealCloudinary) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'voltkart',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    },
  });
} else {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });
}

const rawUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Middleware wrapper to ensure file.path is a web-accessible URL if local disk
const normalizeFiles = (req, res, next) => {
  if (req.file && req.file.filename && !req.file.path.startsWith('http')) {
    req.file.path = `/uploads/${req.file.filename}`;
  }
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(f => {
      if (f.filename && !f.path.startsWith('http')) {
        f.path = `/uploads/${f.filename}`;
      }
    });
  }
  next();
};

const upload = {
  single: (field) => [rawUpload.single(field), normalizeFiles],
  array: (field, max) => [rawUpload.array(field, max), normalizeFiles],
};

module.exports = { cloudinary, upload };
