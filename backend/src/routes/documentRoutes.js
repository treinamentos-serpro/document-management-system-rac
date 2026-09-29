const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');
const express = require('express');
const documentController = require('../controllers/documentController');

const router = express.Router();
const storageDirectory = path.resolve(
  process.env.STORAGE_DIR || path.join(__dirname, '../../storage'),
);

fs.mkdirSync(storageDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => callback(null, storageDirectory),
    filename: (req, file, callback) => callback(null, crypto.randomUUID()),
  }),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_BYTES) || 10 * 1024 * 1024,
  },
});

router.post(
  '/upload',
  documentController.requireOwner,
  upload.single('file'),
  documentController.upload,
);
router.get('/documents', documentController.requireOwner, documentController.list);
router.get(
  '/documents/:id/download',
  documentController.requireOwner,
  documentController.download,
);

module.exports = router;