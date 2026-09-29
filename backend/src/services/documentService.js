const crypto = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

function createDocument({ originalName, size, owner, filePath }) {
  const document = {
    id: crypto.randomUUID(),
    originalName,
    size,
    uploadedAt: new Date().toISOString(),
    owner,
    filePath,
  };

  return documentRepository.save(document);
}

function listDocuments(owner) {
  return documentRepository.findAllByOwner(owner);
}

function findDocument(id, owner) {
  return documentRepository.findByIdAndOwner(id, owner);
}

module.exports = { createDocument, listDocuments, findDocument };