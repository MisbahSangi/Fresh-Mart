const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, and WEBP images are allowed'));
  }
  cb(null, true);
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Product image storage
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'freshmart/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit', quality: 'auto' }]
  }
});

// Profile image storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'freshmart/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }]
  }
});

const uploadProduct = multer({
  storage: productStorage,
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const uploadProfile = multer({
  storage: profileStorage,
  limits:  { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

module.exports = { cloudinary, uploadProduct, uploadProfile };