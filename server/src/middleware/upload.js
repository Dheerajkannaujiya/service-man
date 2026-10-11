const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadBase = path.join(__dirname, '../../uploads');
const dirs = ['kyc', 'avatars', 'problems', 'chat'];
dirs.forEach(dir => {
  const dirPath = path.join(uploadBase, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'problems';
    if (req.baseUrl.includes('kyc') || req.path.includes('kyc')) folder = 'kyc';
    else if (req.baseUrl.includes('chat') || req.path.includes('chat')) folder = 'chat';
    else if (req.path.includes('avatar')) folder = 'avatars';
    cb(null, path.join(uploadBase, folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
    'application/pdf'
  ];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Allowed formats: JPEG, PNG, WEBP, PDF'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

module.exports = upload;
