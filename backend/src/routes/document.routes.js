const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

function createDocumentRouter({ controller, storagePath }) {
  const router = express.Router();
  const upload = multer({
    storage: multer.diskStorage({
      destination: storagePath,
      filename: (_req, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      },
    }),
  });

  const uploadRateLimiter = rateLimit({ windowMs: 60_000, limit: 100 });
  router.post('/upload', uploadRateLimiter, upload.single('file'), controller.upload);
  router.get('/documents', controller.list);
  router.get('/documents/:id/download', controller.download);
  return router;
}

module.exports = createDocumentRouter;
