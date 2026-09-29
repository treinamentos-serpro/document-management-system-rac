const express = require('express');
const multer = require('multer');

function createUploadRateLimit({ windowMs = 60_000, max = 100 } = {}) {
  let windowStartedAt = Date.now();
  let requestCount = 0;

  return (_req, res, next) => {
    const now = Date.now();
    if (now - windowStartedAt >= windowMs) {
      windowStartedAt = now;
      requestCount = 0;
    }

    requestCount += 1;
    if (requestCount > max) {
      return res.status(429).json({ error: 'Limite de uploads excedido' });
    }

    return next();
  };
}

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

  router.post('/upload', createUploadRateLimit(), upload.single('file'), controller.upload);
  router.get('/documents', controller.list);
  router.get('/documents/:id/download', controller.download);
  return router;
}

module.exports = createDocumentRouter;
