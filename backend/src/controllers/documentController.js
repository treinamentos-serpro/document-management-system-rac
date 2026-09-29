const fs = require('node:fs');
const documentService = require('../services/documentService');

function getOwner(req, res) {
  if (req.owner) return req.owner;

  const owner = req.get('x-user-id')?.trim();

  if (!owner) {
    res.status(400).json({ error: 'O cabeçalho X-User-Id é obrigatório.' });
    return null;
  }

  return owner;
}

function requireOwner(req, res, next) {
  const owner = getOwner(req, res);
  if (!owner) return;

  req.owner = owner;
  return next();
}

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

function upload(req, res) {
  const owner = getOwner(req, res);
  if (!owner) return;

  if (!req.file) {
    return res.status(400).json({ error: 'Envie um arquivo no campo "file".' });
  }

  const document = documentService.createDocument({
    originalName: req.file.originalname,
    size: req.file.size,
    owner,
    filePath: req.file.path,
  });

  return res.status(201).json(toPublicDocument(document));
}

function list(req, res) {
  const owner = getOwner(req, res);
  if (!owner) return;

  return res.json(documentService.listDocuments(owner).map(toPublicDocument));
}

function download(req, res, next) {
  const owner = getOwner(req, res);
  if (!owner) return;

  const document = documentService.findDocument(req.params.id, owner);
  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  return fs.access(document.filePath, fs.constants.R_OK, (error) => {
    if (error) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    return res.download(document.filePath, document.originalName, (downloadError) => {
      if (downloadError && !res.headersSent) {
        return next(downloadError);
      }
    });
  });
}

module.exports = { requireOwner, upload, list, download };