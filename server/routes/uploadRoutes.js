const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// POST /api/uploads/document
// Protected: staff or any logged-in user
router.post('/document', protect, upload.single('file'), (req, res) => {
  // If multer passes here, file is saved
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  // Return metadata & public URL
  const urlPath = `/uploads/${file.filename}`;
  res.json({
    message: 'Upload successful',
    file: {
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      path: urlPath
    }
  });
});

module.exports = router;