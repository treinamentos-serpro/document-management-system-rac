const express = require('express');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

function requireOwner(req, res, next) {
  const owner = req.header('x-user-id')?.trim();
  if (!owner) {
    return res.status(400).json({ error: 'O header X-User-Id é obrigatório.' });
  }

  req.owner = owner;
  return next();
}

function createDocumentRouter({ controller, storagePath, maxFileSize }) {
  const router = express.Router();
  const upload = multer({
    limits: { fileSize: maxFileSize },
    storage: multer.diskStorage({
      destination: storagePath,
      filename: (_req, _file, callback) => {
        callback(null, randomUUID());
      },
    }),
  });

  const uploadRateLimiter = rateLimit({ windowMs: 60_000, limit: 100 });
  router.use('/upload', uploadRateLimiter);
  router.post('/upload', requireOwner, upload.single('file'), controller.upload);
  router.get('/documents', requireOwner, controller.list);
  router.get('/documents/:id/download', requireOwner, controller.download);
  return router;
}

module.exports = createDocumentRouter;
