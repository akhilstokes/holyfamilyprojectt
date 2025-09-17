const path = require('path');
const multer = require('multer');

// Storage configuration: saves files to /uploads with timestamped names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

// File filter to allow images and PDFs only (extendable)
const allowed = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf'
];

function fileFilter(req, file, cb) {
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Allowed: JPG, PNG, GIF, WEBP, PDF'));
}

// Max 10 MB per file
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;